"""
main.py — TravelHUB Chatbot FastAPI Service (v2 — Intent-based Real-time Queries)

Architecture:
  1. LLM intent extractor → identifies what user wants + keyword (district/name)
  2. Direct Spring Boot API call with keyword → exact, real-time DB data
  3. LLM answer generator → precise answer from real data
  Fallback: ChromaDB RAG for open-ended / general questions
"""

import os
import json
import threading
import requests
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

from data_sync import sync_all_data, load_vectorstore

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")
AUTO_SYNC_INTERVAL_MINUTES = 5


# ──────────────────────────────────────────────
# Background auto-sync timer
# ──────────────────────────────────────────────

def _schedule_auto_sync():
    """Runs sync_all_data() and then reschedules itself after 5 minutes."""
    print(f"[AutoSync] ⏰ Running scheduled sync at {datetime.now().strftime('%H:%M:%S')}")
    try:
        sync_all_data()
    except Exception as e:
        print(f"[AutoSync] ❌ Error during auto-sync: {e}")
    finally:
        timer = threading.Timer(AUTO_SYNC_INTERVAL_MINUTES * 60, _schedule_auto_sync)
        timer.daemon = True
        timer.start()


# ──────────────────────────────────────────────
# Lifespan
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 60)
    print("🚀 TravelHUB Chatbot Service starting up (v2 — Real-time)...")
    print(f"   Port     : 8001")
    print(f"   Mode     : Intent detection + Live API queries")
    print(f"   Auto-sync: every {AUTO_SYNC_INTERVAL_MINUTES} minutes (fallback RAG)")
    print(f"   Started  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    print("[Startup] 🔄 Performing initial ChromaDB sync...")
    try:
        sync_all_data()
    except Exception as e:
        print(f"[Startup] ⚠️  Initial sync failed (will retry in {AUTO_SYNC_INTERVAL_MINUTES} min): {e}")

    timer = threading.Timer(AUTO_SYNC_INTERVAL_MINUTES * 60, _schedule_auto_sync)
    timer.daemon = True
    timer.start()
    print(f"[Startup] ✅ Auto-sync scheduled every {AUTO_SYNC_INTERVAL_MINUTES} minutes")

    yield
    print("[Shutdown] TravelHUB Chatbot Service stopped.")


# ──────────────────────────────────────────────
# FastAPI app
# ──────────────────────────────────────────────

app = FastAPI(
    title="TravelHUB Chatbot Service",
    description="Intent-based AI travel assistant with real-time DB queries",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Request / Response models
# ──────────────────────────────────────────────

class ChatRequest(BaseModel):
    prompt: str
    history: list = []


class ChatResponse(BaseModel):
    response: str


# ──────────────────────────────────────────────
# LLM instance (shared)
# ──────────────────────────────────────────────

def _get_llm():
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model_name="groq/compound-mini",
        temperature=0.2,
    )


# ──────────────────────────────────────────────
# Step 1: Intent extraction
# ──────────────────────────────────────────────

INTENT_PROMPT = """You are an intent extraction engine for a Sri Lanka travel chatbot.
Analyse the user's message and return a JSON object (no markdown, no explanation).

Possible intents:
- "package_search"  : user wants to find/list packages in a place
- "package_price"   : user asks about price of a specific package
- "hotel_search"    : user wants to find hotels in a place
- "hotel_price"     : user asks about hotel price/room rates
- "general"         : greeting, general Sri Lanka travel question, or unclear

Rules:
- Extract the most specific location/keyword mentioned (district, city, package name).
- For follow-up questions like "what is the price for this package", use the location from conversation context.
- If no specific location, return keyword as empty string.
- Always return valid JSON only.

Format:
{{"intent": "<intent>", "keyword": "<keyword or empty string>"}}

User message: {message}
Conversation context (last user messages): {context}

JSON:"""


def _extract_intent(user_message: str, context: str) -> dict:
    """Use LLM to extract intent and keyword from the user's message."""
    llm = _get_llm()
    prompt = INTENT_PROMPT.format(message=user_message, context=context)
    try:
        response = llm.invoke(prompt)
        raw = response.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
        print(f"[Intent] 🧠 Extracted: {result}")
        return result
    except Exception as e:
        print(f"[Intent] ⚠️  Failed to parse intent, defaulting to general: {e}")
        return {"intent": "general", "keyword": ""}


# ──────────────────────────────────────────────
# Step 2: Direct API data fetchers
# ──────────────────────────────────────────────

def _fetch_packages_by_keyword(keyword: str) -> list:
    """Real-time: fetch packages matching keyword directly from Spring Boot."""
    if not keyword:
        return []
    try:
        url = f"{SPRING_BOOT_URL}/api/packages/chatbot-search"
        resp = requests.get(url, params={"keyword": keyword}, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        print(f"[API] ✅ Live fetch: {len(data)} packages for keyword='{keyword}'")
        return data
    except Exception as e:
        print(f"[API] ❌ Live package fetch failed for '{keyword}': {e}")
        return []


def _fetch_hotels_by_keyword(keyword: str) -> list:
    """Real-time: fetch hotels matching keyword directly from Spring Boot."""
    if not keyword:
        return []
    try:
        url = f"{SPRING_BOOT_URL}/api/hotels/search"
        resp = requests.get(url, params={"query": keyword}, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        print(f"[API] ✅ Live fetch: {len(data)} hotels for keyword='{keyword}'")
        return data
    except Exception as e:
        print(f"[API] ❌ Live hotel fetch failed for '{keyword}': {e}")
        return []


# ──────────────────────────────────────────────
# Step 3: Format live data into context string
# ──────────────────────────────────────────────

def _format_packages(packages: list) -> str:
    """Format package list into a readable context string for the LLM."""
    if not packages:
        return ""
    lines = []
    for pkg in packages:
        price_from = pkg.get("priceFrom")
        price_to = pkg.get("priceTo")
        adult = pkg.get("basePriceAdult")
        child = pkg.get("basePriceChild")

        prices = []
        if price_from and price_to:
            prices.append(f"Total range: ${price_from} - ${price_to} USD")
        elif price_from:
            prices.append(f"Starts from ${price_from} USD")
        elif price_to:
            prices.append(f"Up to ${price_to} USD")

        if adult:
            child_str = f", ${child} USD/child" if child else ""
            prices.append(f"Base price: ${adult} USD/adult{child_str}")
        
        price_str = " | ".join(prices) if prices else "Contact agent for pricing"

        lines.append(
            f"- Package: {pkg.get('packageName', 'N/A')}"
            f" | District: {pkg.get('district', 'N/A')}"
            f" | Destination: {pkg.get('destination', 'N/A')}"
            f" | Duration: {pkg.get('duration', 'N/A')}"
            f" | Price: {price_str}"
            f" | Category: {pkg.get('category', 'N/A')}"
            f" | Agent: {pkg.get('agentName', 'N/A')}"
            f" | Rating: {pkg.get('rating', 'N/A')}"
        )
    return "\n".join(lines)


def _format_hotels(hotels: list) -> str:
    """Format hotel list into a readable context string for the LLM."""
    if not hotels:
        return ""
    lines = []
    for h in hotels:
        price_from = h.get("priceFrom")
        price_to = h.get("priceTo")
        if price_from and price_to:
            price_str = f"${price_from} - ${price_to} USD/night"
        elif price_from:
            price_str = f"from ${price_from} USD/night"
        else:
            price_str = "contact hotel for pricing"

        amenities = h.get("amenities", [])
        if isinstance(amenities, list):
            amenities_str = ", ".join(amenities) if amenities else "N/A"
        else:
            amenities_str = str(amenities)

        lines.append(
            f"- Hotel: {h.get('hotelName', 'N/A')}"
            f" | Location: {h.get('location', 'N/A')}"
            f" | District: {h.get('district', 'N/A')}"
            f" | Price: {price_str}"
            f" | Amenities: {amenities_str}"
        )
    return "\n".join(lines)


# ──────────────────────────────────────────────
# Step 4: Answer generation
# ──────────────────────────────────────────────

ANSWER_PROMPT_LIVE = """You are TravelHUB's friendly AI travel assistant for Sri Lanka.
Answer the tourist's question using ONLY the data below. Do not invent any details.
All prices are in USD.

STRICT RULES:
1. Use only proper English greetings and answers. Do NOT use "Namaste" or any other non-English greetings.
2. Be concise, accurate, and professional.

Live Data from Database:
{context}

Tourist's Question: {question}

Answer:"""

RAG_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are TravelHUB's friendly and knowledgeable AI travel assistant for Sri Lanka.
You help tourists discover travel packages, hotels, and destinations available on TravelHUB.

STRICT RULES:
1. Use ONLY the information provided in the context below.
2. All prices are in USD. Present as "$250 USD" or "$100 - $200 USD".
3. Never say "LKR". All prices are USD.
4. If the answer is not in the context, say "I don't have that information right now, but you can browse our full listings on TravelHUB."
5. Be concise, accurate, and enthusiastic about Sri Lanka travel.
6. Use only proper English greetings and answers. Do NOT use "Namaste" or any other non-English greetings.

Context:
{context}

Tourist's Question: {question}

Answer:""",
)


def _answer_with_live_data(context_str: str, question: str) -> str:
    """Generate an answer using directly fetched live data."""
    llm = _get_llm()
    prompt = ANSWER_PROMPT_LIVE.format(context=context_str, question=question)
    response = llm.invoke(prompt)
    return response.content.strip()


def _answer_with_rag(question: str) -> str:
    """Fallback: answer using ChromaDB vector search."""
    vectorstore = load_vectorstore()
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5},
    )
    llm = _get_llm()
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": RAG_PROMPT},
        return_source_documents=False,
    )
    result = qa_chain.invoke({"query": question})
    return result.get("result", "I couldn't generate a response. Please try again.")


# ──────────────────────────────────────────────
# In-memory context window is removed - using history from request
# ──────────────────────────────────────────────

# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "TravelHUB Chatbot v2",
        "mode": "intent-based real-time queries",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_prompt = request.prompt.strip()
    history = request.history
    if not user_prompt:
        return ChatResponse(response="Please type a question.")

    print(f"[Chat] 💬 User: {user_prompt[:120]}")

    try:
        # Build context from request history
        context_str = ""
        if history:
            context_str = "\n".join([
                f"{'User' if msg.get('role') == 'user' else 'Assistant'}: {msg.get('text', '')}"
                for msg in history[-6:]
            ])

        # Step 1: Extract intent + keyword
        intent_data = _extract_intent(user_prompt, context_str)
        intent = intent_data.get("intent", "general")
        keyword = intent_data.get("keyword", "").strip()

        answer = None

        # Step 2 & 3: Live API query based on intent
        if intent in ("package_search", "package_price") and keyword:
            packages = _fetch_packages_by_keyword(keyword)
            if packages:
                live_context = _format_packages(packages)
                answer = _answer_with_live_data(live_context, user_prompt)
            else:
                answer = (
                    f"I couldn't find any packages for '{keyword}' in our current listings. "
                    "You can browse all available packages on TravelHUB."
                )

        elif intent in ("hotel_search", "hotel_price") and keyword:
            hotels = _fetch_hotels_by_keyword(keyword)
            if hotels:
                live_context = _format_hotels(hotels)
                answer = _answer_with_live_data(live_context, user_prompt)
            else:
                answer = (
                    f"I couldn't find any hotels for '{keyword}' in our current listings. "
                    "You can browse all available hotels on TravelHUB."
                )

        # Step 4: Fallback to RAG for general questions
        if answer is None:
            print(f"[Chat] 🔍 Falling back to ChromaDB RAG (intent={intent}, keyword='{keyword}')")
            try:
                answer = _answer_with_rag(user_prompt)
            except Exception as rag_e:
                print(f"[Chat] ⚠️ RAG failed: {rag_e}")
                answer = "I'm having some trouble finding that information right now. Please try again later."

        print(f"[Chat] 🤖 Bot: {answer[:150]}...")
        return ChatResponse(response=answer)

    except Exception as e:
        print(f"[Chat] ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return ChatResponse(
            response="I'm having trouble right now. Please try again in a moment."
        )


@app.post("/sync")
async def manual_sync():
    print(f"[Sync] 📡 Manual sync triggered at {datetime.now().strftime('%H:%M:%S')}")
    try:
        sync_all_data()
        return {"status": "Sync complete", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        print(f"[Sync] ❌ Manual sync error: {e}")
        return {"status": f"Sync failed: {str(e)}", "timestamp": datetime.now().isoformat()}


@app.post("/notify-update")
async def notify_update(data: dict = None):
    print(f"[Notify] 🔔 Real-time update received: {data}")
    try:
        sync_all_data()
        return {
            "status": "Update synced immediately",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"[Notify] ❌ Sync after notification failed: {e}")
        return {
            "status": f"Sync failed: {str(e)}",
            "timestamp": datetime.now().isoformat(),
        }

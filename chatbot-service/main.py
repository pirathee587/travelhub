"""
main.py — TravelHUB Chatbot AI Service
========================================
Architecture: Direct Live Fetch (Real-Time)

On every /chat request:
  1. Fetch the current packages and hotels from Spring Boot (live database).
  2. Format the data as readable text context.
  3. Send [system_prompt + live_context + user_question] to Groq LLM.
  4. Return the AI-generated answer.

There is NO ChromaDB, NO vector embeddings, NO background scheduler,
and NO sync process. Every answer is always based on the current database.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from data_sync import fetch_all_live_data, fetch_live_packages
from dotenv import load_dotenv
import os
from typing import Optional

load_dotenv()

app = FastAPI(title="TravelHUB Chatbot AI Service — Real-Time Mode")

# Allow frontend to call this Python service directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Groq LLM — free tier, extremely fast
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile",
    temperature=0.3,
    max_tokens=600
)


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    prompt: str   # Field name matches what ChatbotButton.jsx sends


class ChatResponse(BaseModel):
    response: str   # Field name matches what ChatbotButton.jsx reads


# ─────────────────────────────────────────────────────────────────────────────
# System Prompt
# ─────────────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a friendly and knowledgeable tourist assistant for TravelHUB,
a travel platform for Sri Lanka.

You help tourists with:
- Finding travel packages that match their interests and budget
- Recommending hotels and accommodations
- Providing information about destinations across Sri Lanka
- Sharing travel tips and advice

IMPORTANT RULES:
1. Answer ONLY using the live TravelHUB data provided to you in each message
2. The data you receive is fetched directly from the live database right now — it is always current
3. If you cannot find relevant information in the provided data, say so honestly
4. Always mention specific package or hotel names when making recommendations
5. Format prices clearly (e.g. "$150 - $300 per person")
6. Be friendly, helpful, and concise
7. Only answer questions related to Sri Lanka travel and TravelHUB offerings"""


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chatbot endpoint — REAL-TIME mode.

    Flow:
      1. Receive user question from the frontend.
      2. Fetch ALL current packages and hotels from Spring Boot (live database).
      3. Build LLM prompt: system prompt + live data + user question.
      4. Send to Groq LLM and return the answer.

    Data is ALWAYS fetched fresh from the database on every single request.
    No caching. No ChromaDB. No staleness possible.
    """
    user_question = request.prompt.strip()
    print(f"\n[Chat] User question: {user_question}")

    # ── Step 1: Fetch live data from the database ──────────────────────────
    live_context, pkg_count, hotel_count = fetch_all_live_data()
    print(f"[Chat] Live data loaded — {pkg_count} packages, {hotel_count} hotels")

    # ── Step 2: Build context block ────────────────────────────────────────
    if live_context:
        context_block = f"""The following is LIVE data fetched directly from the TravelHUB database right now.
This data reflects the current state of all packages and hotels as of this moment.

{live_context}

---"""
    else:
        context_block = (
            "⚠️  Unable to fetch live data from the database at this moment. "
            "Please ensure the backend server is running and try again."
        )

    # ── Step 3: Build full prompt ──────────────────────────────────────────
    full_prompt = f"""{context_block}

Tourist question: {user_question}

Please answer based solely on the live TravelHUB data shown above."""

    # ── Step 4: Call Groq LLM ──────────────────────────────────────────────
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=full_prompt),
    ]

    ai_response = llm.invoke(messages)
    print(f"[Chat] ✅ Response generated successfully")

    return ChatResponse(response=ai_response.content)


@app.get("/health")
async def health():
    """
    Health check endpoint.
    Also verifies connectivity to the Spring Boot backend.
    Visit http://localhost:8001/health to confirm the service is running.
    """
    backend_status = "unknown"
    backend_url = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")

    try:
        import httpx
        resp = httpx.get(f"{backend_url}/api/packages/chatbot-data", timeout=5.0)
        backend_status = "reachable" if resp.status_code == 200 else f"error_{resp.status_code}"
    except Exception as e:
        backend_status = f"unreachable ({type(e).__name__})"

    return {
        "status": "ok",
        "service": "TravelHUB Chatbot — Real-Time Mode",
        "mode": "direct_live_fetch",
        "backend": backend_status,
        "note": "Every /chat request fetches live data from the database. No caching."
    }


@app.get("/packages")
async def packages(destination: Optional[str] = None):
    """
    Live packages lookup endpoint.
    Fetches current packages directly from Spring Boot.
    If `destination` is provided, filters by destination (case-insensitive).
    """
    all_packages = fetch_live_packages()

    if destination:
        filtered = [
            p for p in all_packages
            if isinstance(p.get("destination"), str)
            and p["destination"].lower() == destination.lower()
        ]
        return {"status": "ok", "packages": filtered, "count": len(filtered)}

    if not all_packages:
        return {"status": "no_data", "packages": [], "count": 0}

    return {"status": "ok", "packages": all_packages, "count": len(all_packages)}

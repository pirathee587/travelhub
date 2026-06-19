from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from apscheduler.schedulers.background import BackgroundScheduler
from data_sync import sync_all_data, search_relevant_data
from dotenv import load_dotenv
from datetime import datetime
import os
from typing import Optional

load_dotenv()

app = FastAPI(title="TravelHUB Chatbot AI Service")

# Allow Spring Boot to call this Python service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow direct frontend access for testing
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Groq LLM — free, extremely fast (under 1 second)
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile",
    temperature=0.3,
    max_tokens=500
)

# Request model — field name must be "prompt" to match ChatbotService.java
class ChatRequest(BaseModel):
    prompt: str

# Response model — field name must be "response" to match ChatbotWidget.jsx
class ChatResponse(BaseModel):
    response: str


SYSTEM_PROMPT = """You are a friendly and helpful tourist assistant for TravelHUB,
a travel platform for Sri Lanka.

You help tourists with:
- Finding travel packages that match their interests
- Recommending hotels and accommodations
- Providing information about destinations in Sri Lanka
- Giving travel tips and advice

IMPORTANT RULES:
1. Answer ONLY using the travel data provided to you in each message
2. If the data does not have enough information, say so honestly
3. Always mention specific package or hotel names when recommending
4. Format prices as dollar amounts
5. Be friendly, helpful, and concise
6. Only answer questions related to Sri Lanka travel"""


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chatbot endpoint.
    1. Receive tourist question from Spring Boot
    2. Search ChromaDB for relevant travel data
    3. Send data + question to Groq LLM
    4. Return AI answer
    """
    user_question = request.prompt.strip()

    # Search ChromaDB for top 5 most relevant packages/hotels
    relevant_docs = search_relevant_data(user_question, top_k=5)

    if relevant_docs:
        context = "\n\n".join(relevant_docs)
        context_block = f"""Here is the relevant TravelHUB data:
---
{context}
---"""
    else:
        context_block = "No specific travel data found for this query."

    # Build prompt: system identity + relevant data + tourist question
    full_prompt = f"""{context_block}

Tourist question: {user_question}

Please answer based on the TravelHUB data shown above."""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=full_prompt)
    ]

    ai_response = llm.invoke(messages)

    return ChatResponse(response=ai_response.content)


@app.post("/sync")
async def sync():
    """
    Re-sync all data from Spring Boot into ChromaDB.
    Spring Boot calls this when admin creates or updates a package or hotel.
    Also called on startup and periodically (every 5 minutes) to catch any missed updates.
    """
    sync_all_data()
    return {"status": "Sync completed"}


@app.post("/notify-update")
async def notify_update(data: dict = None):
    """
    ✅ REAL-TIME PUSH ENDPOINT: Spring Boot calls this when packages/hotels are created, updated, or deleted.
    Triggers immediate sync instead of waiting for the 5-minute interval.
    Ensures chatbot has latest data within seconds, not minutes.
    
    Usage by Spring Boot:
    - When package created: POST /notify-update {"type": "package", "action": "create"}
    - When hotel updated: POST /notify-update {"type": "hotel", "action": "update"}
    - When package deleted: POST /notify-update {"type": "package", "action": "delete"}
    """
    print(f"[Notify] Real-time update received: {data}")
    # Immediately sync all data instead of waiting for scheduled interval
    sync_all_data()
    return {"status": "Update synced immediately", "timestamp": str(datetime.now())}


@app.get("/health")
async def health():
    """Health check — open http://localhost:8001/health to verify service is running"""
    return {"status": "ok", "service": "TravelHUB Chatbot"}


@app.get("/packages")
async def packages(destination: Optional[str] = None):
    """
    Live packages endpoint.
    - If `destination` provided, returns packages matching that destination (case-insensitive).
    - Returns full package JSON from Spring Boot (no LLM summarization) for accuracy.
    """
    from data_sync import get_live_packages

    pkgs = get_live_packages(destination)
    if not pkgs:
        return {"status": "no_data", "packages": []}
    return {"status": "ok", "packages": pkgs}


@app.on_event("startup")
async def on_startup():
    """
    Runs when Python service starts:
    1. Immediately sync all data from Spring Boot into ChromaDB
    2. Schedule auto-sync every 5 minutes as a safety net
    3. Spring Boot will call /notify-update for real-time changes, so 5 min interval is just a fallback
    """
    print("[Startup] TravelHUB Chatbot AI service starting...")

    sync_all_data()

    # ✅ REDUCED FROM 30 MIN TO 5 MIN: Safety net sync in case push notifications are missed
    # Primary update mechanism is now push-based via /notify-update endpoint
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=sync_all_data,
        trigger="interval",
        minutes=5,
        id="auto_sync"
    )
    scheduler.start()
    print("[Startup] ✅ Chatbot ready! Primary: push-based updates via /notify-update. Fallback: auto-sync every 5 minutes.")

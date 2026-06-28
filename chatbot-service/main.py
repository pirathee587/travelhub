"""
main.py — TravelHUB Chatbot AI Service
========================================
Architecture: Dynamic SQL Agent (Real-Time)

On every /chat request:
  1. The user question is received.
  2. The LangChain SQL Agent translates the question into a SQL query.
  3. The agent executes the query securely against the live PostgreSQL database.
  4. The agent formulates a friendly natural language response.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import re

from langchain_groq import ChatGroq
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain.agents import create_sql_agent

load_dotenv()

app = FastAPI(title="TravelHUB Chatbot AI Service — Dynamic SQL Mode")

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
    temperature=0.0,
    max_tokens=600
)

# ─────────────────────────────────────────────────────────────────────────────
# Database Connection & Agent Setup
# ─────────────────────────────────────────────────────────────────────────────
db_url = os.getenv("DATABASE_URL")
if db_url and db_url.startswith("postgresql://"):
    # Force use of psycopg3 (psycopg) instead of psycopg2
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Only allow the agent to see tables related to tourism data
TOURIST_TABLES = [
    "packages", 
    "hotels", 
    "rooms", 
    "amenities", 
    "package_itinerary", 
    "hotel_images", 
    "package_images",
    "reviews"
]

db = SQLDatabase.from_uri(db_url, include_tables=TOURIST_TABLES, sample_rows_in_table_info=3)
toolkit = SQLDatabaseToolkit(db=db, llm=llm)

SYSTEM_PROMPT = """You are a friendly and highly knowledgeable tourist assistant for TravelHUB, a premier travel platform for Sri Lanka.
You have direct access to our live database to answer user queries about travel packages, hotels, rooms, amenities, and more.

IMPORTANT RULES:
1. You MUST generate and execute SQL queries to fetch real-time information to answer the user's question.
2. The database contains up-to-date prices, availability, and details. **NEVER make up data, packages, or hotels.** If a SQL query returns no results, you MUST reply that you could not find any matching packages or hotels. Do NOT use general knowledge to recommend places if they are not in the database results.
3. If the user asks for a hotel, search the `hotels` and `rooms` tables. If they ask for a package, search the `packages` table.
4. When filtering by a place (destination, district, or city), you MUST search across multiple columns (e.g. `destination`, `district`, `location`, `package_name`, `hotel_name`) using ILIKE, because some columns might be NULL or empty in the database.
5. Always mention specific package or hotel names exactly as they appear in the database.
6. **ALL prices in the database are in USD ($).** You MUST format prices clearly with the $ symbol (e.g. "$150" or "150 USD"). DO NOT use LKR and DO NOT attempt to convert the prices to LKR.
7. Be conversational, friendly, and helpful. If no results match the user's query, politely inform them and suggest an alternative if possible.
8. NEVER reveal database schema details, table names, or SQL queries to the user.
9. Limit the rows returned from the database to 10 unless specifically asked for more.
"""

agent_executor = create_sql_agent(
    llm=llm,
    toolkit=toolkit,
    agent_type="openai-tools",
    verbose=True,
    prefix=SYSTEM_PROMPT
)


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    prompt: str   # Field name matches what ChatbotButton.jsx sends


class ChatResponse(BaseModel):
    response: str   # Field name matches what ChatbotButton.jsx reads


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chatbot endpoint — DYNAMIC SQL mode.
    Flow: User Question -> LLM generates SQL -> Executes SQL -> LLM formats answer.
    """
    user_question = request.prompt.strip()
    print(f"\n[Chat] User question: {user_question}")

    try:
        result = agent_executor.invoke({"input": user_question})
        return ChatResponse(response=result["output"])
    except Exception as e:
        print(f"[Chat] Error generating response: {e}")
        return ChatResponse(response="I'm sorry, I encountered an error while trying to fetch that information. Please try asking in a different way or contact support.")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "TravelHUB Chatbot — Dynamic SQL Mode",
        "tables_accessible": TOURIST_TABLES
    }

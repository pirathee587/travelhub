"""
data_sync.py — TravelHUB Chatbot Live Data Fetcher
====================================================
This module fetches packages and hotels DIRECTLY from the Spring Boot
REST API on every chat request. There is no caching, no ChromaDB,
no vector embeddings, and no background sync.

Every time the chatbot answers a question, it calls these functions
to get the current state of the database. If a hotel price is updated
one second before the user asks, the chatbot will return the new price.
"""

import httpx
from dotenv import load_dotenv
import os

load_dotenv()

SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")


# ─────────────────────────────────────────────────────────────────────────────
# Response Normaliser
# ─────────────────────────────────────────────────────────────────────────────

def extract_list(raw) -> list:
    """
    Handles both response formats from Spring Boot:
      Format 1 (plain list):   [{...}, {...}]
      Format 2 (wrapped):      {"success": true, "data": [{...}]}
      Format 3 (other wrapper):{"response": [...]}
    """
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        for key in ["data", "response", "result", "packages", "hotels"]:
            if key in raw and isinstance(raw[key], list):
                return raw[key]
    return []


# ─────────────────────────────────────────────────────────────────────────────
# Text Formatters  (convert raw dicts → readable text for the LLM)
# ─────────────────────────────────────────────────────────────────────────────

def package_to_text(pkg: dict) -> str:
    """Converts a package dict (from Spring Boot) into a human-readable text
    block that is passed directly to the LLM as context."""
    price_from = pkg.get("priceFrom")
    price_to   = pkg.get("priceTo")

    if price_from is not None and price_to is not None:
        price_str = f"${price_from} - ${price_to} per person"
    elif price_from is not None:
        price_str = f"from ${price_from} per person"
    elif price_to is not None:
        price_str = f"up to ${price_to} per person"
    else:
        price_str = "price not specified"

    amenities_raw = pkg.get("amenities")
    if isinstance(amenities_raw, list):
        amenities_str = ", ".join(amenities_raw) if amenities_raw else "not listed"
    else:
        amenities_str = str(amenities_raw) if amenities_raw else "not listed"

    return (
        f"TRAVEL PACKAGE: {pkg.get('packageName', 'N/A')}\n"
        f"  Destination : {pkg.get('destination', 'N/A')}, {pkg.get('district', 'N/A')} District\n"
        f"  Category    : {pkg.get('category', 'N/A')}\n"
        f"  Duration    : {pkg.get('duration', 'N/A')} days/nights\n"
        f"  Price       : {price_str}\n"
        f"  Rating      : {pkg.get('rating', 'N/A')}/5 stars\n"
        f"  Starts from : {pkg.get('startPlace', 'N/A')}\n"
        f"  Ends at     : {pkg.get('endPlace', 'N/A')}\n"
        f"  Details     : {pkg.get('festivalDetails', 'No additional details')}\n"
        f"  Agent       : {pkg.get('agentName', 'Unknown provider')}\n"
        f"  Package ID  : {pkg.get('id', 'N/A')}"
    )


def hotel_to_text(hotel: dict) -> str:
    """Converts a hotel dict (from Spring Boot) into a human-readable text
    block that is passed directly to the LLM as context."""
    price_from = hotel.get("priceFrom")
    price_to   = hotel.get("priceTo")

    if price_from is not None and price_to is not None:
        price_str = f"${price_from} - ${price_to} per night"
    elif price_from is not None:
        price_str = f"from ${price_from} per night"
    elif price_to is not None:
        price_str = f"up to ${price_to} per night"
    else:
        price_str = "price range not specified"

    amenities_raw = hotel.get("amenities")
    if isinstance(amenities_raw, list):
        amenities_str = ", ".join(amenities_raw) if amenities_raw else "not listed"
    else:
        amenities_str = str(amenities_raw) if amenities_raw else "not listed"

    return (
        f"HOTEL: {hotel.get('hotelName', 'N/A')}\n"
        f"  Destination : {hotel.get('destination', 'N/A')}, {hotel.get('district', 'N/A')} District\n"
        f"  Location    : {hotel.get('location', 'N/A')}\n"
        f"  Price       : {price_str}\n"
        f"  Rating      : {hotel.get('rating', 'N/A')}/5 stars\n"
        f"  Amenities   : {amenities_str}\n"
        f"  Description : {hotel.get('description', 'No description available')}\n"
        f"  Hotel ID    : {hotel.get('id', 'N/A')}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Live Fetchers  (called on EVERY /chat request — no caching)
# ─────────────────────────────────────────────────────────────────────────────

def fetch_live_packages() -> list:
    """
    Fetches ALL active packages from the Spring Boot backend right now.
    Returns a list of raw package dicts from the live database.
    Called on every chat request — always returns current data.
    """
    try:
        response = httpx.get(
            f"{SPRING_BOOT_URL}/api/packages/chatbot-data",
            timeout=30.0
        )
        response.raise_for_status()
        raw = response.json()
        packages = extract_list(raw)
        print(f"[LiveFetch] ✅ Fetched {len(packages)} active packages from live database")
        return packages
    except httpx.HTTPStatusError as e:
        print(f"[LiveFetch] ❌ HTTP {e.response.status_code} fetching packages: {e}")
    except httpx.RequestError as e:
        print(f"[LiveFetch] ❌ Connection error fetching packages: {e}")
    except Exception as e:
        print(f"[LiveFetch] ❌ Unexpected error fetching packages: {e}")
    return []


def fetch_live_hotels() -> list:
    """
    Fetches ALL approved hotels from the Spring Boot backend right now.
    Returns a list of raw hotel dicts from the live database.
    Called on every chat request — always returns current data.
    """
    try:
        response = httpx.get(
            f"{SPRING_BOOT_URL}/api/hotels/chatbot-data",
            timeout=30.0
        )
        response.raise_for_status()
        raw = response.json()
        hotels = extract_list(raw)
        print(f"[LiveFetch] ✅ Fetched {len(hotels)} approved hotels from live database")
        return hotels
    except httpx.HTTPStatusError as e:
        print(f"[LiveFetch] ❌ HTTP {e.response.status_code} fetching hotels: {e}")
    except httpx.RequestError as e:
        print(f"[LiveFetch] ❌ Connection error fetching hotels: {e}")
    except Exception as e:
        print(f"[LiveFetch] ❌ Unexpected error fetching hotels: {e}")
    return []


def fetch_all_live_data() -> tuple[str, int, int]:
    """
    Master function called by the /chat endpoint on every user question.

    Fetches the latest packages and hotels from the live Spring Boot database,
    converts them into readable text blocks, and returns a single formatted
    context string ready to be injected into the LLM prompt.

    Returns:
        context_text (str) : All packages + hotels as formatted text for the LLM.
        pkg_count    (int) : Number of packages fetched.
        hotel_count  (int) : Number of hotels fetched.
    """
    packages = fetch_live_packages()
    hotels   = fetch_live_hotels()

    context_parts = []

    if packages:
        context_parts.append("=== AVAILABLE TRAVEL PACKAGES ===")
        for pkg in packages:
            if isinstance(pkg, dict):
                context_parts.append(package_to_text(pkg))

    if hotels:
        context_parts.append("\n=== AVAILABLE HOTELS ===")
        for hotel in hotels:
            if isinstance(hotel, dict):
                context_parts.append(hotel_to_text(hotel))

    context_text = "\n\n".join(context_parts) if context_parts else ""
    return context_text, len(packages), len(hotels)

import httpx
import chromadb
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os

load_dotenv()

SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")

chroma_client = chromadb.PersistentClient(path="./chroma_data")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

collection = chroma_client.get_or_create_collection(
    name="travelhub_data",
    metadata={"hnsw:space": "cosine"}
)


def extract_list(raw):
    """
    Handles both response formats:
    Format 1 (plain list):   [ {...}, {...} ]
    Format 2 (wrapped):      { "success": true, "data": [ {...}, {...} ] }
    Format 3 (other wrapper):{ "response": [...] }
    """
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        # Try common wrapper keys
        for key in ["data", "response", "result", "packages", "hotels"]:
            if key in raw and isinstance(raw[key], list):
                return raw[key]
    return []


def package_to_text(pkg: dict) -> str:
    """
    ✅ ENHANCED: Converts package dict to searchable text for LLM embedding.
    Ensures all fields including prices are properly included.
    Validates that price data is not null or empty.
    """
    # Extract and validate price data
    price_from = pkg.get('priceFrom')
    price_to = pkg.get('priceTo')
    
    # Format prices - show them even if one is missing
    if price_from is not None and price_to is not None:
        price_str = f"${price_from} - ${price_to}"
    elif price_from is not None:
        price_str = f"${price_from} onwards"
    elif price_to is not None:
        price_str = f"Up to ${price_to}"
    else:
        price_str = "Price not specified"
    
    # Build comprehensive text with all available details
    text = (
        f"Travel Package: {pkg.get('packageName', 'N/A')} "
        f"in {pkg.get('destination', 'N/A')}, {pkg.get('district', 'N/A')} District. "
        f"Category: {pkg.get('category', 'N/A')}. "
        f"Duration: {pkg.get('duration', 'N/A')} days/nights. "
        f"Price Range: {price_str} per person. "
        f"Rating: {pkg.get('rating', 'Unrated')}/5 stars. "
        f"Starts from: {pkg.get('startPlace', 'N/A')}. "
        f"Ends at: {pkg.get('endPlace', 'N/A')}. "
        f"Package Details: {pkg.get('festivalDetails', 'No additional details')}. "
        f"Agent: {pkg.get('agentName', 'Unknown provider')}.")

    # Append a small metadata block to make numerical fields explicit for the LLM
    meta_lines = []
    meta_lines.append(f"PRICE_FROM: {price_from if price_from is not None else 'NULL'}")
    meta_lines.append(f"PRICE_TO: {price_to if price_to is not None else 'NULL'}")
    meta_lines.append(f"PACKAGE_ID: {pkg.get('id', 'N/A')}")
    meta_lines.append(f"AGENT: {pkg.get('agentName', 'N/A')}")

    text += "\n\n" + "\n".join(meta_lines)

    return text


def hotel_to_text(hotel: dict) -> str:
    """
    ✅ ENHANCED: Converts hotel dict to searchable text for LLM embedding.
    Ensures all fields including prices are properly included.
    Validates that price data is not null or empty.
    """
    # Extract and validate price data
    price_from = hotel.get('priceFrom')
    price_to = hotel.get('priceTo')
    
    # Format prices - show them even if one is missing
    if price_from is not None and price_to is not None:
        price_str = f"${price_from} - ${price_to} per night"
    elif price_from is not None:
        price_str = f"From ${price_from} per night"
    elif price_to is not None:
        price_str = f"Up to ${price_to} per night"
    else:
        price_str = "Price range not specified"
    
    # Build comprehensive text with all available details
    text = (
        f"Hotel: {hotel.get('hotelName', 'N/A')} "
        f"in {hotel.get('destination', 'N/A')}, {hotel.get('district', 'N/A')} District. "
        f"Location: {hotel.get('location', 'N/A')}. "
        f"Price per night: {price_str}. "
        f"Rating: {hotel.get('rating', 'Unrated')}/5 stars. "
        f"Amenities: {hotel.get('amenities', 'No amenities listed')}. "
        f"Description: {hotel.get('description', 'No description available')}."
    )
    
    return text


def sync_all_data():
    print("[Sync] Starting data sync from Spring Boot...")

    documents = []
    ids = []
    metadatas = []

    # Fetch packages
    try:
        response = httpx.get(
            f"{SPRING_BOOT_URL}/api/packages/chatbot-data",
            timeout=30.0
        )
        response.raise_for_status()  # Raise exception for HTTP errors
        raw = response.json()
        print(f"[Sync] Raw package response type: {type(raw)}")

        packages = extract_list(raw)
        print(f"[Sync] ✅ Fetched {len(packages)} active packages from database")

        for pkg in packages:
            if not isinstance(pkg, dict):
                continue
            
            # ✅ VALIDATE: Ensure all critical fields are present
            pkg_name = pkg.get('packageName', 'Unknown')
            pkg_id = pkg.get('id', 'Unknown')
            price_from = pkg.get('priceFrom')
            price_to = pkg.get('priceTo')
            destination = pkg.get('destination', 'Unknown')
            district = pkg.get('district', 'Unknown')
            
            # Log package details for debugging price mismatches
            print(f"[Sync]   Package: {pkg_name} (ID: {pkg_id}) | Location: {destination}, {district} | Price: ${price_from} - ${price_to}")
            
            text = package_to_text(pkg)
            documents.append(text)
            ids.append(f"package_{pkg['id']}")
            metadatas.append({
                "type": "package",
                "id": str(pkg.get("id", "")),
                "name": str(pkg_name),
                "district": str(district),
                "destination": str(destination),
                "category": str(pkg.get("category", "")),
                # Store numeric prices where available to avoid string parsing issues
                "priceFrom": price_from if price_from is not None else None,
                "priceTo": price_to if price_to is not None else None
            })

    except httpx.HTTPError as e:
        print(f"[Sync] ❌ HTTP ERROR fetching packages: {e}")
    except Exception as e:
        print(f"[Sync] ❌ ERROR fetching packages: {e}")

    # Fetch hotels
    try:
        response = httpx.get(
            f"{SPRING_BOOT_URL}/api/hotels/chatbot-data",
            timeout=30.0
        )
        response.raise_for_status()  # Raise exception for HTTP errors
        raw = response.json()
        print(f"[Sync] Raw hotel response type: {type(raw)}")

        hotels = extract_list(raw)
        print(f"[Sync] ✅ Fetched {len(hotels)} approved hotels from database")

        for hotel in hotels:
            if not isinstance(hotel, dict):
                continue
            text = hotel_to_text(hotel)
            documents.append(text)
            ids.append(f"hotel_{hotel['id']}")
            metadatas.append({
                "type": "hotel",
                "id": str(hotel.get("id", "")),
                "name": str(hotel.get("hotelName", "")),
                "district": str(hotel.get("district", "")),
                "priceFrom": hotel.get("priceFrom") if hotel.get("priceFrom") is not None else None,
                "priceTo": hotel.get("priceTo") if hotel.get("priceTo") is not None else None
            })

    except httpx.HTTPError as e:
        print(f"[Sync] ❌ HTTP ERROR fetching hotels: {e}")
    except Exception as e:
        print(f"[Sync] ❌ ERROR fetching hotels: {e}")

    if not documents:
        print("[Sync] ⚠️  WARNING: No data fetched from Spring Boot. Check if backend is running.")
        print(f"[Sync] Trying to connect to: {SPRING_BOOT_URL}")
        return

    print(f"[Sync] 📊 Total items to embed: {len(documents)} (packages + hotels)")
    print(f"[Sync] Embedding documents into ChromaDB...")
    embeddings = embedding_model.encode(documents).tolist()

    global collection
    try:
        # Delete old collection to ensure fresh data
        chroma_client.delete_collection("travelhub_data")
        print("[Sync] Cleared old ChromaDB collection")
    except Exception:
        pass

    collection = chroma_client.get_or_create_collection(
        name="travelhub_data",
        metadata={"hnsw:space": "cosine"}
    )

    # Sanitize metadata values to avoid None or complex types (Chroma requires primitives)
    clean_metadatas = [sanitize_metadata(m) for m in metadatas]

    collection.add(
        documents=documents,
        embeddings=embeddings,
        ids=ids,
        metadatas=clean_metadatas
    )

    print(f"[Sync] ✅ SYNC COMPLETE! {len(documents)} items now in ChromaDB with latest database state")
    print(f"[Sync] Chatbot is ready to provide accurate recommendations based on current offerings")


def search_relevant_data(query: str, top_k: int = 5) -> list:
    query_embedding = embedding_model.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k
    )
    # Combine document text with explicit metadata for clarity
    combined = []
    if not results:
        return []

    docs = results.get("documents")
    metas = results.get("metadatas")

    if not docs:
        return []

    # Chroma returns lists of result lists; take the first query result set
    docs_list = docs[0] if isinstance(docs, list) and len(docs) > 0 else docs
    metas_list = metas[0] if metas and isinstance(metas, list) and len(metas) > 0 else metas

    for idx, doc in enumerate(docs_list):
        meta = None
        try:
            meta = metas_list[idx] if metas_list and idx < len(metas_list) else None
        except Exception:
            meta = None

        # Build a small metadata block if available
        meta_block = ""
        if isinstance(meta, dict):
            pairs = []
            # Include numeric price fields explicitly if present
            if "priceFrom" in meta:
                pairs.append(f"priceFrom: {meta.get('priceFrom')}")
            if "priceTo" in meta:
                pairs.append(f"priceTo: {meta.get('priceTo')}")
            # include id and type
            if "id" in meta:
                pairs.append(f"id: {meta.get('id')}")
            if "type" in meta:
                pairs.append(f"type: {meta.get('type')}")
            if pairs:
                meta_block = "\n\nMETADATA:\n" + "\n".join(pairs)

        combined.append(str(doc) + meta_block)

    return combined


def get_live_packages(destination: str = None) -> list:
    """
    Fetch packages directly from Spring Boot and optionally filter by destination.
    Returns the raw package dicts so callers can present full structured data.
    """
    try:
        response = httpx.get(f"{SPRING_BOOT_URL}/api/packages/chatbot-data", timeout=30.0)
        response.raise_for_status()
        raw = response.json()
        packages = extract_list(raw)
        if destination:
            filtered = []
            for p in packages:
                # normalize comparison
                dest = p.get('destination') or p.get('place') or ""
                if isinstance(dest, str) and dest.lower() == destination.lower():
                    filtered.append(p)
            return filtered
        return packages
    except httpx.HTTPError as e:
        print(f"[Sync] ❌ HTTP ERROR fetching live packages: {e}")
    except Exception as e:
        print(f"[Sync] ❌ ERROR fetching live packages: {e}")
    return []


def sanitize_metadata(metadata: dict) -> dict:
    """
    Ensure metadata values are only primitive types supported by ChromaDB.
    Converts None to empty string and other non-primitive values to strings.
    """
    clean = {}
    for k, v in (metadata or {}).items():
        if isinstance(v, (str, int, float, bool)):
            clean[k] = v
        elif v is None:
            clean[k] = ""
        else:
            try:
                clean[k] = str(v)
            except Exception:
                clean[k] = ""
    return clean

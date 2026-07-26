import logfire
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.config import settings
from app.services.retrieval.embedding import embed_query


# Initialize Qdrant Client
client = QdrantClient(
    url=settings.QDRANT_CLUSTER_ENDPOINT,
    api_key=settings.QDRANT_API_KEY
)

def get_collection_name(tenant_id: str) -> str:
    """Mengembalikan nama collection berdasarkan tenant_id. Jika default, gunakan nama lama."""
    if not tenant_id or tenant_id == "default":
        return settings.QDRANT_COLLECTION
    return f"{tenant_id}_knowledge"

def search_enterprise_knowledge(query: str, limit: int = 8, tenant_id: str = "default"):
    """
    Performs a high-precision search in the enterprise knowledge base.
    Uses the modern query_points interface.
    """
    try:
        query_vector = embed_query(query)
        target_collection = get_collection_name(tenant_id)

        # Using query_points - the modern standard for Qdrant
        response = client.query_points(
            collection_name=target_collection,
            query=query_vector,
            limit=limit,
            with_payload=True # JSON
        )

        results = []
        for res in response.points:
            results.append({
                "content": res.payload.get("text", ""),
                "source": res.payload.get("source", "Unknown"),
                "score": res.score
            })
        
        return results
    except Exception as e:
        logfire.error(f"❌ Qdrant Search Failed: {e}")
        return []

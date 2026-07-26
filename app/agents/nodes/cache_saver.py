from app.agents.state import AgentState
from app.config import settings
import logfire
import time
from app.services.retrieval.qdrant_service import client
from app.services.retrieval.embedding import embed_query
from qdrant_client.models import PointStruct
import uuid

def get_cache_name(tenant_id: str) -> str:
    """Mengembalikan nama collection cache berdasarkan tenant_id. Jika default, gunakan nama lama."""
    if not tenant_id or tenant_id == "default":
        return settings.QDRANT_COLLECTION_CACHE_NAME
    return f"{tenant_id}_cache"

def save_cache_node(state: AgentState):
    start_time = time.time()
    history = ""
    for msg in state["messages"][:-1]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history += f"{role}: {msg['content']}"
    
    contextualizer_query = state["contextualized_query"]
    tenant_id = state.get("tenant_id", "default")
    
    final_answer = state["final_answer"]
    
    query_vector = embed_query(contextualizer_query)
    target_cache = get_cache_name(tenant_id)
    
    logfire.info(f"Menyimpan hasil jawaban final untuk cache (Tenant: {tenant_id})")
    
    try:
        client.upsert(
            collection_name=target_cache,
            points=[
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=query_vector,
                    payload={"query": contextualizer_query,
                             "answer": final_answer}
                )
            ],
            wait=True
        )
        logfire.info("Berhasil menyimpan hasil jawaban pada cache")
    except Exception as e:
        logfire.error(f"Gagal menyimpan ke cache (Non-fatal error): {e}")
    logfire.info(f"⏱️ [Cache Saver] Execution Time: {time.time() - start_time:.2f} seconds")
    return {}
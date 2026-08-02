from app.agents.state import AgentState
from app.config import settings
import logfire
import time
from app.services.retrieval.qdrant_service import client
from app.services.retrieval.embedding import embed_query

def get_cache_name(tenant_id: str) -> str:
    """Mengembalikan nama collection cache berdasarkan tenant_id. Jika default, gunakan nama lama."""
    if not tenant_id or tenant_id == "default":
        return settings.QDRANT_COLLECTION_CACHE_NAME
    return f"{tenant_id}_cache"

def cache_node ( state: AgentState):
    """
    Planner node ditujukan untuk dapat memberikan arah terkait input yang diberikan,
    arah tersebut akan mengatur node mana yang akan dijalankan apakah memerlukan retriever dari database vector atau bisa langsung dijawab secara direct
    Args:
        state (AgentState) : State AI Agent
    """
    start_time = time.time()
     
    # user_message = ""
    # for msg in reversed(state["messages"]):
    #     if msg["role"] == "user":
    #         user_message = msg["content"]
    #         break
    
    search_query= state["contextualized_query"]
    tenant_id = state.get("tenant_id", "default")
    
    logfire.info(f"Memeriksa query (Cache hit or miss) untuk tenant: {tenant_id}")
    query_vector = embed_query(search_query)
    target_cache = get_cache_name(tenant_id)
    
    logfire.info("Embed query")
    try:
        search_result = client.query_points(
                collection_name=target_cache,
                query=query_vector,
                limit=1,
        )
        
        if search_result.points:
            logfire.info(f"Top cache score: {search_result.points[0].score}")
            if search_result.points[0].score > 0.98:
                cached_answer = search_result.points[0].payload.get("answer")
                
                logfire.info("Cache Hit, mengeluarkan jawaban dari cache")
                logfire.info(f"⏱️ [Cache Checker] Execution Time: {time.time() - start_time:.2f} seconds")
                return {"final_answer" : cached_answer,
                        "cache_hit": True,
                        "messages": [{"role": "assistant", "content": cached_answer}]}
    except Exception as e:
        logfire.error(f"Gagal memeriksa cache Qdrant (Non-fatal, continuing to RAG): {e}")
    
    logfire.info("Cache miss, lanjutkan ke node berikutnya")
    logfire.info(f"⏱️ [Cache Checker] Execution Time: {time.time() - start_time:.2f} seconds")
    return {"cache_hit": False}
    


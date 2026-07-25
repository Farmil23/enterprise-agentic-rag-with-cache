from app.agents.state import AgentState
from app.config import settings
import logfire
import time
from app.services.retrieval.qdrant_service import client
from app.services.retrieval.embedding import embed_query
from qdrant_client.models import PointStruct
import uuid


def save_cache_node(state: AgentState):
    start_time = time.time()
    history = ""
    for msg in state["messages"][:-1]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history += f"{role}: {msg['content']}"
    
    contextualizer_query = state["contextualized_query"]
    
    final_answer = state["final_answer"]
    
    query_vector = embed_query(contextualizer_query)
    
    logfire.info("Menyimpan hasil jawaban final untuk cache")
    client.upsert(
        collection_name=settings.QDRANT_COLLECTION_CACHE_NAME,
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
    logfire.info(f"⏱️ [Cache Saver] Execution Time: {time.time() - start_time:.2f} seconds")
    return state
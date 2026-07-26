import logfire
import time
from app.agents.state import AgentState
from app.services.retrieval.qdrant_service import search_enterprise_knowledge
from app.services.retrieval.ranking_service import rerank_documents

def retrieve_node(state: AgentState):
    """
    Performs vector search and semantic reranking for technical queries.
    """
    query = state["current_query"]
    tenant_id = state.get("tenant_id", "default")
    start_time = time.time()
    
    
    # Standard Retrieval Logic
    with logfire.span("🔍 Knowledge Retrieval"):
        logfire.info(f"Searching Qdrant for: {query} (Tenant: {tenant_id})")
        raw_results = search_enterprise_knowledge(query, limit=15, tenant_id=tenant_id)
        logfire.info(f"Retrieved {len(raw_results)} candidates from Vector DB")
        
        doc_contents = [doc['content'] for doc in raw_results]
        
        with logfire.span("⚖️ Semantic Reranking"):
            reranked_contents = rerank_documents(query, doc_contents, top_n=5)
            logfire.info("Reranking complete. Kept top 5 most relevant chunks.")
            
        formatted_docs = [f"CONTENT: {doc}" for doc in reranked_contents]
    
    logfire.info(f"⏱️ [Retriever] Execution Time: {time.time() - start_time:.2f} seconds")
    return {
        "documents": formatted_docs,
        "status": f"Found technical context.",
        "plan": state["plan"] + ["Context Retrieved"]
    }
  
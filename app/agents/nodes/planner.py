from app.agents.state import AgentState
from app.services.llm_gateway import get_robust_llm
import logfire
import time

# Memanggil LLM Gateway
llm = get_robust_llm(temperature=0, is_fast=True)

def planner_node ( state: AgentState):
    """
    Planner node ditujukan untuk dapat memberikan arah terkait input yang diberikan,
    arah tersebut akan mengatur node mana yang akan dijalankan apakah memerlukan retriever dari database vector atau bisa langsung dijawab secara direct
    Args:
        state (AgentState) : State AI Agent
    """
    start_time = time.time()
    
    history = ""
    # Hanya ambil 6 pesan terakhir
    for msg in state["messages"][-7:-1]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history += f"{role}: {msg['content']}"
        
    user_message = state["messages"][-1]["content"] if state["messages"] else ""
    
    prompt = f"""
        You are an intelligent Assistant Planner. 
        Analyze the conversation history and the latest user message.
        
        CONVERSATION HISTORY:
        {history}
        
        LATEST MESSAGE:
        "{user_message}"
        
        Task:
        1. If the latest message is a greeting (hi, hello) or a question that can be answered using ONLY the conversation history above (e.g., "what is my name"), respond with 'CONVERSATIONAL'.
        2. If it is a technical question about Kubernetes, Intel, or Networking that requires fresh documentation, output a refined search query.
        
        Output ONLY 'CONVERSATIONAL' or the search query.
    """
    
    with logfire.span("🧠 Planner Decision"):
        decision = llm.invoke(prompt).content.strip()
        logfire.info(f"Intent identified: {decision}")
    
    if decision == "CONVERSATIONAL":
        logfire.info(f"⏱️ [Planner] Execution Time: {time.time() - start_time:.2f} seconds")
        return {
            "current_query": "CONVERSATIONAL",
            "status": "Handling conversationally (using memory)...",
            "plan": ["Intent: Conversational/Memory", "Retrieval: Skipped"]
        }
    
    logfire.info(f"⏱️ [Planner] Execution Time: {time.time() - start_time:.2f} seconds")
    return {
        "current_query": decision,
        "status": f"Technical research needed. Searching for: {decision}",
        "plan": ["Intent: Technical", f"Search Term: {decision}"]
    }
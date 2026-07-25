from app.agents.state import AgentState
from app.services.llm_gateway import get_robust_llm
import logfire
import time


# Memanggil LLM Gateway
llm = get_robust_llm(temperature=0)

def generate_node(state: AgentState):
    start_time = time.time()
    query = state["current_query"]
     
    history_str = ""
    # Hanya ambil 6 pesan terakhir
    for msg in state["messages"][-7:-1]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_str += f"{role}: {msg['content']}"
    
    user_msg = state["messages"][-1]["content"] if state["messages"] else ""
    
    if query == "CONVERSATIONAL":
        logfire.info("Generating conversational response using memory.")
        
        prompt = f"""
            You are a friendly and helpful Enterprise AI Assistant.
            Answer the user's latest message using the CONVERSATION HISTORY below.

            CONVERSATION HISTORY:
            {history_str}

            LATEST MESSAGE:
            "{user_msg}"
        """
        
    else:
        logfire.info("Generating technical RAG response.")
        max_context_chars = 25000
        full_context = ""

        for doc in state["documents"]:
            if len(full_context) + len(doc) < max_context_chars:
                full_context += doc + "\n\n"
            else:
                logfire.warning("Context truncated to fit Groq TPM limits.")
                break

        prompt = f"""
            You are a Senior Technical Architect.
            Answer the question using the TECHNICAL CONTEXT provided.

            TECHNICAL CONTEXT:
            {full_context}

            CONVERSATION HISTORY:
            {history_str}

            USER QUESTION:
            "{user_msg}"
        """
        
    with logfire.span(" --- LLM Synthesis"):
        try:
            content = llm.invoke(prompt).content
            logfire.info("+++ Respone systhesised via LLM")
            logfire.info(f"⏱️ [Responder] Execution Time: {time.time() - start_time:.2f} seconds")
            
            return {
                "final_answer" : content,
                "status" : "Response generated.",
                "plan" : state["plan"],
                "messages" : [{"role": "assistant", "content": content}],
                "cache_hit" : state["cache_hit"],
                "contextualized_query" : state["contextualized_query"]
            }
        
        except Exception as e:
            logfire.error(f"LLM Generation failed: {e}")
            logfire.info(f"⏱️ [Responder] Execution Time: {time.time() - start_time:.2f} seconds")
            raise e 
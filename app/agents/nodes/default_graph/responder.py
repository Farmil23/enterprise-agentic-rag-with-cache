from app.agents.state import AgentState
from app.services.llm_gateway import get_robust_llm
import logfire
import time
from pydantic import BaseModel, Field

# Memanggil LLM Gateway
llm = get_robust_llm(temperature=0)

class OutputSchema(BaseModel):
    answer: str = Field(description="The highly detailed, comprehensive, and professional markdown-formatted answer to the user's query.")
    suggested_questions: list[str] = Field(description="Up to 2 short, clickable follow-up questions related to the context dalam bahasa indonesia.")

structured_llm = llm.with_structured_output(OutputSchema)

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
            
            CRITICAL INSTRUCTIONS FOR YOUR ANSWER:
            1. Be highly detailed, comprehensive, and professional. 
            2. Use markdown formatting (bullet points, bold text, code blocks if necessary) to make the information easy to read.
            3. Do NOT provide brief or shallow answers.
            4. You MUST also provide up to 2 short, highly relevant follow-up questions that the user might want to ask next.

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
            # Handle both new dict format and old string format
            doc_content = doc.get("page_content", str(doc)) if isinstance(doc, dict) else str(doc)
            
            if len(full_context) + len(doc_content) < max_context_chars:
                full_context += doc_content + "\n\n"
            else:
                logfire.warning("Context truncated to fit Groq TPM limits.")
                break

        prompt = f"""
            You are a Senior Technical Architect and Enterprise AI Assistant.
            Your task is to answer the user's question using the provided TECHNICAL CONTEXT and CONVERSATION HISTORY.
            
            CRITICAL INSTRUCTIONS FOR YOUR ANSWER:
            1. Be highly detailed, comprehensive, and professional. 
            2. Use markdown formatting (bullet points, bold text, code blocks if necessary) to make the information easy to read.
            3. Do NOT provide brief or shallow answers; explain the technical context thoroughly.
            4. You MUST also provide up to 2 short, highly relevant follow-up questions that the user might want to ask next based on the context.

            TECHNICAL CONTEXT:
            {full_context}

            CONVERSATION HISTORY:
            {history_str}

            USER QUESTION:
            "{user_msg}"
        """
        
    with logfire.span(" --- LLM Synthesis"):
        try:
            response = structured_llm.invoke(prompt)
            logfire.info("+++ Respone systhesised via LLM with structured output")
            logfire.info(f"⏱️ [Responder] Execution Time: {time.time() - start_time:.2f} seconds")
            
            return {
                "final_answer" : response.answer,
                "suggested_questions": response.suggested_questions,
                "status" : "Response generated.",
                "plan" : state["plan"],
                "messages" : [{"role": "assistant", "content": response.answer}],
                "cache_hit" : state["cache_hit"],
                "contextualized_query" : state.get("contextualized_query", "")
            }
        
        except Exception as e:
            logfire.error(f"LLM Generation failed: {e}")
            logfire.info(f"⏱️ [Responder] Execution Time: {time.time() - start_time:.2f} seconds")
            raise e 
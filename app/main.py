import logfire
import os
from dotenv import load_dotenv

load_dotenv()
logfire.configure(token=os.getenv("LOGFIRE_TOKEN"))

from fastapi import FastAPI, Response, Header, HTTPException
import threading
from fastapi.middleware.cors import CORSMiddleware
from app.agents.graph import rag_agent
from app.agents.graph import rag_agent
from app.services.auth.client_manager import log_usage

from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Enterprise Agentic RAG API")

# Setup CORS to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    q: str
    thread_id: Optional[str] = "default_user"
    tenant_id: Optional[str] = "default"
    
@app.get("/")
def home():
    return {
        "messages" : "Enterprise yang dibuat oleh farhan sudah nyala"
    }
    
@app.get("/graph")
def get_graph_image():
    try:
        png_bytes = rag_agent.get_graph().draw_mermaid_png()
        return Response(content=png_bytes, media_type="image/png")
    except Exception as e:
        return {"error" : f"Could not generate graph image: {e}"}

@app.post("/query")
def query(request: QueryRequest):
    q = request.q
    thread_id = request.thread_id
    tenant_id = request.tenant_id
    
    initial_state = {
        "messages": [{
            "role": "user",
            "content": q
        }],
        "current_query" : q,
        "documents" :[],
        "plan": ["Start"],
        "status" : "Initializing Graph...",
        "tenant_id": tenant_id,
        "final_answer": "",
        "is_safe": True,
        "cache_hit": False,
        "contextualized_query": ""
    }
    
    config = {"configurable" : {"thread_id": thread_id}}
    
    try:
        final_output = rag_agent.invoke(initial_state, config=config)
        
        print("DEBUG FINAL OUTPUT:", final_output)
        
        # Log the usage securely into Postgres di BACKGROUND THREAD (agar Uvicorn tidak nge-hang menunggu koneksi)
        # threading.Thread(target=log_usage, args=(tenant_id, q)).start()
        
        return {
            "question": q,
            "contextualized_query" : final_output.get("contextualized_query", ""),
            "answer" : final_output.get("final_answer"),
            "thought_process" : final_output.get("plan"),
            "status" : final_output.get("status"),
            "sources" : final_output.get("documents", []),
            "cache_hit" : final_output.get("cache_hit", ""),
        } 
        
    except Exception as e:
        logfire.error(f" ---Failed---- Backend gagal dijalankan: {e}")
        return {
            "question" : q,
            "answer" : "Kita minta maaf, kita mendapatkan issue sistem backendnya :()",
            "thought_process": ["Error Encountered during execution"],
            "status": "Error",
            "sources": []
        }

@app.get("/history/{thread_id}")
def get_chat_history(thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    state_snapshot = rag_agent.get_state(config)
    
    if not state_snapshot or not state_snapshot.values:
        return {"thread_id": thread_id, "messages": [], "status": "No history found"}
        
    messages = []
    for msg in state_snapshot.values.get("messages", []):
        if isinstance(msg, dict):
            messages.append(msg)
        else:
            role = "user" if msg.type == "human" else "assistant"
            messages.append({"role": role, "content": msg.content})
            
    return {
        "thread_id": thread_id,
        "messages": messages
    }

@app.delete("/history/{thread_id}")
def delete_chat_history(thread_id: str):
    from app.services.memory_chat.aiven import conn
    try:
        with conn.cursor() as cur:
            # Menghapus seluruh riwayat memori LangGraph untuk thread ini di Aiven Postgres
            cur.execute("DELETE FROM checkpoint_writes WHERE thread_id = %s", (thread_id,))
            cur.execute("DELETE FROM checkpoint_blobs WHERE thread_id = %s", (thread_id,))
            cur.execute("DELETE FROM checkpoints WHERE thread_id = %s", (thread_id,))
        return {"status": "success", "message": f"History for thread '{thread_id}' has been permanently deleted."}
    except Exception as e:
        logfire.error(f"Failed to delete history: {e}")
        return {"status": "error", "message": str(e)}
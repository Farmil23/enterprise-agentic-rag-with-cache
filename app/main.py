import logfire
import os
from dotenv import load_dotenv

load_dotenv()
if os.getenv("LOGFIRE_TOKEN"):
    logfire.configure(token=os.getenv("LOGFIRE_TOKEN"))

from fastapi import FastAPI, Response, Header, HTTPException, Depends
import threading
import json
from fastapi.middleware.cors import CORSMiddleware
from app.agents.graph import rag_agent
from app.services.auth.client_manager import log_usage, setup_tables, create_chat_thread, rename_chat_thread, get_db_connection
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from pydantic import BaseModel
from typing import Optional

# Import the new routers
from app.routers import auth, admin, files
from app.routers.admin import get_current_user

app = FastAPI(title="Enterprise Agentic RAG API")

# Ensure tables are setup on startup
setup_tables()

# Setup CORS to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*", # Allow all origins dynamically
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(files.router)

class QueryRequest(BaseModel):
    q: str
    thread_id: Optional[str] = "default_user"
    
# Root path is now handled by the catch_all route for the frontend
    
@app.get("/graph")
def get_graph_image():
    try:
        png_bytes = rag_agent.get_graph().draw_mermaid_png()
        return Response(content=png_bytes, media_type="image/png")
    except Exception as e:
        return {"error" : f"Could not generate graph image: {e}"}

@app.post("/query")
def query(request: QueryRequest, user: dict = Depends(get_current_user)):
    q = request.q
    thread_id = request.thread_id
    username = user["username"]
    tenant_id = user["tenant_id"] # Extract from JWT safely
    
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
        
        # Ensure a thread is registered
        title = q[:40] + ("..." if len(q) > 40 else "")
        threading.Thread(target=create_chat_thread, args=(thread_id, tenant_id, username, title)).start()
        
        # Log the usage securely into Postgres in background
        answer_text = final_output.get("final_answer", "")
        sources_json = json.dumps(final_output.get("documents", []))
        threading.Thread(target=log_usage, args=(tenant_id, username, q, answer_text, sources_json)).start()
        
        return {
            "question": q,
            "contextualized_query" : final_output.get("contextualized_query", ""),
            "answer" : final_output.get("final_answer"),
            "suggested_questions" : final_output.get("suggested_questions", []),
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
def get_chat_history(thread_id: str, user: dict = Depends(get_current_user)):
    # Note: ideally we check if the thread_id belongs to the user
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

@app.get("/chat/threads")
def get_user_chat_threads(user: dict = Depends(get_current_user)):
    username = user["username"]
    tenant_id = user["tenant_id"]
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT thread_id, title, created_at FROM chat_threads WHERE username = %s AND tenant_id = %s ORDER BY created_at DESC",
                    (username, tenant_id)
                )
                rows = cur.fetchall()
                threads = [{"thread_id": r[0], "title": r[1], "created_at": r[2]} for r in rows]
                return {"threads": threads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RenameRequest(BaseModel):
    title: str

@app.put("/chat/threads/{thread_id}")
def rename_thread(thread_id: str, request: RenameRequest, user: dict = Depends(get_current_user)):
    success = rename_chat_thread(thread_id, user["username"], request.title)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to rename thread")
    return {"status": "success"}

@app.delete("/history/{thread_id}")
def delete_chat_history(thread_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "tenant_admin"]:
        raise HTTPException(status_code=403, detail="Deleting chat history is blocked for monitoring purposes.")
    try:
        import sqlite3
        conn = sqlite3.connect("checkpoints.db")
        with conn:
            conn.execute("DELETE FROM checkpoint_writes WHERE thread_id = ?", (thread_id,))
            conn.execute("DELETE FROM checkpoint_blobs WHERE thread_id = ?", (thread_id,))
            conn.execute("DELETE FROM checkpoints WHERE thread_id = ?", (thread_id,))
            # Optional: Delete from MySQL chat_threads as well
            with get_db_connection() as mconn:
                with mconn.cursor() as mcur:
                    mcur.execute("DELETE FROM chat_threads WHERE thread_id = %s", (thread_id,))
        return {"status": "success", "message": f"History for thread '{thread_id}' has been permanently deleted."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- HUGGING FACE SPACES / SINGLE CONTAINER CONFIGURATION ---
# Mount the assets directory specifically
if os.path.isdir("frontend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

@app.api_route("/{path_name:path}", methods=["GET"])
async def catch_all(path_name: str):
    # If the user tries to hit an API route that doesn't exist, don't return HTML
    if path_name.startswith("api/") or path_name in ["query", "graph", "chat/threads"] or path_name.startswith("history/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Try to return the exact file if it exists (e.g. favicon.ico, vite.svg)
    file_path = os.path.join("frontend/dist", path_name)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise, return the React index.html for client-side routing
    index_path = "frontend/dist/index.html"
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    else:
        return {"message": "Enterprise Agentic RAG Backend is running, but frontend/dist/index.html is missing. Run 'npm run build' in the frontend folder."}
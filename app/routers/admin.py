from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import threading
import json
from app.services.auth.client_manager import get_db_connection
from app.ingestion.processor import process_file
from app.services.auth.jwt_handler import verify_token

router = APIRouter(prefix="/admin", tags=["admin"])

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.split(" ")[1]
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

def require_super_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin access required")
    return user

def require_tenant_admin(user: dict = Depends(get_current_user)):
    if user["role"] not in ["super_admin", "tenant_admin"]:
        raise HTTPException(status_code=403, detail="Tenant Admin access required")
    return user

class StatusUpdate(BaseModel):
    username: str
    status: str # 'approved' or 'rejected'

@router.get("/users/pending")
def get_pending_users(user: dict = Depends(require_tenant_admin)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                if user["role"] == "super_admin":
                    cur.execute("SELECT username, tenant_id, role, created_at FROM users WHERE status = 'pending'")
                else:
                    cur.execute("SELECT username, tenant_id, role, created_at FROM users WHERE status = 'pending' AND tenant_id = %s", (user["tenant_id"],))
                
                rows = cur.fetchall()
                users = [{"username": r[0], "tenant_id": r[1], "role": r[2], "created_at": r[3]} for r in rows]
                return {"pending_users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/status")
def update_user_status(req: StatusUpdate, user: dict = Depends(require_tenant_admin)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Check user exists and belongs to the admin's tenant (if not super admin)
                cur.execute("SELECT tenant_id FROM users WHERE username = %s", (req.username,))
                target_user = cur.fetchone()
                if not target_user:
                    raise HTTPException(status_code=404, detail="User not found")
                
                if user["role"] != "super_admin" and target_user[0] != user["tenant_id"]:
                    raise HTTPException(status_code=403, detail="Cannot modify user from another tenant")
                
                cur.execute("UPDATE users SET status = %s WHERE username = %s", (req.status, req.username))
                return {"message": f"User {req.username} status updated to {req.status}"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
def get_insights(user: dict = Depends(require_tenant_admin)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                insights = {}
                
                if user["role"] == "super_admin":
                    cur.execute("SELECT COUNT(*) FROM tenants")
                    insights["total_tenants"] = cur.fetchone()[0]
                    cur.execute("SELECT COUNT(*) FROM usage_logs")
                    insights["total_queries"] = cur.fetchone()[0]
                    cur.execute("SELECT COUNT(*) FROM users")
                    insights["total_users"] = cur.fetchone()[0]
                else:
                    tenant_id = user["tenant_id"]
                    cur.execute("SELECT COUNT(*) FROM usage_logs WHERE tenant_id = %s", (tenant_id,))
                    insights["total_queries"] = cur.fetchone()[0]
                    cur.execute("SELECT COUNT(*) FROM users WHERE tenant_id = %s AND role = 'regular_user' AND status = 'approved'", (tenant_id,))
                    insights["total_users"] = cur.fetchone()[0]
                    
                return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{username}")
def get_user_history(username: str, admin: dict = Depends(require_tenant_admin)):
    """Fetch history of a specific user for monitoring by their tenant admin."""
    # Assuming thread_id follows the format session_tenant_username... or similar
    # But since currently frontend generates random thread_id, we might need a way to track thread_ids by user.
    # To keep it simple, we'll fetch from usage_logs instead, since LangGraph checkpoints don't store user directly.
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Validate tenant matching
                cur.execute("SELECT tenant_id FROM users WHERE username = %s", (username,))
                target_user = cur.fetchone()
                if not target_user:
                    raise HTTPException(status_code=404, detail="User not found")
                
                if admin["role"] != "super_admin" and target_user[0] != admin["tenant_id"]:
                    raise HTTPException(status_code=403, detail="Cannot access user from another tenant")
                
                # Fetch their logs filtering by username
                # In MySQL, if the columns are missing we might get an error, but we just added them.
                cur.execute("SELECT query_text, answer, sources, created_at FROM usage_logs WHERE username = %s ORDER BY created_at DESC LIMIT 50", (username,))
                logs = []
                for r in cur.fetchall():
                    try:
                        srcs = json.loads(r[2]) if r[2] else []
                    except:
                        srcs = []
                    logs.append({"query": r[0], "answer": r[1] or "", "sources": srcs, "time": r[3]})
                return {"user": username, "history": logs}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/all")
def get_all_users(user: dict = Depends(require_tenant_admin)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                if user["role"] == "super_admin":
                    cur.execute("SELECT username, role FROM users WHERE status = 'approved'")
                else:
                    cur.execute("SELECT username, role FROM users WHERE status = 'approved' AND tenant_id = %s", (user["tenant_id"],))
                
                rows = cur.fetchall()
                users = [{"username": r[0], "role": r[1]} for r in rows]
                return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/files/upload")
def upload_file(file: UploadFile = File(...), target_tenant: Optional[str] = Form(None), admin: dict = Depends(require_tenant_admin)):
    try:
        tenant_id = admin["tenant_id"]
        if admin["role"] == "super_admin":
            if not target_tenant:
                raise HTTPException(status_code=400, detail="Super Admin must specify a target_tenant")
            tenant_id = target_tenant
            
        upload_dir = os.path.join("uploads", tenant_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Register file in database
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO tenant_files (tenant_id, filename, file_path, uploaded_by) VALUES (%s, %s, %s, %s)",
                    (tenant_id, file.filename, file_path, admin["username"])
                )
                
        # Trigger background ingestion
        threading.Thread(
            target=process_file,
            args=(file_path, file.filename, "general", tenant_id)
        ).start()
        
        return {"message": f"File {file.filename} uploaded and ingestion started."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CreateTenantRequest(BaseModel):
    tenant_id: str
    name: str

@router.post("/super/tenants")
def create_new_tenant(req: CreateTenantRequest, user: dict = Depends(require_super_admin)):
    try:
        from app.services.auth.client_manager import create_tenant
        api_key = create_tenant(req.tenant_id, req.name)
        if not api_key:
            raise HTTPException(status_code=400, detail="Failed to create tenant (might already exist)")
        return {"message": "Tenant created successfully", "api_key": api_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/super/tenants")
def get_all_tenants(user: dict = Depends(require_super_admin)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, api_key, created_at FROM tenants")
                rows = cur.fetchall()
                tenants = [{"id": r[0], "name": r[1], "api_key": r[2], "created_at": r[3]} for r in rows]
                return {"tenants": tenants}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/super/logs")
def get_global_logs(user: dict = Depends(require_super_admin)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT username, tenant_id, query_text, answer, created_at FROM usage_logs ORDER BY created_at DESC LIMIT 100")
                rows = cur.fetchall()
                logs = [{"username": r[0], "tenant_id": r[1], "query": r[2], "answer": r[3] or "", "time": r[4]} for r in rows]
                return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tenant/logs")
def get_tenant_logs(user: dict = Depends(require_tenant_admin)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                if user["role"] == "super_admin":
                    cur.execute("SELECT username, tenant_id, query_text, answer, created_at FROM usage_logs ORDER BY created_at DESC LIMIT 100")
                else:
                    cur.execute("SELECT username, tenant_id, query_text, answer, created_at FROM usage_logs WHERE tenant_id = %s ORDER BY created_at DESC LIMIT 100", (user["tenant_id"],))
                rows = cur.fetchall()
                logs = [{"username": r[0], "tenant_id": r[1], "query": r[2], "answer": r[3] or "", "time": r[4]} for r in rows]
                return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

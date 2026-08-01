from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import FileResponse
from app.services.auth.client_manager import get_db_connection
from app.services.auth.jwt_handler import verify_token
import os

router = APIRouter(prefix="/files", tags=["files"])

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.split(" ")[1]
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.get("/")
def get_tenant_files(user: dict = Depends(get_current_user)):
    try:
        tenant_id = user["tenant_id"]
        # Super admin can see all files if they want, but let's stick to tenant isolation
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                if user["role"] == "super_admin":
                    cur.execute("SELECT id, tenant_id, filename, uploaded_by, created_at FROM tenant_files ORDER BY created_at DESC")
                else:
                    cur.execute("SELECT id, tenant_id, filename, uploaded_by, created_at FROM tenant_files WHERE tenant_id = %s ORDER BY created_at DESC", (tenant_id,))
                
                rows = cur.fetchall()
                files = [{"id": r[0], "tenant_id": r[1], "filename": r[2], "uploaded_by": r[3], "created_at": r[4]} for r in rows]
                return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{file_id}")
def download_file(file_id: int, user: dict = Depends(get_current_user)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT file_path, tenant_id FROM tenant_files WHERE id = %s", (file_id,))
                file_record = cur.fetchone()
                
                if not file_record:
                    raise HTTPException(status_code=404, detail="File not found")
                
                file_path, file_tenant_id = file_record
                
                if user["role"] != "super_admin" and file_tenant_id != user["tenant_id"]:
                    raise HTTPException(status_code=403, detail="Unauthorized to download this file")
                
                if not os.path.exists(file_path):
                    raise HTTPException(status_code=404, detail="Physical file not found on server")
                    
                return FileResponse(path=file_path, filename=os.path.basename(file_path))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

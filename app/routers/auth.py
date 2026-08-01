from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import bcrypt
from app.services.auth.client_manager import get_db_connection, get_password_hash
from app.services.auth.jwt_handler import create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    username: str
    password: str
    tenant_id: str
    tenant_name: str = None
    role: str = "regular_user"

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(request: RegisterRequest):
    print("DEBUG: Register endpoint hit", flush=True)
    try:
        print("DEBUG: Getting db connection", flush=True)
        with get_db_connection() as conn:
            print("DEBUG: Got db connection", flush=True)
            with conn.cursor() as cur:
                print("DEBUG: Checking if username exists", flush=True)
                cur.execute("SELECT id FROM users WHERE username = %s", (request.username,))
                print("DEBUG: Username check done", flush=True)
                if cur.fetchone():
                    raise HTTPException(status_code=400, detail="Username already registered")
                
                # Check if tenant exists
                cur.execute("SELECT id FROM tenants WHERE id = %s", (request.tenant_id,))
                if not cur.fetchone():
                    if request.role == "tenant_admin":
                        import uuid
                        api_key = f"sk-rag-{uuid.uuid4().hex}"
                        t_name = request.tenant_name if request.tenant_name else request.tenant_id
                        cur.execute(
                            "INSERT INTO tenants (id, name, api_key) VALUES (%s, %s, %s)",
                            (request.tenant_id, t_name, api_key)
                        )
                    else:
                        raise HTTPException(status_code=400, detail="Tenant ID does not exist")
                
                hashed_pwd = get_password_hash(request.password)
                
                is_local = getattr(settings, "USE_LOCAL_DB", False)
                if is_local:
                    cur.execute(
                        "INSERT INTO users (username, password_hash, tenant_id, role, status) VALUES (%s, %s, %s, %s, %s)",
                        (request.username, hashed_pwd, request.tenant_id, request.role, "pending")
                    )
                    new_user_id = cur.lastrowid
                else:
                    cur.execute(
                        "INSERT INTO users (username, password_hash, tenant_id, role, status) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                        (request.username, hashed_pwd, request.tenant_id, request.role, "pending")
                    )
                    new_user_id = cur.fetchone()[0]
                
        return {"message": "Registration successful. Please wait for an admin to approve your account.", "user_id": new_user_id}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/login")
def login(request: LoginRequest):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT password_hash, role, tenant_id, status FROM users WHERE username = %s", (request.username,))
                user = cur.fetchone()
                
                if not user or not bcrypt.checkpw(request.password.encode('utf-8'), user[0].encode('utf-8')):
                    raise HTTPException(status_code=401, detail="Incorrect username or password")
                
                role, tenant_id, user_status = user[1], user[2], user[3]
                
                if user_status == "pending":
                    raise HTTPException(status_code=403, detail="Akun Anda masih menunggu persetujuan (approval) dari Admin.")
                if user_status == "rejected":
                    raise HTTPException(status_code=403, detail="Akun Anda telah ditolak.")
                
                # Generate JWT
                access_token = create_access_token(data={"sub": request.username, "role": role, "tenant_id": tenant_id})
                
                return {
                    "access_token": access_token, 
                    "token_type": "bearer",
                    "role": role,
                    "tenant_id": tenant_id,
                    "username": request.username
                }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

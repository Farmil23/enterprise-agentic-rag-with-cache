import logfire
import uuid
from psycopg import Connection
from app.config import settings
import bcrypt

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

import pymysql

class MySQLConnectionWrapper:
    def __init__(self, host="localhost", user="root", password="123", database="enterprise_rag", port=3307):
        # Connect to server first to ensure database exists
        try:
            init_conn = pymysql.connect(host=host, user=user, password=password, port=port)
            init_conn.cursor().execute(f"CREATE DATABASE IF NOT EXISTS {database}")
            init_conn.close()
        except Exception as e:
            print(f"Warning: Failed to auto-create MySQL database: {e}")
            
        self.conn = pymysql.connect(
            host=host, 
            user=user, 
            password=password, 
            database=database,
            port=port,
            autocommit=True
        )
        
    def cursor(self):
        return self.conn.cursor()
        
    def execute(self, query, params=None):
        cur = self.cursor()
        cur.execute(query, params)
        return cur
        
    def commit(self):
        pass # Autocommit is true
        
    def close(self):
        self.conn.close()

    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

def get_db_connection():
    if getattr(settings, "USE_LOCAL_DB", False):
        return MySQLConnectionWrapper()
        
    url = settings.POSTGRES_URL
    if "sslmode=require" not in url:
        url += ("&" if "?" in url else "?") + "sslmode=require"
        
    import concurrent.futures
    
    def connect_and_setup():
        conn = Connection.connect(url, autocommit=True)
        conn.execute("SET lock_timeout = '3s';")
        return conn

    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    future = executor.submit(connect_and_setup)
    try:
        conn = future.result(timeout=5)
        executor.shutdown(wait=False)
        return conn
    except concurrent.futures.TimeoutError:
        executor.shutdown(wait=False, cancel_futures=True)
        raise TimeoutError("Database connection timed out (PgBouncer pool is full or IP blocked). Please restart your Aiven service.")

def setup_tables():
    print("DEBUG: Starting setup_tables...")
    try:
        print("DEBUG: Connecting to database...")
        with get_db_connection() as conn:
            print("DEBUG: Connected to database!")
            with conn.cursor() as cur:
                is_local = getattr(settings, "USE_LOCAL_DB", False)
                serial_type = "INT AUTO_INCREMENT PRIMARY KEY" if is_local else "SERIAL PRIMARY KEY"
                
                print("DEBUG: Executing CREATE TABLE tenants...")
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS tenants (
                        id VARCHAR(255) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        api_key VARCHAR(255) UNIQUE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE
                    )
                """)
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS usage_logs (
                        id {serial_type},
                        tenant_id VARCHAR(255) REFERENCES tenants(id),
                        username VARCHAR(255),
                        query_text TEXT NOT NULL,
                        answer TEXT,
                        sources TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                # Handle existing tables missing the new columns
                try:
                    cur.execute("ALTER TABLE usage_logs ADD COLUMN username VARCHAR(255)")
                except Exception:
                    pass
                try:
                    cur.execute("ALTER TABLE usage_logs ADD COLUMN answer TEXT")
                    cur.execute("ALTER TABLE usage_logs ADD COLUMN sources TEXT")
                except Exception:
                    pass
                    
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS chat_threads (
                        thread_id VARCHAR(255) PRIMARY KEY,
                        tenant_id VARCHAR(255) REFERENCES tenants(id),
                        username VARCHAR(255),
                        title VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                    
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS tenant_files (
                        id {serial_type},
                        tenant_id VARCHAR(255) REFERENCES tenants(id),
                        filename VARCHAR(255) NOT NULL,
                        file_path VARCHAR(512) NOT NULL,
                        uploaded_by VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS users (
                        id {serial_type},
                        username VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        tenant_id VARCHAR(255) REFERENCES tenants(id),
                        role VARCHAR(50) NOT NULL,
                        status VARCHAR(50) NOT NULL DEFAULT 'pending',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # # Create a master tenant if it doesn't exist to bind super_admin
                # cur.execute("SELECT id FROM tenants WHERE id = 'master'")
                # if not cur.fetchone():
                #     cur.execute(
                #         "INSERT INTO tenants (id, name, api_key) VALUES (%s, %s, %s)",
                #         ("master", "Master System", f"sk-rag-{uuid.uuid4().hex}")
                #     )

                # # Seed the Super Admin account
                # cur.execute("SELECT id FROM users WHERE username = 'badsfarmil'")
                # if not cur.fetchone():
                #     super_pwd = get_password_hash("badsfarmil232615")
                #     cur.execute(
                #         "INSERT INTO users (username, password_hash, tenant_id, role, status) VALUES (%s, %s, %s, %s, %s)",
                #         ("badsfarmil", super_pwd, "master", "super_admin", "approved")
                #     )
                    
                # Create a demo tenant if it doesn't exist
                cur.execute("SELECT id FROM tenants WHERE id = 'demo_company'")
                if not cur.fetchone():
                    cur.execute(
                        "INSERT INTO tenants (id, name, api_key) VALUES (%s, %s, %s)",
                        ("demo_company", "Enterprise Demo", f"sk-rag-{uuid.uuid4().hex}")
                    )

                # # Seed Dummy Tenant Admin
                # cur.execute("SELECT id FROM users WHERE username = 'admin_tenant_satu'")
                # if not cur.fetchone():
                #     admin_pwd = get_password_hash("password")
                #     cur.execute(
                #         "INSERT INTO users (username, password_hash, tenant_id, role, status) VALUES (%s, %s, %s, %s, %s)",
                #         ("admin_tenant_satu", admin_pwd, "demo_tenant", "tenant_admin", "approved")
                #     )

                # Seed Demo User
                cur.execute("SELECT id FROM users WHERE username = 'demo@enterprise.com'")
                if not cur.fetchone():
                    user_pwd = get_password_hash("demo")
                    cur.execute(
                        "INSERT INTO users (username, password_hash, tenant_id, role, status) VALUES (%s, %s, %s, %s, %s)",
                        ("demo@enterprise.com", user_pwd, "demo_company", "regular_user", "approved")
                    )

                # # Seed Dummy User 2
                # cur.execute("SELECT id FROM users WHERE username = 'user_dummie_2'")
                # if not cur.fetchone():
                #     user_pwd = get_password_hash("password")
                #     cur.execute(
                #         "INSERT INTO users (username, password_hash, tenant_id, role, status) VALUES (%s, %s, %s, %s, %s)",
                #         ("user_dummie_2", user_pwd, "demo_tenant", "regular_user", "approved")
                #     )

        logfire.info("✅ Client Management tables verified/created successfully.")
    except Exception as e:
        print(f"❌ Failed to setup client tables: {e}")

def create_tenant(tenant_id: str, name: str) -> str:
    """Creates a new tenant and returns their API Key."""
    api_key = f"sk-rag-{uuid.uuid4().hex}"
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO tenants (id, name, api_key) VALUES (%s, %s, %s)",
                    (tenant_id, name, api_key)
                )
        logfire.info(f"🎉 Tenant '{name}' created with ID: {tenant_id}")
        return api_key
    except Exception as e:
        print(f"❌ Failed to create tenant: {e}")
        return None

def validate_api_key(api_key: str) -> str:
    """Returns the tenant_id if valid, otherwise None."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM tenants WHERE api_key = %s AND is_active = TRUE", (api_key,))
                result = cur.fetchone()
                if result:
                    return result[0]
        return None
    except Exception as e:
        print(f"❌ API Key validation error: {e}")
        return None

def log_usage(tenant_id: str, username: str, query_text: str, answer: str = "", sources: str = "[]"):
    """Logs a successful query for billing and monitoring purposes."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Ensure tenant exists (auto-create if they bypass API keys)
                dummy_api_key = f"sk-rag-{uuid.uuid4().hex}"
                
                is_local = getattr(settings, "USE_LOCAL_DB", False)
                conflict_clause = "ON DUPLICATE KEY UPDATE id=id" if is_local else "ON CONFLICT (id) DO NOTHING"
                
                cur.execute(
                    f"INSERT INTO tenants (id, name, api_key) VALUES (%s, %s, %s) {conflict_clause}",
                    (tenant_id, tenant_id, dummy_api_key)
                )
                
                cur.execute(
                    "INSERT INTO usage_logs (tenant_id, username, query_text, answer, sources) VALUES (%s, %s, %s, %s, %s)",
                    (tenant_id, username, query_text, answer, sources)
                )
                
    except Exception as e:
        print(f"❌ Failed to log usage: {e}")

def create_chat_thread(thread_id: str, tenant_id: str, username: str, title: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                is_local = getattr(settings, "USE_LOCAL_DB", False)
                conflict_clause = "ON DUPLICATE KEY UPDATE title=title" if is_local else "ON CONFLICT (thread_id) DO NOTHING"
                cur.execute(
                    f"INSERT INTO chat_threads (thread_id, tenant_id, username, title) VALUES (%s, %s, %s, %s) {conflict_clause}",
                    (thread_id, tenant_id, username, title)
                )
    except Exception as e:
        print(f"❌ Failed to create chat thread: {e}")

def rename_chat_thread(thread_id: str, username: str, new_title: str) -> bool:
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Update only if it belongs to the user
                cur.execute(
                    "UPDATE chat_threads SET title = %s WHERE thread_id = %s AND username = %s",
                    (new_title, thread_id, username)
                )
                return cur.rowcount > 0
    except Exception as e:
        print(f"❌ Failed to rename chat thread: {e}")
        return False

import logfire
import uuid
from psycopg import Connection
from app.config import settings

def get_db_connection() -> Connection:
    return Connection.connect(settings.POSTGRES_URL, autocommit=True)

def setup_tables():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS tenants (
                        id VARCHAR(255) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        api_key VARCHAR(255) UNIQUE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS usage_logs (
                        id SERIAL PRIMARY KEY,
                        tenant_id VARCHAR(255) REFERENCES tenants(id),
                        query_text TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
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

def log_usage(tenant_id: str, query_text: str):
    """Logs a successful query for billing purposes."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Ensure tenant exists (auto-create if they bypass API keys)
                dummy_api_key = f"sk-rag-{uuid.uuid4().hex}"
                cur.execute(
                    "INSERT INTO tenants (id, name, api_key) VALUES (%s, %s, %s) ON CONFLICT (id) DO NOTHING",
                    (tenant_id, tenant_id, dummy_api_key)
                )
                
                cur.execute(
                    "INSERT INTO usage_logs (tenant_id, query_text) VALUES (%s, %s)",
                    (tenant_id, query_text)
                )
    except Exception as e:
        print(f"❌ Failed to log usage for tenant {tenant_id}: {e}")



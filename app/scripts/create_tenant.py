import argparse
import sys
import os

# Add parent dir to path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.services.auth.client_manager import create_tenant, setup_tables

if __name__ == "__main__":
    setup_tables()
    parser = argparse.ArgumentParser(description="Register a new client tenant")
    parser.add_argument("--tenant_id", type=str, required=True, help="Unique ID for the tenant (e.g., kampus_a)")
    parser.add_argument("--name", type=str, required=True, help="Full name of the company/client")
    
    args = parser.parse_args()
    
    print(f"Creating tenant: {args.name} ({args.tenant_id})...")
    api_key = create_tenant(args.tenant_id, args.name)
    
    if api_key:
        print("\n" + "="*50)
        print("✅ SUCCESS: Tenant registered in PostgreSQL!")
        print("="*50)
        print(f"Tenant ID  : {args.tenant_id}")
        print(f"Name       : {args.name}")
        print(f"API KEY    : {api_key}")
        print("="*50)
        print("⚠️  IMPORTANT: Give this API Key to the client.")
        print("They MUST include it in the 'X-API-Key' header when calling /query.")
    else:
        print("❌ FAILED to create tenant. Does the tenant_id already exist?")

import sys
import traceback

def run():
    try:
        print("Starting test...")
        import app.scripts.create_tenant
        print("Import successful.")
    except Exception as e:
        print("Caught exception:")
        traceback.print_exc()

if __name__ == "__main__":
    run()

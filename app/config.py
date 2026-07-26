import os
from dotenv import load_dotenv

load_dotenv()

class Settings:

    # Embeeding model
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = "gpt-4o"
    OPENAI_MODEL_FAST = "gpt-4o-mini"

    # LLM
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_FALLBACK_API_KEY = os.getenv("GROQ_FALLBACK_API_KEY")
    GROQ_MODEL = "llama-3.3-70b-versatile"
    GROQ_MODEL_FAST = "llama-3.1-8b-instant"
    GROQ_GUARD_MODEL = "meta-llama/llama-prompt-guard-2-86m"
    
    # Vector Database
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
    QDRANT_CLUSTER_ENDPOINT = os.getenv("QDRANT_CLUSTER_ENDPOINT")
    QDRANT_COLLECTION = "enterprise_rag"
    QDRANT_COLLECTION_CACHE_NAME = "agent_cache"

    # Relational Database
    POSTGRES_URL = os.getenv("POSTGRES_URL")

settings = Settings()
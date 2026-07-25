import logfire
from app.config import settings
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

def get_robust_llm(temperature=0, is_fast=False):
    """
    Membangun LLM Gateway dengan fitur Fallback bawaan LangChain.
    Jika API Utama terkena Rate Limit, secara otomatis akan dialihkan ke API cadangan.
    Urutan: Groq Utama -> Groq Cadangan -> OpenAI (gpt-4o-mini).
    """
    
    target_model = settings.GROQ_MODEL_FAST if is_fast else settings.GROQ_MODEL
    target_model_openai = settings.OPENAI_MODEL_FAST if is_fast else settings.OPENAI_MODEL
    
    # 1. Primary LLM (Groq - Utama)
    primary_llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=target_model,
        temperature=temperature
    )
    
    fallbacks = []
    
    # 2. Secondary LLM (Groq - Cadangan)
    if getattr(settings, "GROQ_FALLBACK_API_KEY", None):
        fallback_groq = ChatGroq(
            api_key=settings.GROQ_FALLBACK_API_KEY,
            model=target_model,
            temperature=temperature
        )
        fallbacks.append(fallback_groq)
        
    # 3. Ultimate Fallback (OpenAI - Paling Tangguh)
    if getattr(settings, "OPENAI_API_KEY", None):
        fallback_openai = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model=target_model_openai,
            temperature=temperature
        )
        fallbacks.append(fallback_openai)
        
    if fallbacks:
        # LangChain akan otomatis mencoba dari kiri ke kanan jika terjadi error
        return primary_llm.with_fallbacks(fallbacks)
        
    return primary_llm

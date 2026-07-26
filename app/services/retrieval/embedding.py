import time
import logfire

from langchain_openai import OpenAIEmbeddings
from app.config import settings

BATCH_SIZE = 50
_OPENAI_DIM = 1536
_FALLBACK_DIM = 768 # ALL_MPNET_BASE_V2

_active_model = None
_model_type: str | None = None 
_model_embedding = "text-embedding-3-small" 

def _probe_openai():
    # untuk membuktikan bahwa openai berjalan dengan baik
    try:
        # Model Embedding dari OpenAI
        model = OpenAIEmbeddings(
            model=_model_embedding,
            api_key=settings.OPENAI_API_KEY,
        )
        
        # testing embedding model
        model.embed_query("probe")
        logfire.info(f"Model {_model_embedding} sudah siap digunakan dan berjalan dengan baik")
        return model
    
    except Exception as e:
        logfire.warning(f"OpenAI mengalami kendala : {e}. sentence transformer digunakan sebagai fallback")
        return None
    
    
def _load_fallback():
    from sentence_transformers import SentenceTransformer
    logfire.info("Loading sentence Transformer akan digunakan")
    return SentenceTransformer("all-mpnet-base-v2")

def _init():
    global _active_model, _model_type
    
    if _active_model is not None:
        return
    
    openai = _probe_openai()
    
    if openai:
        _active_model = openai
        _model_type = "openai"
    else:
        _active_model = _load_fallback()
        _model_type = "fallback"
        
        

def get_embedding_dim() -> int:
    """untuk menentukan dimensi yang akan digunakan pada vector database nanti"""
    
    _init() # mengambil model yang aktif
    return _OPENAI_DIM if _model_type == 'openai' else _FALLBACK_DIM

def _embed_batch(batch: list[str]) -> list[list[float]]:
    if _model_type == 'openai':
        for attempt in range(4):
            try:
                return _active_model.embed_documents(batch)
            except Exception as e:
                err = str(e).lower()
                is_rate_limit = any(x in err for x in ("429", "rate", "quota", "too_many_requests"))
                if is_rate_limit and attempt < 3:
                    wait = 2 ** attempt
                    logfire.warning(
                        f"OpenAI rate limit hit - retrying in {wait}s "
                        f"(attempt {attempt + 1} / 4)"
                    )
                    time.sleep(wait)
                else:
                    logfire.error(f"OpenAI embedding failed: {e}")
                    raise 
        raise RuntimeError("OpenAI rate limit persisted after 4 attempts.")
    else:
        return _active_model.encode(batch, show_progress_bar=False).tolist()
            

def embed_query (query:str) -> list[float]:
    _init()
    if _model_type == 'openai':
        return _active_model.embed_query(query)
    return _active_model.encode([query])[0].tolist()

def embed_texts(texts: list[str]) -> list[list[float]]:
    _init()
    
    all_embeddings: list[list[float]] = []
    
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        with logfire.span("embed batch", model=_model_type, start=i, size=len(batch)):
            all_embeddings.extend(_embed_batch(batch))
            
    return all_embeddings
import os
import sys
import uuid
import json
import logfire
import argparse

from qdrant_client import QdrantClient
from qdrant_client.http import models

from app.config import settings
from app.services.retrieval.embedding import embed_texts, get_embedding_dim
from app.ingestion.loaders.pdf import parse_pdf
from app.ingestion.loaders.html import parse_html
from app.ingestion.loaders.text import parse_text
from app.ingestion.loaders.office import parse_office
from app.ingestion.chunking.splitter import chunk_text

logfire.configure(service_name="enterprise-ingestion-service")

PROCESSED_DATA_DIR = "processed_data"

qdrant_client = QdrantClient(
    url = settings.QDRANT_CLUSTER_ENDPOINT,
    api_key = settings.QDRANT_API_KEY,
)

def save_processed_locally(data: dict, source_type: str, filename: str, tenant_id: str = "default") -> str:
    """ Berfungsi untuk menyimpan data sebagai JSON dalam processed_data/<tenant_id>/<source_type>/."""
    folder = os.path.join(PROCESSED_DATA_DIR, tenant_id, source_type)
    os.makedirs(folder, exist_ok=True)
    
    dest = os.path.join(folder, f"{filename}.json")
    with open (dest, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return dest

def process_file(file_path: str, filename: str, source_type: str, tenant_id: str = "default"):
    """Parse -> chunk -> save local -> embed -> index in qdrant"""
    with logfire.span("Processing file", file=filename, source=source_type, tenant=tenant_id):
        try:
            ext = filename.lower().rsplit(".", 1)[-1]
            if ext == "pdf":
                full_text = parse_pdf(file_path)
            elif ext in ("html", "htm"):
                full_text = parse_html(file_path=file_path)
            elif ext == "txt":
                full_text = parse_text(file_path=file_path)
            elif ext in ("docx", "pptx"):
                full_text = parse_office(file_path=file_path)
            else:
                logfire.warning(f"Skipping unsupported file type: {filename}")
                return
            
            if not full_text or not full_text.strip():
                logfire.warning(f"No text extracted from {filename} -- Skipping")    
                return
            
            # CHUNK TEXT
            chunks = chunk_text(full_text)
            if not chunks:
                return
            
            processed_data = {
                "filename" : filename,
                "source_type" : source_type,
                "chunks" : chunks,
                "tenant_id": tenant_id
            }
            
            local_path = save_processed_locally(processed_data, source_type, filename, tenant_id)
            logfire.info(f"Saved processed data -> {local_path}")
            
            target_collection = f"{tenant_id}_knowledge" if tenant_id and tenant_id != "default" else settings.QDRANT_COLLECTION
            
            # EMBED
            with logfire.span("Vectorizing and Indexing"):
                embeddings = embed_texts(chunks)
                points = [
                    models.PointStruct(
                        id = str(uuid.uuid4()),
                        vector = vector,
                        payload={
                            "text": chunk, 
                            "source" : filename,
                            "source_type" : source_type,
                            "tenant_id": tenant_id
                        },
                    )
                    for chunk, vector in zip(chunks, embeddings)
                ]
                
                qdrant_client.upsert(
                    collection_name=target_collection,
                    points=points
                )
                
                logfire.info(f"Indexed {len(points)} points to Qdrant collection {target_collection} from {filename}")
        except Exception as e:
            logfire.error(f"Failed to process {filename} : {e}")

def process_directory(dir_path: str, source_type: str, tenant_id: str = "default"):
    """Prosess setiap file yang ada di directory"""
    with logfire.span("Scanning Directory", path=dir_path, source=source_type, tenant=tenant_id):
        files = [f for f in os.listdir(dir_path) if os.path.isfile(os.path.join(dir_path, f))]
        logfire.info(f"Found {len(files)} files in {dir_path}")
        
        for filename in files:
            process_file(os.path.join(dir_path, filename), filename, source_type, tenant_id)
            
def run_universal_ingestion(base_dir: str, explicit_source_type: str = None, wipe: bool = False, tenant_id: str = "default"):
    """
    Membaca base_dir, dan melakukan mapping untuk source type dan nge-ingest setiap dokumen.
    pass --wipe to drop and recreate the Qdrant collection before ingestion
    """
    with logfire.span("Universal Ingestion Started", base_directory=base_dir, tenant=tenant_id):
        target_collection = f"{tenant_id}_knowledge" if tenant_id and tenant_id != "default" else settings.QDRANT_COLLECTION
        target_cache = f"{tenant_id}_cache" if tenant_id and tenant_id != "default" else getattr(settings, "QDRANT_COLLECTION_CACHE_NAME", None)

        if wipe and qdrant_client.collection_exists(target_collection):
            qdrant_client.delete_collection(target_collection)
            logfire.info(f"Wiped existing collection: {target_collection}")
            
        dim = get_embedding_dim()
        
        def ensure_collection(name):
            if name and not qdrant_client.collection_exists(name):
                qdrant_client.create_collection(
                    collection_name=name,
                    vectors_config=models.VectorParams(
                        size=dim,
                        distance=models.Distance.COSINE,
                    ),
                )
                logfire.info(f"Created collection : {name} ({dim}-dim, cosine)")

        ensure_collection(target_collection)
        ensure_collection(target_cache)
            
        # Memisahkan pembacaan sub-folder secara mandiri
        subdirs = [
            d for d in os.listdir(base_dir)
            if os.path.isdir(os.path.join(base_dir, d))
        ]
        
        if not subdirs:
            if explicit_source_type:
                source_type = explicit_source_type
            else:
                base_name = os.path.basename(os.path.normpath(base_dir)).lower()
                source_type = (
                    "true" if "true" in base_name
                    else "noisy" if "noisy" in base_name
                    else "general"
                )
            
            logfire.info(f"No sub-folders found - processing '{base_dir}' as '{source_type}'")
            process_directory(base_dir, source_type, tenant_id)
            
        else:
            for subdir in subdirs:
                source_type = (
                    "true" if "true" in subdir.lower()
                    else "noisy" if "noisy" in subdir.lower()
                    else subdir
                )
                process_directory(os.path.join(base_dir, subdir), source_type, tenant_id)
                
                
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Universal Data Ingestion for Enterprise RAG")
    parser.add_argument("target_dir", nargs="?", default="DATA", help="Directory to ingest")
    parser.add_argument("explicit_type", nargs="?", default=None, help="Explicit source type")
    parser.add_argument("--wipe", action="store_true", help="Wipe collection before ingestion")
    parser.add_argument("--tenant_id", type=str, default="default", help="Tenant ID for multi-tenancy (e.g. 'kampus_a')")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.target_dir):
        print(f"Error: path '{args.target_dir}' does not exist")
        sys.exit(1)
        
    run_universal_ingestion(
        args.target_dir, 
        explicit_source_type=args.explicit_type, 
        wipe=args.wipe, 
        tenant_id=args.tenant_id
    )
    logfire.info("Ingestion job completed")
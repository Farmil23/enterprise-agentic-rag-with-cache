from typing import TypedDict, List, Annotated
import operator

class AgentState(TypedDict):
    
    """
        Planner Node:ini akan menjadi clasifikasi query yang diberikan oleh user untuk pergi ke retriever atau ke responder node
        
        Retriever Node: Ini akan mengambil document yang ada pada vector database dan mengembalikkan jawbaan sesuai konteks dan akan masuk ke responder node
        
        Responder Node: Ini adalah bagian untuk menampilkan output untuk user dari AI baik itu direct dari planner maupun dari retriever node
    
    """
    
    # Message akan ada 3 jenis, AI human dan juga tool
    messages: Annotated[List[dict], operator.add]
    
    # Query yang dimasukkan user dan nantinya yang akan diproses
    current_query : str
    
    # Document yang diambil dari vector Database
    documents: List[str]
    
    # Plan ini ditujukan untuk mengatur arah node untuk pergi ke retriever dan mengambil ke database atau langsung ke responder
    plan : List[str]
    
    # Status diigunakan untuk mendapatkan status node saat ini
    status : str
    
    # Final answer untuk jawabannyaa
    final_answer: str
    
    # fokus untuk cache pertanyaan yang pernah diajukan
    cache_hit : bool
    
    contextualized_query: str       # Hasil rewrite dari AI ("Apakah Paket Starter ada diskon?")
    
    is_safe: bool
    
    # Identitas klien (Multi-Tenancy)
    tenant_id: str
    
    
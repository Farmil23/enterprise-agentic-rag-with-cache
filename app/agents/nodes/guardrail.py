import time
import logfire
from app.agents.state import AgentState
from app.services.llm_gateway import get_robust_llm
from langchain_core.prompts import ChatPromptTemplate

# Inisialisasi model LLM Gateway (Gunakan model 70B yang jauh lebih pintar untuk penalaran)
guard_llm = get_robust_llm(temperature=0, is_fast=False)

def guardrail_node(state: AgentState):
    """
    Memeriksa apakah input user aman menggunakan LLM cerdas yang diinstruksikan ketat.
    """
    query = state["current_query"]
    start_time = time.time()
    
    # ⚡ FAST-TRACK: Sapaan Statis
    # Jika input sangat pendek dan berisi sapaan standar, langsung bypass LLM!
    greetings = ["hay", "hai", "halo", "hello", "hi", "p", "ping", "tes", "test", "selamat pagi", "selamat siang", "selamat malam"]
    
    if query.strip().lower() in greetings:
        logfire.info("⚡ FAST-TRACK: Sapaan ringan terdeteksi! Bypass semua AI.")
        logfire.info(f"⏱️ [Guardrail] Execution Time: {time.time() - start_time:.4f} seconds")
        return {
            "is_safe": True,
            "final_answer": "Halo! Ada yang bisa saya bantu hari ini?",
            "status": "Fast-tracked Greeting",
            "plan": state["plan"] + ["Fast-tracked Greeting"]
        }
    
    with logfire.span("🛡️ AI Guardrail Check"):
        logfire.info(f"Checking safety for query: {query}")
        
        try:
            system_prompt = """
            Anda adalah analis privasi data. 
            Tugas Anda HANYA SATU: Mencegah pengguna memberikan atau meminta data pribadi yang sangat rahasia (PII).
            
            KATEGORI AMAN (SAFE):
            - Pertanyaan teknis, pekerjaan, IT, monitoring, programming, hacking, dll.
            - Basa-basi, sapaan, atau obrolan umum.
            
            KATEGORI BERBAHAYA (UNSAFE):
            - Meminta atau memberikan nomor kartu kredit, password asli, atau NIK/KTP.
            
            Keluarkan 1 kata saja: "safe" atau "unsafe".
            """
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", "{query}")
            ])
            
            chain = prompt | guard_llm
            response = chain.invoke({"query": query})
            
            result_text = response.content.strip().lower()
            
            # Pengecekan pemaaf tapi tegas
            is_unsafe = result_text == "unsafe" or result_text.startswith("unsafe")
            
            if is_unsafe:
                logfire.warning(f"Input is UNSAFE. Model output: {result_text}")
                logfire.info(f"⏱️ [Guardrail] Execution Time: {time.time() - start_time:.2f} seconds")
                return {
                    "is_safe": False,
                    "final_answer": "Maaf, permintaan Anda tidak dapat diproses karena terdeteksi melanggar kebijakan keamanan kami.",
                    "status": "Blocked by Guardrail",
                    "plan": state["plan"] + ["Blocked by Guardrail"]
                }
            else:
                logfire.info(f"Input is SAFE. Model output: {result_text}")
                logfire.info(f"⏱️ [Guardrail] Execution Time: {time.time() - start_time:.2f} seconds")
                return {
                    "is_safe": True,
                    "status": "Safety Check Passed",
                    "plan": state["plan"] + ["Guardrail Passed"]
                }
                
        except Exception as e:
            logfire.error(f"Guardrail check failed: {e}")
            logfire.info(f"⏱️ [Guardrail] Execution Time: {time.time() - start_time:.2f} seconds")
            # Failsafe: Jika LLM error, biarkan lewat
            return {
                "is_safe": True,
                "status": "Safety Check Error (Bypassed)",
                "plan": state["plan"] + ["Guardrail Error (Bypassed)"]
            }

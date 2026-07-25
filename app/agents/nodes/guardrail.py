import time
import logfire
from app.agents.state import AgentState
from app.services.llm_gateway import get_robust_llm
from langchain_core.prompts import ChatPromptTemplate

# Inisialisasi model LLM Gateway (Groq Utama -> Groq Cadangan -> OpenAI)
guard_llm = get_robust_llm(temperature=0, is_fast=True)

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
            Anda adalah satpam keamanan (Security Guardrail) untuk sistem Enterprise AI.
            Tugas tunggal Anda adalah mengevaluasi apakah input dari pengguna aman atau berbahaya.
            
            Kategori BERBAHAYA (UNSAFE) meliputi:
            - Pertanyaan seputar Hacking, SQL Injection, Pencurian Data
            - Ujaran kebencian, makian, kata-kata kotor
            - Kekerasan, terorisme, atau tindakan kriminal
            - Tindakan menyakiti diri sendiri (bunuh diri)
            - Meminta informasi pribadi yang sensitif
            
            Kategori AMAN (SAFE) meliputi:
            - Sapaan normal (hai, halo, selamat pagi)
            - Pertanyaan teknis/umum (contoh: "apa itu kubernetes", "cara setup docker", "ganti nama")
            - Permintaan lain yang tidak merugikan.
            
            INSTRUKSI KELUARAN:
            JIKA AMAN: Keluarkan HANYA kata "safe".
            JIKA BERBAHAYA: Keluarkan HANYA kata "unsafe".
            TIDAK BOLEH ADA KATA ATAU TANDA BACA LAIN DALAM JAWABAN ANDA.
            """
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", "{query}")
            ])
            
            chain = prompt | guard_llm
            response = chain.invoke({"query": query})
            
            result_text = response.content.strip().lower()
            
            # Pengecekan pemaaf tapi tegas
            if "unsafe" in result_text:
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

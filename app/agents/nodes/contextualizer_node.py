from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from pydantic import BaseModel, Field
from app.agents.state import AgentState
from app.services.llm_gateway import get_robust_llm
import logfire
import time



def contextualizer_node(state: AgentState):
    start_time = time.time()
    history = []
    try:

        # Hanya ambil 6 pesan terakhir untuk menghindari token limit
        for msg in state["messages"][-7:-1]:
            if msg["role"] == "user":
                history.append(HumanMessage(content=msg["content"]))
            else:
                history.append(AIMessage(content=msg["content"]))
        
        
        user_message = ""
        
        for msg in reversed(state["messages"]):
            if msg["role"] == "user":
                user_message = msg["content"]
                break
        
        if not history:
            return {"contextualized_query": user_message}
        
        system_prompt = """
            Anda adalah komponen inti dari sistem pemrosesan data (Query Contextualizer Node).
            Tugas tunggal Anda adalah menganalisis Riwayat Percakapan dan Pertanyaan Terbaru Pengguna, kemudian menulis ulang Pertanyaan Terbaru tersebut menjadi satu pertanyaan mandiri (standalone query) yang utuh secara konteks.

            TUGAS UTAMA:
            Ganti semua kata ganti penunjuk (seperti "itu", "dia", "harganya", "yang tadi", "di sana") di dalam Pertanyaan Terbaru dengan entitas atau subjek spesifik yang sedang dibahas di dalam Riwayat Percakapan.

            ATURAN KETAT (GUARDRAILS) - PELANGGARAN TERHADAP ATURAN INI ADALAH KESALAHAN FATAL:
            1. DILARANG MENJAWAB PERTANYAAN: Anda sama sekali tidak boleh mencoba menjawab pertanyaan pengguna. Tugas Anda hanya memodifikasi struktur kalimat dari input.
            2. PERTAHANKAN SELURUH INSTRUKSI: Pastikan seluruh instruksi atau kata kerja (seperti "ceritakan", "jelaskan", "sebutkan") tetap ada dan utuh maknanya.
            3. DILARANG MEMBERIKAN PENJELASAN: Jangan gunakan frasa pengantar seperti "Tentu", "Berikut adalah pertanyaannya:", atau "Maksud pengguna adalah:". 
            4. KELUARKAN HANYA TEKS MENTAH: Output Anda harus berupa teks pertanyaan yang sudah ditulis ulang tanpa tanda kutip ganda ("...").
            5. DETEKSI PERGESERAN TOPIK: Jika Pertanyaan Terbaru sama sekali tidak memiliki kaitan logis dengan Riwayat Percakapan (pengguna tiba-tiba mengganti topik), JANGAN gabungkan konteks lama. Kembalikan Pertanyaan Terbaru apa adanya.
            6. KONSISTENSI BAHASA: Tulis ulang pertanyaan menggunakan bahasa asli dari input pengguna. Jangan menerjemahkannya ke bahasa Inggris jika pengguna menggunakan bahasa Indonesia.

            CONTOH KASUS:
            [Kasus 1 - Mengganti Kata Ganti "Itu"]
            Riwayat: User bertanya tentang "Cron Job". AI menjelaskan definisinya.
            Pertanyaan Terbaru: "itu fungsinya untuk apa?"
            Output: Cron Job fungsinya untuk apa?

            [Kasus 2 - Ketergantungan Konteks]
            Riwayat: User bertanya tentang "Paket Enterprise". AI menjelaskan fiturnya.
            Pertanyaan Terbaru: "Berapa harganya dan apakah ada diskon untuk itu?"
            Output: Berapa harga Paket Enterprise dan apakah ada diskon untuk Paket Enterprise?

            [Kasus 3 - Pergeseran Topik Murni]
            Riwayat: User bertanya tentang "Paket Enterprise". AI menjelaskan fiturnya.
            Pertanyaan Terbaru: "Tolong buatkan resep nasi goreng."
            Output: Tolong buatkan resep nasi goreng.

            [Kasus 4 - Sudah Mandiri]
            Riwayat: User bertanya tentang "Paket Enterprise". AI menjelaskan fiturnya.
            Pertanyaan Terbaru: "Apa saja fitur dari Paket Starter?"
            Output: Apa saja fitur dari Paket Starter?
        """
        

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("placeholder", "{chat_history}"),
            ("human", "Tulis ulang pertanyaan berikut: {query}")
        ])

        
        class ContextualizedOutput(BaseModel):
            standalone_query: str = Field(description="HANYA berisi pertanyaan yang sudah ditulis ulang secara utuh, tanpa kalimat pengantar apapun, tanpa menghilangkan instruksi asli.")

        llm = get_robust_llm(temperature=0, is_fast=True)

        structured_llm = llm.with_structured_output(ContextualizedOutput)
        chain = prompt | structured_llm
        
        logfire.info("Memulai proses contextualizer pada Query user")
        
        # Eksekusi rewrite
        result = chain.invoke({"chat_history": history, "query": user_message})
        
        logfire.info(f"Selesai proses Contextualizer pada Query User")
        logfire.info(f"⏱️ [Contextualizer] Execution Time: {time.time() - start_time:.2f} seconds")
        return {"contextualized_query": result.standalone_query}
    
    except Exception as e:
        logfire.error(f"Contextualizer Node mengalami masalah : {e}")
        logfire.info(f"⏱️ [Contextualizer] Execution Time: {time.time() - start_time:.2f} seconds")
        return {"contextualized_query": ""}
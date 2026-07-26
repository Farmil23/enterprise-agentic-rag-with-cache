from typing import List
import logfire


def chunk_text(text: str, chunk_size: int = 1500) -> List[str]:
    """
     Semantic chunker dengan pemecahan rekursif (tanpa library)
    """
    
    with logfire.span("Text Chunking", text_length=len(text)):
        if not text.strip(): # Memastikan bahwa text tidak kosong dan ada 
            return []
            
        def split_text_with_fallback(text_to_split: str, separators: List[str]) -> List[str]:
            # Jika teks sudah lebih kecil dari chunk_size, tidak perlu dipecah lagi
            if len(text_to_split) <= chunk_size:
                return [text_to_split]
                
            # Coba gunakan pemisah dari yang paling besar (paragraf) ke paling kecil (karakter)
            for i, sep in enumerate(separators):
                # Gunakan separator ini jika ada di dalam teks, atau jika itu adalah separator terakhir ("")
                if sep == "" or sep in text_to_split:
                    splits = list(text_to_split) if sep == "" else text_to_split.split(sep)
                    
                    result_chunks = []
                    current_piece = ""
                    
                    for split in splits:
                        # Kembalikan separator ke teks (kecuali untuk pemecahan per karakter)
                        part = split + sep if sep != "" else split
                        
                        if len(current_piece) + len(part) <= chunk_size:
                            current_piece += part
                        else:
                            if current_piece:
                                result_chunks.append(current_piece)
                            
                            # Jika bagian ini sendiri masih lebih besar dari chunk_size
                            if len(part) > chunk_size:
                                # Jika masih ada pemisah yang lebih kecil, panggil fungsi ini lagi secara rekursif
                                if i + 1 < len(separators):
                                    result_chunks.extend(split_text_with_fallback(part, separators[i+1:]))
                                else:
                                    # Jalan terakhir: potong paksa per `chunk_size` karakter (hard slice)
                                    for j in range(0, len(part), chunk_size):
                                        result_chunks.append(part[j:j+chunk_size])
                                current_piece = "" # Reset karena bagian yang besar sudah ditangani
                            else:
                                current_piece = part
                    
                    if current_piece:
                        result_chunks.append(current_piece)
                    
                    return result_chunks
            
            return [text_to_split]

        # Urutan pemisah: Paragraf -> Baris Baru -> Titik (Kalimat) -> Koma -> Spasi (Kata) -> Karakter
        separators = ["\n\n", "\n", ". ", ", ", " ", ""]
        raw_chunks = split_text_with_fallback(text, separators)
        
        # lalu keseluruhan hasil akan disimpan pada valid chunks, sambil membersihkan spasi ekstra di awal/akhir
        valid_chunks = [c.strip() for c in raw_chunks if c.strip()]
        logfire.info(f" Generated {len(valid_chunks)} chunks")
        return valid_chunks

if __name__ == "__main__":
    text = """
        mendemonstrasikan penerapan konsep encapsulation, polymorphism, dan relasi antar kelas (one-to-many) dalam 
        membangun solusi perangkat lunak yang fungsional dan terstruktur.
        Abstrak - Perkembangan informasi digital yang masif menuntut efisiensi dalam pengelolaan referensi akademik 
        dan personal. Penelitian ini bertujuan untuk mengimplementasikan sistem Second Brain berbasis Java dengan 
        mengandalkan prinsip Pemrograman Berorientasi Objek (PBO) untuk melakukan ekstraksi informasi dari 
        dokumen secara otonom. Sistem ini dirancang menggunakan arsitektur inheritance dengan kelas abstrak 
        DocumentSource sebagai fondasi utama, yang kemudian diturunkan menjadi kelas spesifik seperti PDFDocument 
        dan TextNote. Metodologi pengembangan meliputi penggunaan library LangChain4j untuk integrasi Artificial 
        Intelligence (AI) dan Apache PDFBox untuk pemrosesan file PDF secara otomatis. Data yang diekstraksi 
        disimpan ke dalam VectorDatabase menggunakan koleksi ArrayList untuk mendukung pencarian informasi yang 
        relevan. Hasil dari implementasi ini menunjukkan bahwa agen cerdas SecondBrainAgent mampu mempelajari 
        konten dokumen dan memberikan respons kontekstual melalui integrasi API OpenAI. Proyek ini berhasil 
        mendemonstrasikan penerapan konsep encapsulation, polymorphism, dan relasi antar kelas (one-to-many) dalam 
        membangun solusi perangkat lunak yang fungsional dan terstruktur.
        Abstrak - Perkembangan informasi digital yang masif menuntut efisiensi dalam pengelolaan referensi akademik 
        dan personal. Penelitian ini bertujuan untuk mengimplementasikan sistem Second Brain berbasis Java dengan 
        mengandalkan prinsip Pemrograman Berorientasi Objek (PBO) untuk melakukan ekstraksi informasi dari 
        dokumen secara otonom. Sistem ini dirancang menggunakan arsitektur inheritance dengan kelas abstrak 
        DocumentSource sebagai fondasi utama, yang kemudian diturunkan menjadi kelas spesifik seperti PDFDocument 
        dan TextNote. Metodologi pengembangan meliputi penggunaan library LangChain4j untuk integrasi Artificial 
        Intelligence (AI) dan Apache PDFBox untuk pemrosesan file PDF secara otomatis. Data yang diekstraksi 
        disimpan ke dalam VectorDatabase menggunakan koleksi ArrayList untuk mendukung pencarian informasi yang 
        relevan. Hasil dari implementasi ini menunjukkan bahwa agen cerdas SecondBrainAgent mampu mempelajari 
        konten dokumen dan memberikan respons kontekstual melalui integrasi API OpenAI. Proyek ini berhasil 
        mendemonstrasikan penerapan konsep encapsulation, polymorphism, dan relasi antar kelas (one-to-many) dalam 
        membangun solusi perangkat lunak yang fungsional dan terstruktur.
        Abstrak - Perkembangan informasi digital yang masif menuntut efisiensi dalam pengelolaan referensi akademik 
        dan personal. Penelitian ini bertujuan untuk mengimplementasikan sistem Second Brain berbasis Java dengan 
        mengandalkan prinsip Pemrograman Berorientasi Objek (PBO) untuk melakukan ekstraksi informasi dari 
        dokumen secara otonom. Sistem ini dirancang menggunakan arsitektur inheritance dengan kelas abstrak 
        DocumentSource sebagai fondasi utama, yang kemudian diturunkan menjadi kelas spesifik seperti PDFDocument 
        dan TextNote. Metodologi pengembangan meliputi penggunaan library LangChain4j untuk integrasi Artificial 
        Intelligence (AI) dan Apache PDFBox untuk pemrosesan file PDF secara otomatis. Data yang diekstraksi 
        disimpan ke dalam VectorDatabase menggunakan koleksi ArrayList untuk mendukung pencarian informasi yang 
        relevan. Hasil dari implementasi ini menunjukkan bahwa agen cerdas SecondBrainAgent mampu mempelajari 
        konten dokumen dan memberikan respons kontekstual melalui integrasi API OpenAI. Proyek ini berhasil 
        mendemonstrasikan penerapan konsep encapsulation, polymorphism, dan relasi antar kelas (one-to-many) dalam 
        membangun solusi perangkat lunak yang fungsional dan terstruktur.
        
        
        Abstrak - Perkembangan informasi digital yang masif menuntut efisiensi dalam pengelolaan referensi akademik 
        dan personal. Penelitian ini bertujuan untuk mengimplementasikan sistem Second Brain berbasis Java dengan 
        mengandalkan prinsip Pemrograman Berorientasi Objek (PBO) untuk melakukan ekstraksi informasi dari 
        dokumen secara otonom. Sistem ini dirancang menggunakan arsitektur inheritance dengan kelas abstrak 
        DocumentSource sebagai fondasi utama, yang kemudian diturunkan menjadi kelas spesifik seperti PDFDocument 
        dan TextNote. Metodologi pengembangan meliputi penggunaan library LangChain4j untuk integrasi Artificial 
        Intelligence (AI) dan Apache PDFBox untuk pemrosesan file PDF secara otomatis. Data yang diekstraksi 
        disimpan ke dalam VectorDatabase menggunakan koleksi ArrayList untuk mendukung pencarian informasi yang 
        relevan. Hasil dari implementasi ini menunjukkan bahwa agen cerdas SecondBrainAgent mampu mempelajari 
        konten dokumen dan memberikan respons kontekstual melalui integrasi API OpenAI. Proyek ini berhasil 
        mendemonstrasikan penerapan konsep encapsulation, polymorphism, dan relasi antar kelas (one-to-many) dalam 
        membangun solusi perangkat lunak yang fungsional dan terstruktur.
        
    """
    
    chunks = chunk_text(text)
    for i, chunk in enumerate(chunks):
        print("chunk ke ", i," = ", chunk)
        print("=" * 40)

from bs4 import BeautifulSoup 
import logfire

def parse_html(file_path: str):
    """
    Parses HTML content using BeautifulSoup.
    Cleans scripts, styles, and extracts readable text for RAG.
    """
    with logfire.span("📄 HTML Parsing", filename=file_path): # Logging ketika berjalan parse html
        try:
            
            # Membaca file yang berdasarkan html 
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read() # isi dari file
            
            # Parser menggunakan beautifulsoup
            soup = BeautifulSoup(content, "html.parser")
            
            # setiap scrpt ketika parser dijalankan akan membuang tag tag tidak penting
            for script in soup(["script", "style", "meta", "noscript"]):
                script.decompose() # Menghilangkan detail html
                
            # 2. Mengambil seluruh isi konten dari File html
            text = soup.get_text(separator="\n")
            
            # 3. menghapus line yang tidak penting dan dijadikan chunk untuk setaip multiple spasi dan nantinya akan digabung dan menjadi text yang clean
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text_clean = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text_clean
        except Exception as e:
            logfire.error(f"❌ HTML Parse Failed: {e}")
            raise e
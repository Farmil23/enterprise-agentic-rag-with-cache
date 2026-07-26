from langgraph.checkpoint.memory import MemorySaver

# Kita gunakan MemorySaver (RAM lokal) agar responnya INSTAN!
# Aiven Postgres terbukti sangat lambat (memakan waktu 20 detik per node) karena masalah koneksi dari Indonesia ke server luar.
checkpointer = MemorySaver()


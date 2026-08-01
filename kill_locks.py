import psycopg, os
from dotenv import load_dotenv
load_dotenv()
url = os.getenv('POSTGRES_URL')
url += ('&' if '?' in url else '?') + 'sslmode=require'
conn = psycopg.connect(url, autocommit=True)
conn.execute("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = 'avnadmin' AND pid != pg_backend_pid();")
print('Killed all avnadmin sessions!')
conn.close()

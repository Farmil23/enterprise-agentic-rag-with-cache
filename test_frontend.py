import requests
import time

url = "http://127.0.0.1:8000/query"

print("--- Question 1 ---")
resp1 = requests.post(url, json={
    "q": "hay",
    "thread_id": "test_thread_123",
    "tenant_id": "kampus_a"
})
print("Q1 Status:", resp1.status_code)
print("Q1 Body:", resp1.json())

time.sleep(1)

print("\n--- Question 2 ---")
resp2 = requests.post(url, json={
    "q": "apa saja yang bisa aku tanyakan",
    "thread_id": "test_thread_123",
    "tenant_id": "kampus_a"
})
print("Q2 Status:", resp2.status_code)
print("Q2 Body:", resp2.json())

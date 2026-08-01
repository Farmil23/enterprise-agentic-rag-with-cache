import requests
print('Sending login request...', flush=True)
try:
    res = requests.post('http://127.0.0.1:8000/auth/login', json={'username': 'badsfarmil', 'password': 'password'}, timeout=5)
    print(res.status_code)
    print(res.text)
except Exception as e:
    print('Error:', e)

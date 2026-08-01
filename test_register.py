import requests
print('Sending request...', flush=True)
try:
    res = requests.post('http://127.0.0.1:8001/auth/register', json={'username': 'testuser1', 'password': 'password', 'tenant_id': 'master', 'role': 'regular_user'}, timeout=5)
    print(res.status_code)
    print(res.text)
except Exception as e:
    print('Error:', e)

import urllib.request
import time

url = 'http://127.0.0.1:8000/forecast'

for i in range(20):
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            body = resp.read().decode('utf-8')
            print(i, 'OK', resp.status, body[:200])
    except Exception as e:
        print(i, 'ERR', repr(e))
    time.sleep(0.5)

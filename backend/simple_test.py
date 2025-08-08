# Create simple_test.py
import requests

BASE_URL = "http://localhost:8000"

# Login Alice
login_data = {"email": "alice@test.com", "password": "password123"}
response = requests.post(f"{BASE_URL}/login", json=login_data)
print(f"Login status: {response.status_code}")

if response.status_code == 200:
    token = response.json()["access_token"]
    print("✅ Login successful")
    
    # Try creating circle
    headers = {"Authorization": f"Bearer {token}"}
    circle_data = {"name": "Test Circle"}
    response = requests.post(f"{BASE_URL}/circles", json=circle_data, headers=headers)
    
    print(f"Circle creation status: {response.status_code}")
    print(f"Response text: '{response.text}'")
    print(f"Response length: {len(response.text)}")
    
    if response.text:
        try:
            result = response.json()
            print(f"Success: {result}")
        except Exception as e:
            print(f"JSON error: {e}")
    else:
        print("❌ Empty response!")
else:
    print("❌ Login failed")
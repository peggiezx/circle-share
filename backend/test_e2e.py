import requests
import json

# Your FastAPI server URL
BASE_URL = "http://localhost:8000"

def test_circleshare_e2e():
    """Complete end-to-end test of CircleShare authorization system"""
    
    print("🚀 CircleShare End-to-End Test Starting...")
    
    # Step 1: Register users
    print("\n📝 Step 1: Registering users...")
    
    users = [
        {"name": "Alice", "email": "alice@test.com", "password": "password123"},
        {"name": "Bob", "email": "bob@test.com", "password": "password123"},
        {"name": "Charlie", "email": "charlie@test.com", "password": "password123"}
    ]
    
    for user in users:
        response = requests.post(f"{BASE_URL}/register", json=user)
        if response.status_code == 200:
            print(f"✅ {user['name']} registered successfully")
        else:
            print(f"⚠️ {user['name']} registration: {response.json()}")
    
    # Step 2: Login users and get tokens
    print("\n🔐 Step 2: Logging in users...")
    
    tokens = {}
    for user in users:
        login_data = {"email": user["email"], "password": user["password"]}
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            tokens[user["name"]] = token
            print(f"✅ {user['name']} logged in")
        else:
            print(f"❌ {user['name']} login failed: {response.json()}")
            return
    
    # Step 3: Alice creates a circle
    print("\n🔵 Step 3: Alice creates a family circle...")
    
    headers = {"Authorization": f"Bearer {tokens['Alice']}"}
    circle_data = {"name": "Alice's Family Circle"}
    response = requests.post(f"{BASE_URL}/circles", json=circle_data, headers=headers)
    
    if response.status_code == 200:
        try:
            circle = response.json()
            circle_id = circle["id"]
            print(f"✅ Alice created circle: {circle['name']} (ID: {circle_id})")
            print(f"   Members: {circle['member_count']}")
        except Exception as e:
            print(f"JSON parse error: {e}")
            print(f"Raw response: '{response.text}")
            return
        
    else:
        print(f"❌ Circle creation failed: {response.json()}")
        if response.text.strip():
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Raw response text: '{response.text}")
        else:
            print("Empty resonse - check server logs!")
        return
    
    # Step 4: Alice invites Bob
    print("\n📨 Step 4: Alice invites Bob to her circle...")
    
    invite_data = {"email": "bob@test.com"}
    response = requests.post(f"{BASE_URL}/circles/{circle_id}/invite", 
                           json=invite_data, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Bob invited successfully: {result['circle_joined']}")
    else:
        print(f"❌ Invitation failed: {response.json()}")
    
    # Step 5: Test authorization - Bob tries to invite Charlie (should fail)
    print("\n🚫 Step 5: Testing authorization - Bob tries to invite Charlie...")
    
    bob_headers = {"Authorization": f"Bearer {tokens['Bob']}"}
    charlie_invite = {"email": "charlie@test.com"}
    response = requests.post(f"{BASE_URL}/circles/{circle_id}/invite", 
                           json=charlie_invite, headers=bob_headers)
    
    if response.status_code == 403:
        print("✅ Authorization working! Bob cannot invite (only creator can)")
    else:
        print(f"❌ Authorization failed! Bob was able to invite: {response.json()}")
    
    # Step 6: Check everyone's circles
    print("\n👥 Step 6: Checking everyone's circles...")
    
    for name, token in tokens.items():
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/circles/my", headers=headers)
        
        if response.status_code == 200:
            circles = response.json()
            created = len(circles["created_circles"])
            member = len(circles["member_circles"])
            print(f"   {name}: Created {created}, Member of {member}")
        else:
            print(f"❌ {name} circles fetch failed")
    
    # Step 7: Charlie tries to leave Alice's circle (should fail - not a member)
    print("\n🚫 Step 7: Charlie tries to leave Alice's circle (not a member)...")
    
    charlie_headers = {"Authorization": f"Bearer {tokens['Charlie']}"}
    response = requests.delete(f"{BASE_URL}/circles/{circle_id}/leave", headers=charlie_headers)
    
    if response.status_code == 403:
        print("✅ Authorization working! Charlie cannot leave (not a member)")
    else:
        print(f"❌ Authorization failed: {response.json()}")
    
    # Step 8: Bob leaves the circle
    print("\n👋 Step 8: Bob leaves Alice's circle...")
    
    response = requests.delete(f"{BASE_URL}/circles/{circle_id}/leave", headers=bob_headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Bob left: {result['message']}")
    else:
        print(f"❌ Bob leave failed: {response.json()}")
    
    # Step 9: Alice leaves her own circle (should delete it)
    print("\n💥 Step 9: Alice leaves her own circle (should delete entire circle)...")
    
    headers = {"Authorization": f"Bearer {tokens['Alice']}"}
    response = requests.delete(f"{BASE_URL}/circles/{circle_id}/leave", headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Circle deleted: {result['message']}")
    else:
        print(f"❌ Circle deletion failed: {response.json()}")
    
    # Step 10: Verify circle is gone
    print("\n🔍 Step 10: Verifying circle is deleted...")
    
    response = requests.get(f"{BASE_URL}/circles/my", headers=headers)
    if response.status_code == 200:
        circles = response.json()
        total_circles = len(circles["created_circles"]) + len(circles["member_circles"])
        print(f"✅ Alice now has {total_circles} circles (should be 0)")
    
    print("\n🎉 End-to-End Test Complete!")

if __name__ == "__main__":
    test_circleshare_e2e()
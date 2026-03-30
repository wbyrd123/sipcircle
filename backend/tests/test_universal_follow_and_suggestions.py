"""
Test suite for SipCircle Universal Follow System and People You May Know
Tests: 
- Universal follow (any user can follow any user regardless of role)
- Bartender follows Bartender
- Bartender follows Customer
- Customer follows Customer
- Customer follows Bartender
- GET /api/suggestions endpoint
- Suggestions exclude already-followed users
- Suggestions exclude pending follow requests
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials - unique per test run
TEST_RUN_ID = uuid.uuid4().hex[:6]
TEST_PASSWORD = "Test123!"

# Test users
BARTENDER1_EMAIL = f"bartender1_{TEST_RUN_ID}@test.com"
BARTENDER1_USERNAME = f"bartender1_{TEST_RUN_ID}"
BARTENDER2_EMAIL = f"bartender2_{TEST_RUN_ID}@test.com"
BARTENDER2_USERNAME = f"bartender2_{TEST_RUN_ID}"
CUSTOMER1_EMAIL = f"customer1_{TEST_RUN_ID}@test.com"
CUSTOMER1_USERNAME = f"customer1_{TEST_RUN_ID}"
CUSTOMER2_EMAIL = f"customer2_{TEST_RUN_ID}@test.com"
CUSTOMER2_USERNAME = f"customer2_{TEST_RUN_ID}"


@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def test_users(api_client):
    """Setup all test users for the session"""
    users = {}
    
    # Register bartender1
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "email": BARTENDER1_EMAIL,
        "password": TEST_PASSWORD,
        "name": "Test Bartender One",
        "username": BARTENDER1_USERNAME,
        "role": "bartender"
    })
    if response.status_code in [200, 201]:
        data = response.json()
        users["bartender1"] = {"token": data["token"], "id": data["user"]["id"]}
        print(f"✓ Created bartender1: {BARTENDER1_USERNAME}")
    
    # Register bartender2
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "email": BARTENDER2_EMAIL,
        "password": TEST_PASSWORD,
        "name": "Test Bartender Two",
        "username": BARTENDER2_USERNAME,
        "role": "bartender"
    })
    if response.status_code in [200, 201]:
        data = response.json()
        users["bartender2"] = {"token": data["token"], "id": data["user"]["id"]}
        print(f"✓ Created bartender2: {BARTENDER2_USERNAME}")
    
    # Register customer1
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "email": CUSTOMER1_EMAIL,
        "password": TEST_PASSWORD,
        "name": "Test Customer One",
        "username": CUSTOMER1_USERNAME,
        "role": "customer"
    })
    if response.status_code in [200, 201]:
        data = response.json()
        users["customer1"] = {"token": data["token"], "id": data["user"]["id"]}
        print(f"✓ Created customer1: {CUSTOMER1_USERNAME}")
    
    # Register customer2
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "email": CUSTOMER2_EMAIL,
        "password": TEST_PASSWORD,
        "name": "Test Customer Two",
        "username": CUSTOMER2_USERNAME,
        "role": "customer"
    })
    if response.status_code in [200, 201]:
        data = response.json()
        users["customer2"] = {"token": data["token"], "id": data["user"]["id"]}
        print(f"✓ Created customer2: {CUSTOMER2_USERNAME}")
    
    # Disable follow approval for all users to test direct follows
    for key in ["bartender1", "bartender2"]:
        if key in users:
            api_client.put(
                f"{BASE_URL}/api/profile/bartender",
                json={"require_follow_approval": False},
                headers={"Authorization": f"Bearer {users[key]['token']}"}
            )
    
    for key in ["customer1", "customer2"]:
        if key in users:
            api_client.put(
                f"{BASE_URL}/api/profile/customer",
                json={"require_follow_approval": False},
                headers={"Authorization": f"Bearer {users[key]['token']}"}
            )
    
    return users


class TestUniversalFollowSystem:
    """Universal follow system - any user can follow any user"""
    
    # ==================== BARTENDER FOLLOWS BARTENDER ====================
    
    def test_bartender_follows_bartender(self, api_client, test_users):
        """Test that a bartender can follow another bartender"""
        if "bartender1" not in test_users or "bartender2" not in test_users:
            pytest.skip("Test users not created")
        
        bartender1_token = test_users["bartender1"]["token"]
        bartender2_id = test_users["bartender2"]["id"]
        bartender2_token = test_users["bartender2"]["token"]
        bartender1_id = test_users["bartender1"]["id"]
        
        # Bartender1 follows Bartender2
        response = api_client.post(
            f"{BASE_URL}/api/follow/{bartender2_id}",
            headers={"Authorization": f"Bearer {bartender1_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["status"] == "following"
        print(f"✓ Bartender1 follows Bartender2: {data}")
        
        # Verify by checking followers
        response = api_client.get(
            f"{BASE_URL}/api/followers",
            headers={"Authorization": f"Bearer {bartender2_token}"}
        )
        assert response.status_code == 200
        followers = response.json()
        bartender1_is_follower = any(f.get("id") == bartender1_id for f in followers)
        assert bartender1_is_follower, "Bartender1 should be in Bartender2's followers"
        print(f"✓ Verified: Bartender1 is in Bartender2's followers list")
    
    # ==================== BARTENDER FOLLOWS CUSTOMER ====================
    
    def test_bartender_follows_customer(self, api_client, test_users):
        """Test that a bartender can follow a customer"""
        if "bartender1" not in test_users or "customer1" not in test_users:
            pytest.skip("Test users not created")
        
        bartender1_token = test_users["bartender1"]["token"]
        customer1_id = test_users["customer1"]["id"]
        customer1_token = test_users["customer1"]["token"]
        bartender1_id = test_users["bartender1"]["id"]
        
        # Bartender1 follows Customer1
        response = api_client.post(
            f"{BASE_URL}/api/follow/{customer1_id}",
            headers={"Authorization": f"Bearer {bartender1_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["status"] == "following"
        print(f"✓ Bartender1 follows Customer1: {data}")
        
        # Verify by checking followers
        response = api_client.get(
            f"{BASE_URL}/api/followers",
            headers={"Authorization": f"Bearer {customer1_token}"}
        )
        assert response.status_code == 200
        followers = response.json()
        bartender1_is_follower = any(f.get("id") == bartender1_id for f in followers)
        assert bartender1_is_follower, "Bartender1 should be in Customer1's followers"
        print(f"✓ Verified: Bartender1 is in Customer1's followers list")
    
    # ==================== CUSTOMER FOLLOWS CUSTOMER ====================
    
    def test_customer_follows_customer(self, api_client, test_users):
        """Test that a customer can follow another customer"""
        if "customer1" not in test_users or "customer2" not in test_users:
            pytest.skip("Test users not created")
        
        customer1_token = test_users["customer1"]["token"]
        customer2_id = test_users["customer2"]["id"]
        customer2_token = test_users["customer2"]["token"]
        customer1_id = test_users["customer1"]["id"]
        
        # Customer1 follows Customer2
        response = api_client.post(
            f"{BASE_URL}/api/follow/{customer2_id}",
            headers={"Authorization": f"Bearer {customer1_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["status"] == "following"
        print(f"✓ Customer1 follows Customer2: {data}")
        
        # Verify by checking followers
        response = api_client.get(
            f"{BASE_URL}/api/followers",
            headers={"Authorization": f"Bearer {customer2_token}"}
        )
        assert response.status_code == 200
        followers = response.json()
        customer1_is_follower = any(f.get("id") == customer1_id for f in followers)
        assert customer1_is_follower, "Customer1 should be in Customer2's followers"
        print(f"✓ Verified: Customer1 is in Customer2's followers list")
    
    # ==================== CUSTOMER FOLLOWS BARTENDER ====================
    
    def test_customer_follows_bartender(self, api_client, test_users):
        """Test that a customer can follow a bartender"""
        if "customer2" not in test_users or "bartender2" not in test_users:
            pytest.skip("Test users not created")
        
        customer2_token = test_users["customer2"]["token"]
        bartender2_id = test_users["bartender2"]["id"]
        bartender2_token = test_users["bartender2"]["token"]
        customer2_id = test_users["customer2"]["id"]
        
        # Customer2 follows Bartender2
        response = api_client.post(
            f"{BASE_URL}/api/follow/{bartender2_id}",
            headers={"Authorization": f"Bearer {customer2_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["status"] == "following"
        print(f"✓ Customer2 follows Bartender2: {data}")
        
        # Verify by checking followers
        response = api_client.get(
            f"{BASE_URL}/api/followers",
            headers={"Authorization": f"Bearer {bartender2_token}"}
        )
        assert response.status_code == 200
        followers = response.json()
        customer2_is_follower = any(f.get("id") == customer2_id for f in followers)
        assert customer2_is_follower, "Customer2 should be in Bartender2's followers"
        print(f"✓ Verified: Customer2 is in Bartender2's followers list")


class TestSuggestionsEndpoint:
    """Tests for GET /api/suggestions (People You May Know)"""
    
    def test_suggestions_endpoint_returns_200(self, api_client, test_users):
        """Test that suggestions endpoint returns 200"""
        if "customer1" not in test_users:
            pytest.skip("Test user not created")
        
        response = api_client.get(
            f"{BASE_URL}/api/suggestions",
            headers={"Authorization": f"Bearer {test_users['customer1']['token']}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Suggestions should be a list"
        print(f"✓ Suggestions endpoint returns 200 with {len(data)} suggestions")
    
    def test_suggestions_have_required_fields(self, api_client, test_users):
        """Test that suggestions include required fields"""
        if "customer1" not in test_users:
            pytest.skip("Test user not created")
        
        response = api_client.get(
            f"{BASE_URL}/api/suggestions",
            headers={"Authorization": f"Bearer {test_users['customer1']['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            suggestion = data[0]
            # Check required fields
            assert "id" in suggestion, "Suggestion should have 'id'"
            assert "name" in suggestion, "Suggestion should have 'name'"
            assert "username" in suggestion, "Suggestion should have 'username'"
            assert "role" in suggestion, "Suggestion should have 'role'"
            assert "suggestion_reason" in suggestion, "Suggestion should have 'suggestion_reason'"
            assert "mutual_count" in suggestion, "Suggestion should have 'mutual_count'"
            
            # Verify suggestion_reason is valid
            valid_reasons = ["mutual", "popular", "location"]
            assert suggestion["suggestion_reason"] in valid_reasons, \
                f"suggestion_reason should be one of {valid_reasons}, got {suggestion['suggestion_reason']}"
            
            print(f"✓ Suggestion has all required fields: {list(suggestion.keys())}")
        else:
            print("✓ No suggestions returned (empty list is valid)")
    
    def test_suggestions_exclude_self(self, api_client, test_users):
        """Test that suggestions don't include the current user"""
        if "customer1" not in test_users:
            pytest.skip("Test user not created")
        
        user_id = test_users["customer1"]["id"]
        
        response = api_client.get(
            f"{BASE_URL}/api/suggestions",
            headers={"Authorization": f"Bearer {test_users['customer1']['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        user_ids = [s.get("id") for s in data]
        assert user_id not in user_ids, "Current user should not be in suggestions"
        print(f"✓ Current user is not in suggestions")
    
    def test_suggestions_exclude_already_followed(self, api_client, test_users):
        """Test that suggestions exclude users already being followed"""
        if "customer1" not in test_users or "bartender1" not in test_users:
            pytest.skip("Test users not created")
        
        # Customer1 already follows bartender1 from previous test
        # Get suggestions
        response = api_client.get(
            f"{BASE_URL}/api/suggestions",
            headers={"Authorization": f"Bearer {test_users['customer1']['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Customer1 follows customer2 from previous test
        user_ids = [s.get("id") for s in data]
        customer2_id = test_users.get("customer2", {}).get("id")
        if customer2_id:
            assert customer2_id not in user_ids, "Already followed user should not be in suggestions"
            print(f"✓ Already followed user is not in suggestions")
        else:
            print("✓ Test passed (no customer2 to check)")
    
    def test_bartender_gets_suggestions(self, api_client, test_users):
        """Test that bartender can get suggestions"""
        if "bartender1" not in test_users:
            pytest.skip("Bartender not created")
        
        response = api_client.get(
            f"{BASE_URL}/api/suggestions",
            headers={"Authorization": f"Bearer {test_users['bartender1']['token']}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Suggestions should be a list"
        print(f"✓ Bartender gets suggestions: {len(data)} suggestions returned")
    
    def test_customer_gets_suggestions(self, api_client, test_users):
        """Test that customer can get suggestions"""
        if "customer2" not in test_users:
            pytest.skip("Customer not created")
        
        response = api_client.get(
            f"{BASE_URL}/api/suggestions",
            headers={"Authorization": f"Bearer {test_users['customer2']['token']}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Suggestions should be a list"
        print(f"✓ Customer gets suggestions: {len(data)} suggestions returned")


class TestSuggestionsPendingExclusion:
    """Test that suggestions exclude pending follow requests"""
    
    def test_suggestions_exclude_pending_requests(self, api_client):
        """Test that suggestions exclude users with pending follow requests"""
        # Create a new user for this test
        test_id = uuid.uuid4().hex[:6]
        
        # Create requester user
        requester_email = f"requester_{test_id}@test.com"
        requester_username = f"requester_{test_id}"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": requester_email,
            "password": TEST_PASSWORD,
            "name": "Requester User",
            "username": requester_username,
            "role": "customer"
        })
        
        if response.status_code not in [200, 201]:
            pytest.skip("Could not create requester user")
        
        requester_data = response.json()
        requester_token = requester_data["token"]
        
        # Create target user with follow approval required
        target_email = f"target_{test_id}@test.com"
        target_username = f"target_{test_id}"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": target_email,
            "password": TEST_PASSWORD,
            "name": "Target User",
            "username": target_username,
            "role": "bartender"
        })
        
        if response.status_code not in [200, 201]:
            pytest.skip("Could not create target user")
        
        target_data = response.json()
        target_user_id = target_data["user"]["id"]
        target_token = target_data["token"]
        
        # Enable follow approval for target user
        api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": True},
            headers={"Authorization": f"Bearer {target_token}"}
        )
        
        # Send follow request (will be pending)
        response = api_client.post(
            f"{BASE_URL}/api/follow/{target_user_id}",
            headers={"Authorization": f"Bearer {requester_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["status"] == "pending"
        print(f"✓ Follow request is pending")
        
        # Get suggestions for requester
        response = api_client.get(
            f"{BASE_URL}/api/suggestions",
            headers={"Authorization": f"Bearer {requester_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        user_ids = [s.get("id") for s in data]
        assert target_user_id not in user_ids, "User with pending request should not be in suggestions"
        print(f"✓ User with pending follow request is not in suggestions")

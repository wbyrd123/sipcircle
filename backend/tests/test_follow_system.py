"""
Test suite for SipCircle Follow System
Tests: Follow requests, approval/denial, privacy settings, cancel pending requests
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_BARTENDER_EMAIL = f"testbartender_{uuid.uuid4().hex[:8]}@test.com"
TEST_BARTENDER_USERNAME = f"testbartender_{uuid.uuid4().hex[:8]}"
TEST_CUSTOMER_EMAIL = f"testcustomer_{uuid.uuid4().hex[:8]}@test.com"
TEST_CUSTOMER_USERNAME = f"testcustomer_{uuid.uuid4().hex[:8]}"
TEST_PASSWORD = "Test123!"


class TestFollowSystem:
    """Follow system endpoint tests"""
    
    bartender_token = None
    bartender_id = None
    customer_token = None
    customer_id = None
    
    @pytest.fixture(autouse=True)
    def setup(self, api_client):
        """Setup test users before running tests"""
        # Register bartender
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_BARTENDER_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test Bartender",
            "username": TEST_BARTENDER_USERNAME,
            "role": "bartender"
        })
        if response.status_code == 201 or response.status_code == 200:
            data = response.json()
            TestFollowSystem.bartender_token = data["token"]
            TestFollowSystem.bartender_id = data["user"]["id"]
        else:
            # Try login if already exists
            response = api_client.post(f"{BASE_URL}/api/auth/login", json={
                "identifier": TEST_BARTENDER_EMAIL,
                "password": TEST_PASSWORD
            })
            if response.status_code == 200:
                data = response.json()
                TestFollowSystem.bartender_token = data["token"]
                TestFollowSystem.bartender_id = data["user"]["id"]
        
        # Register customer
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_CUSTOMER_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test Customer",
            "username": TEST_CUSTOMER_USERNAME,
            "role": "customer"
        })
        if response.status_code == 201 or response.status_code == 200:
            data = response.json()
            TestFollowSystem.customer_token = data["token"]
            TestFollowSystem.customer_id = data["user"]["id"]
        else:
            # Try login if already exists
            response = api_client.post(f"{BASE_URL}/api/auth/login", json={
                "identifier": TEST_CUSTOMER_EMAIL,
                "password": TEST_PASSWORD
            })
            if response.status_code == 200:
                data = response.json()
                TestFollowSystem.customer_token = data["token"]
                TestFollowSystem.customer_id = data["user"]["id"]
    
    # ==================== DIRECT FOLLOW TESTS (No approval required) ====================
    
    def test_direct_follow_when_approval_not_required(self, api_client):
        """Test direct follow when target has approval disabled"""
        # Ensure bartender has approval disabled
        api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": False},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        # Customer follows bartender
        response = api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["status"] == "following"
        print(f"✓ Direct follow works: {data}")
    
    def test_unfollow_user(self, api_client):
        """Test unfollowing a user"""
        # First ensure following
        api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        # Unfollow
        response = api_client.delete(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Unfollow works: {data}")
    
    # ==================== FOLLOW REQUEST TESTS (Approval required) ====================
    
    def test_follow_request_when_approval_required(self, api_client):
        """Test follow request is created when target requires approval"""
        # Enable approval requirement for bartender
        response = api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": True},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        assert response.status_code == 200
        print(f"✓ Enabled follow approval for bartender")
        
        # Customer tries to follow bartender
        response = api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["status"] == "pending"
        print(f"✓ Follow request created: {data}")
    
    def test_get_follow_requests(self, api_client):
        """Test getting pending follow requests"""
        response = api_client.get(
            f"{BASE_URL}/api/follow-requests",
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got follow requests: {len(data)} requests")
        
        # Check if customer is in the requests
        customer_in_requests = any(r.get("id") == self.customer_id for r in data)
        print(f"  Customer in requests: {customer_in_requests}")
    
    def test_approve_follow_request(self, api_client):
        """Test approving a follow request"""
        # First ensure there's a pending request
        api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": True},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        # Remove any existing follow relationship
        api_client.delete(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        # Create follow request
        api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        # Approve the request
        response = api_client.post(
            f"{BASE_URL}/api/follow-requests/{self.customer_id}/approve",
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Follow request approved: {data}")
        
        # Verify customer is now in followers
        response = api_client.get(
            f"{BASE_URL}/api/followers",
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        assert response.status_code == 200
        followers = response.json()
        customer_is_follower = any(f.get("id") == self.customer_id for f in followers)
        assert customer_is_follower, "Customer should be in followers after approval"
        print(f"✓ Customer is now a follower")
    
    def test_deny_follow_request(self, api_client):
        """Test denying a follow request"""
        # Setup: Remove existing relationship and create new request
        api_client.delete(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": True},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        # Deny the request
        response = api_client.post(
            f"{BASE_URL}/api/follow-requests/{self.customer_id}/deny",
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Follow request denied: {data}")
        
        # Verify customer is NOT in followers
        response = api_client.get(
            f"{BASE_URL}/api/followers",
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        followers = response.json()
        customer_is_follower = any(f.get("id") == self.customer_id for f in followers)
        assert not customer_is_follower, "Customer should NOT be in followers after denial"
        print(f"✓ Customer is not a follower after denial")
    
    def test_cancel_pending_follow_request(self, api_client):
        """Test cancelling a pending follow request"""
        # Setup: Create a pending request
        api_client.delete(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": True},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        # Cancel the request (using unfollow endpoint)
        response = api_client.delete(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Pending request cancelled: {data}")
        
        # Verify request is no longer pending
        response = api_client.get(
            f"{BASE_URL}/api/follow-requests",
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        requests_list = response.json()
        customer_in_requests = any(r.get("id") == self.customer_id for r in requests_list)
        assert not customer_in_requests, "Customer should not be in pending requests after cancellation"
        print(f"✓ Customer removed from pending requests")
    
    # ==================== PROFILE ENDPOINT TESTS ====================
    
    def test_user_profile_shows_follow_status(self, api_client):
        """Test that user profile endpoint returns correct follow status"""
        response = api_client.get(
            f"{BASE_URL}/api/user/{TEST_BARTENDER_USERNAME}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "is_following" in data
        assert "is_pending" in data
        assert "follower_count" in data
        assert "following_count" in data
        print(f"✓ User profile has follow status: is_following={data['is_following']}, is_pending={data['is_pending']}")
    
    def test_bartender_profile_shows_follow_status(self, api_client):
        """Test that bartender profile endpoint returns correct follow status"""
        response = api_client.get(
            f"{BASE_URL}/api/bartender/{TEST_BARTENDER_USERNAME}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "is_following" in data
        assert "is_pending" in data
        assert "follower_count" in data
        print(f"✓ Bartender profile has follow status: is_following={data['is_following']}, is_pending={data['is_pending']}")
    
    # ==================== PRIVACY SETTINGS TESTS ====================
    
    def test_update_bartender_privacy_settings(self, api_client):
        """Test updating bartender privacy settings"""
        # Enable approval
        response = api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": True},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("require_follow_approval") == True
        print(f"✓ Bartender privacy setting updated to require approval")
        
        # Disable approval
        response = api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": False},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("require_follow_approval") == False
        print(f"✓ Bartender privacy setting updated to not require approval")
    
    def test_update_customer_privacy_settings(self, api_client):
        """Test updating customer privacy settings"""
        # Enable approval
        response = api_client.put(
            f"{BASE_URL}/api/profile/customer",
            json={"require_follow_approval": True},
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("require_follow_approval") == True
        print(f"✓ Customer privacy setting updated to require approval")
    
    # ==================== EDGE CASES ====================
    
    def test_cannot_follow_self(self, api_client):
        """Test that user cannot follow themselves"""
        response = api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        assert response.status_code == 400
        print(f"✓ Cannot follow self - returns 400")
    
    def test_already_following_returns_success(self, api_client):
        """Test that following someone already followed returns success"""
        # Disable approval and follow
        api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": False},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        # Try to follow again
        response = api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "following"
        print(f"✓ Already following returns success with status=following")
    
    def test_already_pending_returns_success(self, api_client):
        """Test that requesting to follow when already pending returns success"""
        # Enable approval and create request
        api_client.delete(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        api_client.put(
            f"{BASE_URL}/api/profile/bartender",
            json={"require_follow_approval": True},
            headers={"Authorization": f"Bearer {self.bartender_token}"}
        )
        
        api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        # Try to follow again
        response = api_client.post(
            f"{BASE_URL}/api/follow/{self.bartender_id}",
            headers={"Authorization": f"Bearer {self.customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending"
        print(f"✓ Already pending returns success with status=pending")


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

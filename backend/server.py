from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'sipcircle-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Object Storage Config
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "sipcircle"
storage_key = None

# Create the main app
app = FastAPI(title="SipCircle API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== STORAGE FUNCTIONS =====================
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY not set, storage disabled")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage not available")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage not available")
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ===================== MODELS =====================
class UserRole:
    BARTENDER = "bartender"
    CUSTOMER = "customer"

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    username: str
    role: str  # 'bartender' or 'customer'

class LoginRequest(BaseModel):
    identifier: str  # Can be email or username
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

class Drink(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    ingredients: Optional[str] = None
    price: Optional[str] = None

class WorkLocation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    schedule: List[dict] = []  # [{day: "Monday", start: "18:00", end: "02:00"}]
    happy_hours: List[dict] = []  # [{day: "Monday", start: "17:00", end: "19:00", description: "Half off wells", drinks: [...]}]
    signature_drinks: List[dict] = []  # [{name, ingredients, price}]
    maps_url: Optional[str] = None

class BartenderProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    venmo_link: Optional[str] = None
    cashapp_link: Optional[str] = None
    paypal_link: Optional[str] = None
    work_locations: Optional[List[WorkLocation]] = None
    require_follow_approval: Optional[bool] = None

class CustomerProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    require_follow_approval: Optional[bool] = None

class MessageCreate(BaseModel):
    recipient_id: str
    content: str

class InviteCreate(BaseModel):
    recipient_ids: List[str]
    location_name: str
    address: Optional[str] = None
    maps_url: Optional[str] = None
    datetime_str: str
    message: Optional[str] = None

# ===================== AUTH HELPERS =====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(authorization: str = Header(None), auth: str = Query(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    elif auth:
        token = auth
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        return user
    except:
        return None

# ===================== AUTH ROUTES =====================
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    # Check existing
    if await db.users.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await db.users.find_one({"username": req.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    if req.role not in [UserRole.BARTENDER, UserRole.CUSTOMER]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "name": req.name,
        "username": req.username,
        "role": req.role,
        "profile_image": None,
        "bio": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "followers": [],
        "following": [],
        "blocked_users": [],
        "follow_requests": [],
        "pending_follows": [],
        "require_follow_approval": False
    }
    
    if req.role == UserRole.BARTENDER:
        user["venmo_link"] = ""
        user["cashapp_link"] = ""
        user["paypal_link"] = ""
        user["work_locations"] = []
    
    await db.users.insert_one(user)
    
    # Exclude _id (added by MongoDB) and password_hash from response
    user_response = {k: v for k, v in user.items() if k not in ["password_hash", "_id"]}
    token = create_token(user_id)
    return {"token": token, "user": user_response}

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    # Check if identifier is email or username (case-insensitive)
    identifier = req.identifier.lower().strip()
    
    # Try to find by email first, then by username (case-insensitive)
    if "@" in identifier:
        user = await db.users.find_one({"email": {"$regex": f"^{identifier}$", "$options": "i"}}, {"_id": 0})
    else:
        user = await db.users.find_one({"username": {"$regex": f"^{identifier}$", "$options": "i"}}, {"_id": 0})
    
    # If not found by the assumed type, try the other
    if not user:
        user = await db.users.find_one(
            {"$or": [
                {"email": {"$regex": f"^{identifier}$", "$options": "i"}}, 
                {"username": {"$regex": f"^{identifier}$", "$options": "i"}}
            ]}, 
            {"_id": 0}
        )
    
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    token = create_token(user["id"])
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "password_hash"}

# ===================== PROFILE ROUTES =====================
@api_router.put("/profile/bartender")
async def update_bartender_profile(update: BartenderProfileUpdate, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.BARTENDER:
        raise HTTPException(status_code=403, detail="Only bartenders can update bartender profile")
    
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    if "work_locations" in update_dict:
        update_dict["work_locations"] = [loc.model_dump() if hasattr(loc, 'model_dump') else loc for loc in update_dict["work_locations"]]
    
    if update_dict:
        await db.users.update_one({"id": user["id"]}, {"$set": update_dict})
    
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated

@api_router.put("/profile/customer")
async def update_customer_profile(update: CustomerProfileUpdate, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can update customer profile")
    
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_dict:
        await db.users.update_one({"id": user["id"]}, {"$set": update_dict})
    
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated

@api_router.post("/profile/image")
async def upload_profile_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/profiles/{user['id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    
    result = put_object(path, data, file.content_type)
    await db.users.update_one({"id": user["id"]}, {"$set": {"profile_image": result["path"]}})
    
    return {"path": result["path"]}

@api_router.get("/files/{path:path}")
async def get_file(path: str, user: dict = Depends(get_optional_user)):
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found")

# ===================== USER DISCOVERY =====================
@api_router.get("/bartenders")
async def list_bartenders(search: str = None, user: dict = Depends(get_optional_user)):
    query = {"role": UserRole.BARTENDER}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"username": {"$regex": search, "$options": "i"}},
            {"work_locations.name": {"$regex": search, "$options": "i"}}
        ]
    
    bartenders = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(100)
    return bartenders

@api_router.get("/users")
async def list_users(search: str = None, role: str = None, user: dict = Depends(get_optional_user)):
    query = {}
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"username": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(100)
    return users

@api_router.get("/bartender/{username}")
async def get_bartender_profile(username: str, user: dict = Depends(get_optional_user)):
    bartender = await db.users.find_one({"username": username, "role": UserRole.BARTENDER}, {"_id": 0, "password_hash": 0})
    if not bartender:
        raise HTTPException(status_code=404, detail="Bartender not found")
    
    # Check if blocked
    if user and user["id"] in bartender.get("blocked_users", []):
        raise HTTPException(status_code=403, detail="You are blocked by this bartender")
    
    # Check follow status
    is_following = user and user["id"] in bartender.get("followers", [])
    is_pending = user and user["id"] in bartender.get("follow_requests", [])
    bartender["is_following"] = is_following
    bartender["is_pending"] = is_pending
    bartender["follower_count"] = len(bartender.get("followers", []))
    
    return bartender

@api_router.get("/user/{username}")
async def get_user_profile(username: str, user: dict = Depends(get_optional_user)):
    profile = await db.users.find_one({"username": username}, {"_id": 0, "password_hash": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if blocked
    if user and user["id"] in profile.get("blocked_users", []):
        raise HTTPException(status_code=403, detail="You are blocked by this user")
    
    # Check follow status
    is_following = user and user["id"] in profile.get("followers", [])
    is_pending = user and user["id"] in profile.get("follow_requests", [])
    profile["is_following"] = is_following
    profile["is_pending"] = is_pending
    profile["follower_count"] = len(profile.get("followers", []))
    profile["following_count"] = len(profile.get("following", []))
    
    return profile

# ===================== FOLLOW SYSTEM =====================
@api_router.post("/follow/{target_id}")
async def follow_user(target_id: str, user: dict = Depends(get_current_user)):
    if target_id == user["id"]:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")
    
    target = await db.users.find_one({"id": target_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["id"] in target.get("blocked_users", []):
        raise HTTPException(status_code=403, detail="You are blocked by this user")
    
    # Check if already following
    if user["id"] in target.get("followers", []):
        return {"success": True, "message": "Already following", "status": "following"}
    
    # Check if already requested
    if user["id"] in target.get("follow_requests", []):
        return {"success": True, "message": "Request already pending", "status": "pending"}
    
    # Check if approval is required
    if target.get("require_follow_approval", False):
        # Add to follow requests
        await db.users.update_one({"id": target_id}, {"$addToSet": {"follow_requests": user["id"]}})
        await db.users.update_one({"id": user["id"]}, {"$addToSet": {"pending_follows": target_id}})
        return {"success": True, "message": "Follow request sent", "status": "pending"}
    else:
        # Direct follow
        await db.users.update_one({"id": target_id}, {"$addToSet": {"followers": user["id"]}})
        await db.users.update_one({"id": user["id"]}, {"$addToSet": {"following": target_id}})
        return {"success": True, "message": "Now following", "status": "following"}

@api_router.delete("/follow/{target_id}")
async def unfollow_user(target_id: str, user: dict = Depends(get_current_user)):
    # Remove from followers/following
    await db.users.update_one({"id": target_id}, {"$pull": {"followers": user["id"]}})
    await db.users.update_one({"id": user["id"]}, {"$pull": {"following": target_id}})
    # Also remove any pending requests
    await db.users.update_one({"id": target_id}, {"$pull": {"follow_requests": user["id"]}})
    await db.users.update_one({"id": user["id"]}, {"$pull": {"pending_follows": target_id}})
    return {"success": True, "message": "Unfollowed"}

@api_router.get("/follow-requests")
async def get_follow_requests(user: dict = Depends(get_current_user)):
    request_ids = user.get("follow_requests", [])
    requesters = await db.users.find({"id": {"$in": request_ids}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return requesters

@api_router.post("/follow-requests/{requester_id}/approve")
async def approve_follow_request(requester_id: str, user: dict = Depends(get_current_user)):
    # Check if request exists
    if requester_id not in user.get("follow_requests", []):
        raise HTTPException(status_code=404, detail="Follow request not found")
    
    # Remove from requests and add to followers
    await db.users.update_one({"id": user["id"]}, {
        "$pull": {"follow_requests": requester_id},
        "$addToSet": {"followers": requester_id}
    })
    # Update requester
    await db.users.update_one({"id": requester_id}, {
        "$pull": {"pending_follows": user["id"]},
        "$addToSet": {"following": user["id"]}
    })
    return {"success": True, "message": "Follow request approved"}

@api_router.post("/follow-requests/{requester_id}/deny")
async def deny_follow_request(requester_id: str, user: dict = Depends(get_current_user)):
    # Remove from requests
    await db.users.update_one({"id": user["id"]}, {"$pull": {"follow_requests": requester_id}})
    await db.users.update_one({"id": requester_id}, {"$pull": {"pending_follows": user["id"]}})
    return {"success": True, "message": "Follow request denied"}

@api_router.get("/followers")
async def get_followers(user: dict = Depends(get_current_user)):
    follower_ids = user.get("followers", [])
    followers = await db.users.find({"id": {"$in": follower_ids}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return followers

@api_router.get("/following")
async def get_following(user: dict = Depends(get_current_user)):
    following_ids = user.get("following", [])
    following = await db.users.find({"id": {"$in": following_ids}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return following

# ===================== PEOPLE YOU MAY KNOW =====================
@api_router.get("/suggestions")
async def get_people_you_may_know(user: dict = Depends(get_current_user)):
    """
    Returns suggested users based on:
    1. Mutual followers (people followed by people you follow)
    2. Users with similar interests (same locations for bartenders)
    3. Random popular users you don't follow yet
    """
    user_id = user["id"]
    following_ids = set(user.get("following", []))
    blocked_ids = set(user.get("blocked_users", []))
    pending_ids = set(user.get("pending_follows", []))
    
    # Exclude: self, already following, pending requests, blocked
    exclude_ids = following_ids | {user_id} | blocked_ids | pending_ids
    
    suggestions = {}
    
    # 1. Mutual connections: Get users followed by people you follow
    if following_ids:
        following_users = await db.users.find(
            {"id": {"$in": list(following_ids)}},
            {"following": 1, "followers": 1}
        ).to_list(100)
        
        for followed_user in following_users:
            # People they follow that you don't
            for their_following in followed_user.get("following", []):
                if their_following not in exclude_ids:
                    if their_following not in suggestions:
                        suggestions[their_following] = {"score": 0, "reason": "mutual"}
                    suggestions[their_following]["score"] += 2
            
            # People who follow them that you don't follow
            for their_follower in followed_user.get("followers", []):
                if their_follower not in exclude_ids:
                    if their_follower not in suggestions:
                        suggestions[their_follower] = {"score": 0, "reason": "mutual"}
                    suggestions[their_follower]["score"] += 1
    
    # 2. For bartenders: Suggest other bartenders at similar locations
    if user.get("role") == "bartender" and user.get("work_locations"):
        user_location_names = [loc.get("name", "").lower() for loc in user.get("work_locations", [])]
        if user_location_names:
            similar_bartenders = await db.users.find(
                {
                    "role": "bartender",
                    "id": {"$nin": list(exclude_ids)},
                    "work_locations.name": {"$regex": "|".join(user_location_names), "$options": "i"}
                },
                {"_id": 0, "password_hash": 0}
            ).to_list(20)
            
            for bartender in similar_bartenders:
                if bartender["id"] not in suggestions:
                    suggestions[bartender["id"]] = {"score": 0, "reason": "location"}
                suggestions[bartender["id"]]["score"] += 3
    
    # 3. Add popular users (high follower count) not yet followed
    popular_users = await db.users.find(
        {"id": {"$nin": list(exclude_ids)}},
        {"_id": 0, "password_hash": 0}
    ).sort("followers", -1).limit(50).to_list(50)
    
    for pop_user in popular_users:
        follower_count = len(pop_user.get("followers", []))
        if pop_user["id"] not in suggestions:
            suggestions[pop_user["id"]] = {"score": 0, "reason": "popular"}
        suggestions[pop_user["id"]]["score"] += min(follower_count, 5)  # Cap at 5 points
    
    # Sort by score and get top 10
    sorted_suggestions = sorted(suggestions.items(), key=lambda x: x[1]["score"], reverse=True)[:10]
    suggestion_ids = [s[0] for s in sorted_suggestions]
    
    if not suggestion_ids:
        return []
    
    # Fetch full user data
    suggested_users = await db.users.find(
        {"id": {"$in": suggestion_ids}},
        {"_id": 0, "password_hash": 0}
    ).to_list(10)
    
    # Add reason and mutual count to each suggestion
    user_map = {u["id"]: u for u in suggested_users}
    result = []
    for user_id, data in sorted_suggestions:
        if user_id in user_map:
            user_data = user_map[user_id]
            # Count mutual connections
            their_followers = set(user_data.get("followers", []))
            mutual_count = len(following_ids & their_followers)
            user_data["mutual_count"] = mutual_count
            user_data["suggestion_reason"] = data["reason"]
            result.append(user_data)
    
    return result

# ===================== BLOCK SYSTEM =====================
@api_router.post("/block/{user_id}")
async def block_user(user_id: str, user: dict = Depends(get_current_user)):
    # All users (bartenders and bar-goers) can block other users
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="You cannot block yourself")
    
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"blocked_users": user_id}})
    # Also remove from followers
    await db.users.update_one({"id": user["id"]}, {"$pull": {"followers": user_id}})
    await db.users.update_one({"id": user_id}, {"$pull": {"following": user["id"]}})
    
    return {"success": True, "message": "User blocked"}

@api_router.delete("/block/{user_id}")
async def unblock_user(user_id: str, user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$pull": {"blocked_users": user_id}})
    return {"success": True, "message": "User unblocked"}

@api_router.get("/blocked")
async def get_blocked_users(user: dict = Depends(get_current_user)):
    blocked_ids = user.get("blocked_users", [])
    blocked = await db.users.find({"id": {"$in": blocked_ids}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return blocked

# ===================== REPORTING =====================
class ReportCreate(BaseModel):
    reason: str
    details: Optional[str] = None

@api_router.post("/report/{user_id}")
async def report_user(user_id: str, report: ReportCreate, user: dict = Depends(get_current_user)):
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="You cannot report yourself")
    
    reported_user = await db.users.find_one({"id": user_id})
    if not reported_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    report_entry = {
        "id": str(uuid.uuid4()),
        "reporter_id": user["id"],
        "reporter_username": user.get("username"),
        "reported_user_id": user_id,
        "reported_username": reported_user.get("username"),
        "reason": report.reason,
        "details": report.details,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reports.insert_one(report_entry)
    return {"success": True, "message": "Report submitted. Thank you for helping keep PourCircle safe."}

@api_router.get("/reports")
async def get_reports(user: dict = Depends(get_current_user)):
    # Only allow admins to view reports (for now, just return empty for regular users)
    # In production, you'd check for admin role
    return []

# ===================== MESSAGING =====================
@api_router.post("/messages")
async def send_message(msg: MessageCreate, user: dict = Depends(get_current_user)):
    recipient = await db.users.find_one({"id": msg.recipient_id})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Check if blocked
    if user["id"] in recipient.get("blocked_users", []):
        raise HTTPException(status_code=403, detail="You cannot message this user")
    
    message = {
        "id": str(uuid.uuid4()),
        "sender_id": user["id"],
        "sender_name": user["name"],
        "sender_username": user["username"],
        "recipient_id": msg.recipient_id,
        "content": msg.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message)
    return {"id": message["id"], "success": True}

@api_router.get("/messages")
async def get_messages(user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {"$or": [{"sender_id": user["id"]}, {"recipient_id": user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return messages

@api_router.get("/messages/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    # Get unique conversation partners
    messages = await db.messages.find(
        {"$or": [{"sender_id": user["id"]}, {"recipient_id": user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    conversations = {}
    for msg in messages:
        partner_id = msg["recipient_id"] if msg["sender_id"] == user["id"] else msg["sender_id"]
        if partner_id not in conversations:
            conversations[partner_id] = {
                "partner_id": partner_id,
                "last_message": msg,
                "unread_count": 0
            }
        if msg["recipient_id"] == user["id"] and not msg["read"]:
            conversations[partner_id]["unread_count"] += 1
    
    # Get partner details
    partner_ids = list(conversations.keys())
    partners = await db.users.find({"id": {"$in": partner_ids}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    partner_map = {p["id"]: p for p in partners}
    
    result = []
    for partner_id, conv in conversations.items():
        if partner_id in partner_map:
            conv["partner"] = partner_map[partner_id]
            result.append(conv)
    
    return result

@api_router.get("/messages/{partner_id}")
async def get_conversation(partner_id: str, user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {"$or": [
            {"sender_id": user["id"], "recipient_id": partner_id},
            {"sender_id": partner_id, "recipient_id": user["id"]}
        ]},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    # Mark as read
    await db.messages.update_many(
        {"sender_id": partner_id, "recipient_id": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    
    return messages

# ===================== INVITES =====================
@api_router.post("/invites")
async def create_invite(invite: InviteCreate, user: dict = Depends(get_current_user)):
    invite_doc = {
        "id": str(uuid.uuid4()),
        "creator_id": user["id"],
        "creator_name": user["name"],
        "creator_username": user["username"],
        "recipient_ids": invite.recipient_ids,
        "location_name": invite.location_name,
        "address": invite.address,
        "maps_url": invite.maps_url,
        "datetime_str": invite.datetime_str,
        "message": invite.message,
        "responses": {},  # {user_id: "accepted"|"declined"|"maybe"}
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.invites.insert_one(invite_doc)
    return {"id": invite_doc["id"], "success": True}

@api_router.get("/invites")
async def get_invites(user: dict = Depends(get_current_user)):
    invites = await db.invites.find(
        {"$or": [{"creator_id": user["id"]}, {"recipient_ids": user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return invites

@api_router.post("/invites/{invite_id}/respond")
async def respond_to_invite(invite_id: str, response: str, user: dict = Depends(get_current_user)):
    if response not in ["accepted", "declined", "maybe"]:
        raise HTTPException(status_code=400, detail="Invalid response")
    
    await db.invites.update_one(
        {"id": invite_id},
        {"$set": {f"responses.{user['id']}": response}}
    )
    return {"success": True}

# ===================== HEALTH CHECK =====================
@api_router.get("/")
async def root():
    return {"message": "SipCircle API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "storage": storage_key is not None}

# ===================== DELETE ACCOUNT =====================
@api_router.delete("/account")
async def delete_account(user: dict = Depends(get_current_user)):
    user_id = user["id"]
    
    # Remove user from all followers/following lists
    await db.users.update_many(
        {"followers": user_id},
        {"$pull": {"followers": user_id}}
    )
    await db.users.update_many(
        {"following": user_id},
        {"$pull": {"following": user_id}}
    )
    await db.users.update_many(
        {"blocked_users": user_id},
        {"$pull": {"blocked_users": user_id}}
    )
    
    # Delete user's messages
    await db.messages.delete_many({"$or": [{"sender_id": user_id}, {"recipient_id": user_id}]})
    
    # Delete user's invites
    await db.invites.delete_many({"creator_id": user_id})
    
    # Remove user from invite recipient lists
    await db.invites.update_many(
        {"recipient_ids": user_id},
        {"$pull": {"recipient_ids": user_id}}
    )
    
    # Delete user
    await db.users.delete_one({"id": user_id})
    
    return {"success": True, "message": "Account deleted"}

# ===================== ADMIN ENDPOINTS =====================
ADMIN_USERNAMES = ["wbyrd123"]  # Add admin usernames here

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if user.get("username") not in ADMIN_USERNAMES:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@api_router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.get("/admin/users/{user_id}")
async def admin_get_user(user_id: str, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User deleted"}

@api_router.get("/admin/reports")
async def admin_get_reports(admin: dict = Depends(get_admin_user)):
    reports = await db.reports.find({}, {"_id": 0}).to_list(1000)
    return reports

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Initialize storage
    init_storage()
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.messages.create_index([("sender_id", 1), ("recipient_id", 1)])
    await db.invites.create_index("creator_id")
    logger.info("SipCircle API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

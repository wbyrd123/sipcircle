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
JWT_SECRET = os.environ.get('JWT_SECRET', 'pourpal-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Object Storage Config
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "pourpal"
storage_key = None

# Create the main app
app = FastAPI(title="PourPal API")
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

class WorkLocation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    schedule: List[dict] = []  # [{day: "Monday", start: "18:00", end: "02:00"}]
    happy_hours: List[dict] = []  # [{day: "Monday", start: "17:00", end: "19:00", description: "Half off wells"}]
    drinks: List[str] = []  # ["Margarita", "Old Fashioned"]
    maps_url: Optional[str] = None

class BartenderProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    venmo_link: Optional[str] = None
    cashapp_link: Optional[str] = None
    paypal_link: Optional[str] = None
    work_locations: Optional[List[WorkLocation]] = None

class CustomerProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None

class MessageCreate(BaseModel):
    recipient_id: str
    content: str

class InviteCreate(BaseModel):
    recipient_ids: List[str]
    location_name: str
    address: str
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
        "blocked_users": []
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
    # Check if identifier is email or username
    identifier = req.identifier.lower().strip()
    
    # Try to find by email first, then by username
    if "@" in identifier:
        user = await db.users.find_one({"email": identifier}, {"_id": 0})
    else:
        user = await db.users.find_one({"username": identifier}, {"_id": 0})
    
    # If not found by the assumed type, try the other
    if not user:
        user = await db.users.find_one(
            {"$or": [{"email": identifier}, {"username": identifier}]}, 
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

@api_router.get("/bartender/{username}")
async def get_bartender_profile(username: str, user: dict = Depends(get_optional_user)):
    bartender = await db.users.find_one({"username": username, "role": UserRole.BARTENDER}, {"_id": 0, "password_hash": 0})
    if not bartender:
        raise HTTPException(status_code=404, detail="Bartender not found")
    
    # Check if blocked
    if user and user["id"] in bartender.get("blocked_users", []):
        raise HTTPException(status_code=403, detail="You are blocked by this bartender")
    
    # Check if following
    is_following = user and user["id"] in bartender.get("followers", [])
    bartender["is_following"] = is_following
    bartender["follower_count"] = len(bartender.get("followers", []))
    
    return bartender

# ===================== FOLLOW SYSTEM =====================
@api_router.post("/follow/{bartender_id}")
async def follow_bartender(bartender_id: str, user: dict = Depends(get_current_user)):
    bartender = await db.users.find_one({"id": bartender_id, "role": UserRole.BARTENDER})
    if not bartender:
        raise HTTPException(status_code=404, detail="Bartender not found")
    
    if user["id"] in bartender.get("blocked_users", []):
        raise HTTPException(status_code=403, detail="You are blocked by this bartender")
    
    await db.users.update_one({"id": bartender_id}, {"$addToSet": {"followers": user["id"]}})
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"following": bartender_id}})
    
    return {"success": True, "message": "Now following"}

@api_router.delete("/follow/{bartender_id}")
async def unfollow_bartender(bartender_id: str, user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": bartender_id}, {"$pull": {"followers": user["id"]}})
    await db.users.update_one({"id": user["id"]}, {"$pull": {"following": bartender_id}})
    return {"success": True, "message": "Unfollowed"}

@api_router.get("/followers")
async def get_followers(user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.BARTENDER:
        raise HTTPException(status_code=403, detail="Only bartenders have followers")
    
    follower_ids = user.get("followers", [])
    followers = await db.users.find({"id": {"$in": follower_ids}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return followers

@api_router.get("/following")
async def get_following(user: dict = Depends(get_current_user)):
    following_ids = user.get("following", [])
    following = await db.users.find({"id": {"$in": following_ids}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return following

# ===================== BLOCK SYSTEM =====================
@api_router.post("/block/{user_id}")
async def block_user(user_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != UserRole.BARTENDER:
        raise HTTPException(status_code=403, detail="Only bartenders can block users")
    
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
    return {"message": "PourPal API", "status": "running"}

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
    logger.info("PourPal API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

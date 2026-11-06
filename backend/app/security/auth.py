import time
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from app.core.config import settings
from app.security.passwords import hash_password, verify_password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

class User(BaseModel):
    id: str
    email: str
    full_name: str
    role: str  # ADMIN, MANAGER, OPERATOR, ANALYST
    is_active: bool = True
    created_at: datetime = datetime.now(timezone.utc)
    hashed_password: str

# Pre-seeded enterprise accounts
USERS_DB: Dict[str, User] = {
    "admin@smartpetrol.com": User(
        id="usr_admin_01",
        email="admin@smartpetrol.com",
        full_name="Chief Executive Officer",
        role="ADMIN",
        is_active=True,
        hashed_password=hash_password("admin123")
    ),
    "manager@smartpetrol.com": User(
        id="usr_mgr_01",
        email="manager@smartpetrol.com",
        full_name="Station Operations Manager",
        role="MANAGER",
        is_active=True,
        hashed_password=hash_password("manager123")
    ),
    "operator@smartpetrol.com": User(
        id="usr_op_01",
        email="operator@smartpetrol.com",
        full_name="Senior Pump Operator",
        role="OPERATOR",
        is_active=True,
        hashed_password=hash_password("operator123")
    ),
    "analyst@smartpetrol.com": User(
        id="usr_an_01",
        email="analyst@smartpetrol.com",
        full_name="Lead Data & BI Analyst",
        role="ANALYST",
        is_active=True,
        hashed_password=hash_password("analyst123")
    )
}

# Audit Log Store for Security Events
AUDIT_LOGS: List[Dict[str, Any]] = [
    {
        "id": "log_init_01",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": "SYSTEM_STARTUP",
        "user_email": "system@smartpetrol.com",
        "role": "SYSTEM",
        "ip_address": "127.0.0.1",
        "details": "Platform security engine initialized with RBAC & Snowflake security policies"
    }
]

def log_audit_event(event: str, user_email: str, role: str, details: str, ip_address: str = "127.0.0.1"):
    AUDIT_LOGS.insert(0, {
        "id": f"log_{int(time.time()*1000)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event,
        "user_email": user_email,
        "role": role,
        "ip_address": ip_address,
        "details": details
    })
    # Keep last 500 logs
    if len(AUDIT_LOGS) > 500:
        AUDIT_LOGS.pop()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def authenticate_user(email: str, password: str) -> Optional[User]:
    user = USERS_DB.get(email.lower().strip())
    if not user:
        log_audit_event("LOGIN_FAILED", email, "UNKNOWN", "Non-existent user attempt")
        return None
    if not verify_password(password, user.hashed_password):
        log_audit_event("LOGIN_FAILED", email, user.role, "Invalid password credentials")
        return None
    log_audit_event("LOGIN_SUCCESS", email, user.role, "Successful JWT authentication")
    return user

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> User:
    if not token:
        # Fallback to demo default admin user for convenience if user has not yet logged in
        return USERS_DB["admin@smartpetrol.com"]

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    user = USERS_DB.get(email)
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            log_audit_event(
                "ACCESS_DENIED",
                current_user.email,
                current_user.role,
                f"Unauthorized access attempt. Required roles: {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Insufficient permissions for role {current_user.role}"
            )
        return current_user
    return role_checker

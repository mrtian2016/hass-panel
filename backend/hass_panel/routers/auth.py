from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from hass_panel.core.deps import get_db
from hass_panel.core.hash_utils import verify_password, hash_password
from hass_panel.core.jwt_utils import create_access_token
from hass_panel.models.database import User
from hass_panel.utils.common import generate_resp
from hass_panel.core.initial import cfg

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    登录接口
    前端需要先将密码进行MD5加密后再传输
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户已被禁用",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=cfg.security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return generate_resp(data={
        "access_token": access_token,
        "token_type": "Bearer"
    })

@router.post("/register")
async def register(username: str, password: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == username).first()
    if db_user:
        return generate_resp(code=400, message="Username already registered")
        
    hashed_password = hash_password(password)
    db_user = User(username=username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return generate_resp(message="User created successfully") 
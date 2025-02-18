from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from hass_panel.core.deps import get_db
from hass_panel.core.auth_deps import get_current_user
from hass_panel.core.hash_utils import hash_password, verify_password
from hass_panel.models.database import User
from hass_panel.utils.common import generate_resp

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

class UserCreate(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    password: str | None = None
    is_active: bool | None = None

class UserResponse(BaseModel):
    id: int
    username: str
    is_active: bool

    class Config:
        from_attributes = True

def user_to_response(user: User) -> dict:
    """转换用户模型为响应字典"""
    return {
        "id": user.id,
        "username": user.username,
        "is_active": user.is_active
    }

@router.get("")
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户列表"""
    users = db.query(User).offset(skip).limit(limit).all()
    return generate_resp(data=[user_to_response(user) for user in users])

@router.get("/{user_id}")
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定用户"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return generate_resp(data=user_to_response(user))

@router.post("")
async def create_user(
    user: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新用户"""
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = hash_password(user.password)
    db_user = User(
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return generate_resp(data=user_to_response(db_user))

@router.put("/{user_id}")
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.password is not None:
        db_user.hashed_password = hash_password(user_update.password)
    
    if user_update.is_active is not None:
        db_user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(db_user)
    return generate_resp(data=user_to_response(db_user))

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除用户"""
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return generate_resp(message="User deleted successfully")

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return generate_resp(data=user_to_response(current_user))

@router.put("/me/password")
async def update_own_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前用户密码"""
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    current_user.hashed_password = hash_password(new_password)
    db.commit()
    return generate_resp(message="Password updated successfully") 
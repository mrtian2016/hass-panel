from fastapi import APIRouter, Depends, UploadFile, HTTPException
from loguru import logger
import os
from hass_panel.core.initial import cfg
from hass_panel.utils.common import check_hass_token, generate_resp, handle_upload_file
from hass_panel.core.auth_deps import get_current_user
from hass_panel.models.database import User, HassConfig, SessionLocal
from hass_panel.core.hash_utils import hash_password
from pydantic import BaseModel

router = APIRouter(
    prefix='/api/common',
    tags=['common']
)

class InitializeData(BaseModel):
    username: str
    password: str
    hass_url: str
    hass_token: str = ""

@router.post("/upload")
async def upload_file(file: UploadFile):
    file_name, file_path = await handle_upload_file(file, file_dir=cfg.base.upload_dir)
    logger.info(f"Upload file: {file_name}, {file_path}")
    # 判断是否为ingress环境
    if cfg.base.env == "prod" and os.environ.get("IS_ADDON") == "true":
        # 复制文件到ingress路径
        file_path = f".{file_path}"
    return generate_resp(data={"file_name": file_name, "file_path": file_path})

@router.get("/init_info")
async def init_info():
    """检查系统是否已初始化"""
    db = SessionLocal()
    try:
        # 检查是否存在用户和Home Assistant配置
        user_count = db.query(User).count()
        hass_config = db.query(HassConfig).first()
        is_initialized = user_count > 0 and hass_config is not None
        return generate_resp(data={
            "is_initialized": is_initialized
        })
    finally:
        db.close()

@router.post("/initialize")
async def initialize(data: InitializeData):
    """系统初始化"""
    db = SessionLocal()
    try:
        # 检查是否已初始化
        if db.query(User).count() > 0 or db.query(HassConfig).count() > 0:
            return generate_resp(code=400, message="System already initialized")
        
        # 如果添加了hass_url和hass_token 需要判断url是否合规
        if data.hass_url:
            if not data.hass_url.startswith("http://") and not data.hass_url.startswith("https://"):
                return generate_resp(code=401, message="Invalid Home Assistant URL")

        if data.hass_token:
            if not await check_hass_token(data.hass_url, data.hass_token):
                return generate_resp(code=402, message="Invalid Home Assistant Token")
        

        # 创建管理员用户
        admin_user = User(
            username=data.username,
            hashed_password=data.password,
            is_active=True
        )
        db.add(admin_user)
        
        # 创建Home Assistant配置
        hass_config = HassConfig(
            hass_url=data.hass_url,
            hass_token=data.hass_token
        )
        db.add(hass_config)
        
        db.commit()
        return generate_resp(message="System initialized successfully")
    except Exception as e:
        db.rollback()
        return generate_resp(code=500, message=str(e))
    finally:
        db.close()

@router.get("/hass_config")
async def get_hass_config(current_user: User = Depends(get_current_user)):
    """获取Home Assistant配置"""
    db = SessionLocal()
    try:
        hass_config = db.query(HassConfig).first()
        if not hass_config:
            return generate_resp(code=404, message="Home Assistant configuration not found")
        
        return generate_resp(data={
            "url": hass_config.hass_url,
            "token": hass_config.hass_token
        })
    finally:
        db.close()

@router.put("/hass_config")
async def update_hass_config(
    hass_url: str,
    hass_token: str,
    current_user: User = Depends(get_current_user)
):
    """更新Home Assistant配置"""
    db = SessionLocal()
    try:
        hass_config = db.query(HassConfig).first()
        if not hass_config:
            hass_config = HassConfig()
            db.add(hass_config)
        
        hass_config.hass_url = hass_url
        hass_config.hass_token = hass_token
        
        db.commit()
        return generate_resp(message="Home Assistant configuration updated successfully")
    except Exception as e:
        db.rollback()
        return generate_resp(code=500, message=str(e))
    finally:
        db.close()
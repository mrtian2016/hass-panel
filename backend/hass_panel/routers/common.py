from fastapi import APIRouter, Depends, UploadFile, HTTPException
from fastapi.responses import FileResponse
from loguru import logger
import os
import shutil
from datetime import datetime
from hass_panel.utils.config import cfg
from hass_panel.utils.common import check_hass_token, compress_directory, generate_resp, handle_upload_file
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
        hass_url = data.hass_url.rstrip("/")
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

@router.post("/reinitialize")
async def reinitialize(current_user: User = Depends(get_current_user)):
    """重新初始化"""
    db = SessionLocal()
    try:
        # 删除所有用户和Home Assistant配置
        db.query(User).delete()
        db.query(HassConfig).delete()
        db.commit()
        return generate_resp(message="System reinitialized successfully")
    except Exception as e:
        db.rollback()
        return generate_resp(code=500, message=str(e))
    finally:
        db.close()

# 下载日志
@router.get("/download_log")
async def download_log(current_user: User = Depends(get_current_user)):
    """下载日志文件
    将日志目录打包成zip文件并提供下载
    """
    try:
        log_path = cfg.log.server_log
        if not os.path.exists(log_path):
            raise HTTPException(status_code=404, detail="Log directory not found")
        
        # 创建临时zip文件
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_filename = f"hass_panel_logs_{timestamp}.tar"
        zip_path = os.path.join('/tmp', zip_filename)
        compress_directory(log_path, zip_path)
        # 返回文件响应
        return FileResponse(
            path=zip_path,
            filename=zip_filename,
            media_type='application/x-tar',
            background=None  # 同步删除临时文件
        )
    except Exception as e:
        logger.error(f"Failed to download logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    


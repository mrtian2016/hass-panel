from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional, List
import aiohttp
import json
from datetime import datetime
import os
from pathlib import Path
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security
from loguru import logger
from hass_panel.utils.common import generate_resp
from hass_panel.core.initial import cfg

router = APIRouter(
    prefix="/api/user_config",
    tags=["user_config"]
)

# 配置文件存储路径
CONFIG_DIR = Path(cfg.base.user_config_dir)
CONFIG_DIR.mkdir(parents=True, exist_ok=True)

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """验证Home Assistant token"""
    token = credentials.credentials
    
    # 验证token
    async with aiohttp.ClientSession() as session:
        try:
            token = token.replace("Bearer ", "")
            logger.info(f"token: {token}")
            logger.info(f"cfg.base.hass_url: {cfg.base.hass_url}")
            async with session.get(
                f"{cfg.base.hass_url}/api/",
                headers={"Authorization": f"Bearer {token}"}
            ) as response:
                if response.status != 200:
                    raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            raise HTTPException(status_code=401, detail=str(e))
    
    return token

@router.get("/config")
async def get_config(token: str = Depends(verify_token)):
    """获取最新配置"""
    try:
        config_file = CONFIG_DIR / "config.json"
        if not config_file.exists():
            return generate_resp(data={
                "cards": [],
                "layouts": {},
                "defaultLayouts": {}
            })
            
        with open(config_file, "r", encoding="utf-8") as f:
            config = json.load(f)
        return generate_resp(data=config)
    except Exception as e:
        return generate_resp(code=500, error=str(e))

@router.post("/config")
async def save_config(config: dict, token: str = Depends(verify_token)):
    """保存配置"""
    try:
        # 生成备份文件名
        now = datetime.now()
        backup_name = f"config-{now.strftime('%Y%m%d%H%M%S')}.json"
        
        # 如果存在旧配置,创建备份
        config_file = CONFIG_DIR / "config.json"
        if config_file.exists():
            with open(config_file, "r", encoding="utf-8") as f:
                old_config = json.load(f)
            backup_file = CONFIG_DIR / backup_name
            with open(backup_file, "w", encoding="utf-8") as f:
                json.dump(old_config, f, indent=2, ensure_ascii=False)
                
            # 清理旧备份,只保留最新的5个
            backup_files = sorted(
                [f for f in CONFIG_DIR.glob("config-*.json")],
                key=lambda x: x.stat().st_mtime,
                reverse=True
            )
            for f in backup_files[5:]:
                f.unlink()
                
        # 保存新配置
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
            
        return generate_resp(message="保存成功")
    except Exception as e:
        return generate_resp(code=500, error=str(e))

@router.get("/versions")
async def get_versions(token: str = Depends(verify_token)):
    """获取配置版本列表"""
    try:
        versions = []
        for f in CONFIG_DIR.glob("config*.json"):
            stat = f.stat()
            versions.append({
                "filename": f.name,
                "lastmod": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                "size": f"{stat.st_size / 1024:.2f} KB"
            })
            
        versions.sort(key=lambda x: x["filename"], reverse=True)
        return generate_resp(data=versions[:5])  # 只返回最新的5个版本
    except Exception as e:
        return generate_resp(code=500, error=str(e))

@router.get("/versions/{filename}")
async def get_version(filename: str, token: str = Depends(verify_token)):
    """获取指定版本的配置"""
    try:
        config_file = CONFIG_DIR / filename
        if not config_file.exists():
            return generate_resp(code=404, error="版本不存在")
            
        with open(config_file, "r", encoding="utf-8") as f:
            config = json.load(f)
        return generate_resp(data=config)
    except Exception as e:
        return generate_resp(code=500, error=str(e))

@router.delete("/versions/{filename}")
async def delete_version(filename: str, token: str = Depends(verify_token)):
    """删除指定版本"""
    try:
        if filename == "config.json":
            return generate_resp(code=400, error="不能删除当前使用的配置文件")
            
        config_file = CONFIG_DIR / filename
        if not config_file.exists():
            return generate_resp(code=404, error="版本不存在")
            
        config_file.unlink()
        return generate_resp(message="删除成功")
    except Exception as e:
        return generate_resp(code=500, error=str(e))

from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional, List
import aiohttp
import json
from datetime import datetime
import os
from pathlib import Path
import yaml
import hashlib
from loguru import logger
from pydantic import BaseModel
from hass_panel.utils.common import generate_resp,check_hass_token
from hass_panel.utils.config import cfg
import subprocess
from hass_panel.core.auth_deps import get_current_user
from hass_panel.models.database import User, HassConfig, SessionLocal

router = APIRouter(
    prefix="/api/user_config",
    tags=["user_config"],       
    dependencies=[Depends(get_current_user)]
)

# 配置文件存储路径
CONFIG_DIR = Path(cfg.base.user_config_dir)
CONFIG_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/config")
async def get_config():
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

def generate_stream_key(text: str) -> str:
    """生成stream key的MD5哈希值（前8位）"""
    return hashlib.md5(text.encode()).hexdigest()[:8]

@router.post("/config")
async def save_config(
    config: dict,
    current_user: User = Depends(get_current_user)
):
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
                
        # 更新go2rtc配置
        try:
            go2rtc_config_path = cfg.base.go2rtc_config_path
            
            with open(go2rtc_config_path, "r", encoding="utf-8") as f:
                go2rtc_config = yaml.safe_load(f) or {}
            logger.info(f"go2rtc_config: {go2rtc_config}")
            
            # 确保streams是一个字典
            if not go2rtc_config.get("streams"):
                go2rtc_config["streams"] = {}
            
            # 确保现有的streams是一个字典
            if not isinstance(go2rtc_config["streams"], dict):
                go2rtc_config["streams"] = {}
            
            existing_urls = set(go2rtc_config["streams"].values())
            existing_keys = set()
            
            if "cards" in config:
                for card in config["cards"]:
                    logger.info(f"card: {card}")
                    if card.get("type") == "CameraCard":
                        logger.info(f"card.get('config'): {card.get('config')}")
                        cameras = card.get("config", {}).get("cameras", [])
                        logger.info(f"cameras: {cameras}")
                        updated_cameras = []
                        for camera in cameras:
                            logger.info(f"camera: {camera}")
                            if camera.get("stream_url"):
                                # 生成基础key
                                base_name = camera.get("name") or camera.get("entity_id") or camera["stream_url"]
                                stream_key = generate_stream_key(base_name)
                                
                                # 确保key唯一
                                counter = 1
                                original_key = stream_key
                                while stream_key in existing_keys:
                                    stream_key = f"{original_key}_{counter}"
                                    counter += 1
                                existing_keys.add(stream_key)
                                
                                # 如果URL不存在，则添加到go2rtc配置
                                if camera["stream_url"] not in existing_urls:
                                    go2rtc_config["streams"][stream_key] = camera["stream_url"]
                                    existing_urls.add(camera["stream_url"])
                                
                                # 添加播放地址到摄像头配置
                                camera["play_url"] = f"./go2rtc/stream.html?src={stream_key}"
                            
                            updated_cameras.append(camera)
                        
                        # 更新cameras列表
                        card["config"]["cameras"] = updated_cameras
            
            # 保存更新后的go2rtc配置
            logger.info(f"go2rtc_config: {go2rtc_config}")
            with open(go2rtc_config_path, "w", encoding="utf-8") as f:
                yaml.dump(go2rtc_config, f, allow_unicode=True, default_flow_style=False)
            
            # 保存更新后的用户配置（包含播放地址）
            with open(config_file, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            logger.info("已更新go2rtc配置文件")
            
            # 重启go2rtc服务
            try:
                subprocess.run(["supervisorctl", "restart", "go2rtc"], check=True)
                logger.info("已重启go2rtc服务")
            except subprocess.CalledProcessError as e:
                logger.error(f"重启go2rtc服务失败: {str(e)}")
                return generate_resp(code=500, error=f"重启go2rtc服务失败: {str(e)}")
            
        except Exception as e:
            logger.error(f"更新go2rtc配置失败: {str(e)}")
            return generate_resp(code=500, error=f"更新go2rtc配置失败: {str(e)}")
            
        return generate_resp(message="保存成功并已重启go2rtc服务")
    except Exception as e:
        return generate_resp(code=500, error=str(e))

@router.get("/versions")
async def get_versions():
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
async def get_version(filename: str, ):
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
async def delete_version(filename: str, ):
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
    
@router.get("/hass_config")
async def get_hass_config():
    """获取Hass配置"""
    db = SessionLocal()
    try:
        hass_config = db.query(HassConfig).first()
        if not hass_config:
            return generate_resp(code=400, error="Home Assistant configuration not found")

        # 检查hass_token是否正确
        check_result = await check_hass_token(hass_config.hass_url, hass_config.hass_token)
        if not check_result:
            hass_config.hass_token = ''
            db.commit()
            return generate_resp(data={
                "url": hass_config.hass_url,
                "token": ''
            })
        
        return generate_resp(data={
            "url": hass_config.hass_url,
            "token": hass_config.hass_token
        })
    except Exception as e:
        logger.error(f"获取Home Assistant配置失败: {str(e)}")
        return generate_resp(code=500, message=str(e))
    finally:
        db.close()

class HassConfigUpdate(BaseModel):
    hass_url: str
    hass_token: str

@router.put("/hass_config")
async def update_hass_config(config: HassConfigUpdate):
    """更新Hass配置"""
    db = SessionLocal()
    try:
        # 检查存在hass_url和hass_token是否正确
        logger.info(f"config: {config.hass_url}，{config.hass_token}")
        check_result = await check_hass_token(config.hass_url, config.hass_token)
        logger.info(f"check_result: {check_result}")
        if not check_result:
            return generate_resp(code=400, error="Home Assistant token is invalid")

        hass_config = db.query(HassConfig).first()
        if not hass_config:
            hass_config = HassConfig()
            db.add(hass_config)
        
        hass_config.hass_url = config.hass_url
        hass_config.hass_token = config.hass_token
        
        db.commit()
        return generate_resp(message="Home Assistant configuration updated successfully")
    except Exception as e:
        db.rollback()
        logger.error(f"更新Home Assistant配置失败: {str(e)}")
        return generate_resp(code=500, message=str(e))
    finally:
        db.close()

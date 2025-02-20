from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import aiohttp
from loguru import logger

from hass_panel.core.deps import get_db
from hass_panel.core.auth_deps import get_current_user
from hass_panel.models.database import Entity, User, HassConfig
from hass_panel.utils.common import generate_resp
from hass_panel.utils.homeassistant_api import HomeAssistantAPI
from hass_panel.utils.cache import FileCache

router = APIRouter(
    prefix="/api/hass",
    tags=["hass"],
    dependencies=[Depends(get_current_user)]
)
file_cache = FileCache()

@router.get("/energy/statistics/{entity_id}")
async def get_energy_statistics(entity_id: str, db: Session = Depends(get_db)):
    """获取用电量统计数据"""
    cache_key = f"energy_statistics_{entity_id}"
    
    # 尝试从缓存获取数据
    cached_data = file_cache.get(cache_key)
    if cached_data is not None:
        return generate_resp(data=cached_data)
    
    try:
        api = HomeAssistantAPI()
        data = await api.get_all_statistics(entity_id)
        await api.close()
        
        # 将数据存入缓存，有效期1小时
        file_cache.set(cache_key, data, ttl=3600)
        # 将entity_id存入数据库 先判断是否存在
        entity = db.query(Entity).filter(Entity.entity_id == entity_id).first()
        if entity is None:
            entity = Entity(entity_id=entity_id,name='total_usage')
            db.add(entity)
            db.commit()
            db.refresh(entity)
        
        return generate_resp(data=data)
    except Exception as e:
        logger.error(f"获取用电量统计失败: {str(e)}")
        return generate_resp(code=500, message=str(e))


@router.get("/energy/today/{entity_id}")
async def get_today_consumption(entity_id: str):
    """获取今日用电量数据"""
    api = HomeAssistantAPI()
    total = await api.get_today_consumption(entity_id)
    await api.close()
    return generate_resp(data={'total':total})

@router.get("/energy/daily/{entity_id}")
async def get_daily_consumption(entity_id: str, days: int = 7):
    """获取每日用电量数据"""
    cache_key = f"energy_daily_{entity_id}_{days}"
    cached_data = file_cache.get(cache_key)
    if cached_data is not None:
        return generate_resp(data=cached_data)
    
    api = HomeAssistantAPI()
    data = await api.get_daily_consumption(entity_id, days)
    await api.close()

    # 将数据存入缓存，有效期1小时
    file_cache.set(cache_key, data, ttl=3600)
    
    return generate_resp(data=data)



        

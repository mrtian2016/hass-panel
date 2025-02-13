from fastapi import APIRouter, Depends
from loguru import logger
from typing import Dict
from hass_panel.utils.common import generate_resp
from hass_panel.utils.updater import run_update
from hass_panel.core.initial import cfg

router = APIRouter(
    prefix='/api',
    tags=['update']
)

@router.get("/update")
async def update():
    """
    处理更新请求的端点
    """
    logger.info("收到更新请求")
    try:
        result = run_update()
        if result is None:
            return generate_resp(message="已经是最新版本")
        return generate_resp(message=f"更新成功，新版本：{result}")
    except Exception as e:
        logger.exception("更新失败")
        return generate_resp(message=str(e)) 

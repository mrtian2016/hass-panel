from fastapi import APIRouter, Depends, UploadFile, File
from loguru import logger
from typing import Dict
import os
from hass_panel.utils.common import generate_resp
from hass_panel.utils.updater import get_latest_release, run_update, process_manual_update, apply_manual_update
from hass_panel.utils.config import cfg
from hass_panel.core.auth_deps import get_current_user
router = APIRouter(
    prefix='/api',
    tags=['update'],
    dependencies=[Depends(get_current_user)]
)

@router.get("/version")
async def version():
    """
    获取最新版本信息
    """
    version, download_url = get_latest_release()
    return generate_resp(data={"version": version, "download_url": download_url})

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
        return generate_resp(code=500, message=str(e))

@router.post("/upload-update")
async def upload_update(package: UploadFile = File(...)):
    """
    处理手动上传更新包的端点
    
    Args:
        package: 上传的更新包文件
        
    Returns:
        Dict: 包含处理结果的响应
    """
    logger.info(f"收到更新包上传请求: {package.filename}")
    
    # 验证文件类型
    if not (package.filename.endswith('.zip') or package.filename.endswith('.tar.gz')):
        return generate_resp(code=400, message="不支持的文件格式，仅支持 .zip 和 .tar.gz")
    
    try:
        # 确保临时目录存在
        os.makedirs(cfg.update_cfg.tmp_dir, exist_ok=True)
        
        # 处理更新包
        package_info = process_manual_update(package)
        
        return generate_resp(data=package_info)
    except Exception as e:
        logger.exception("处理更新包失败")
        return generate_resp(code=500, message=str(e))

@router.post("/manual-update")
async def manual_update(package_info: Dict):
    """
    处理手动更新的端点
    """
    logger.info(f"收到手动更新请求: {package_info}")
    try:
        version = apply_manual_update(package_info)
        return generate_resp(message=f"更新成功，新版本：{version}")
    except Exception as e:
        logger.exception("手动更新失败")
        return generate_resp(code=500, message=str(e)) 

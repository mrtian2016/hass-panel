from fastapi import FastAPI, BackgroundTasks
from typing import Dict
from loguru import logger
import sys
import os

from .updater import run_update

# 配置日志
log_path = os.path.join("/backend/logs", "app.log")
logger.remove()  # 移除默认的处理器
# 添加控制台输出
logger.add(sys.stdout, format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}")
# 添加文件输出
logger.add(log_path, 
          rotation="10 MB",  # 每个文件最大10MB
          retention="7 days",  # 保留7天的日志
          compression="zip",  # 压缩旧日志
          format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
          encoding="utf-8")

app = FastAPI()

@app.get("/api/update")
async def update() -> Dict[str, str]:
    """
    处理更新请求的端点
    """
    logger.info("收到更新请求")
    try:
        result = run_update()
        if result is None:
            return {"status": "success", "message": "已经是最新版本"}
        return {"status": "success", "message": f"更新成功，新版本：{result}"}
    except Exception as e:
        logger.exception("更新失败")
        return {"status": "error", "message": str(e)} 
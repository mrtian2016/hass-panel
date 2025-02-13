import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from hass_panel.utils.config import read_config, DEFAULT_CONFIG_PATH
from hass_panel.utils.loguru_cfg import LOG_HANDLER, InterceptHandler

# init configuation
cfg = read_config(DEFAULT_CONFIG_PATH)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # init logger
    intercept_handler = InterceptHandler()
    logging.getLogger("uvicorn").handlers = [intercept_handler]
    logging.getLogger("uvicorn.access").handlers = [intercept_handler]
    logger_config = dict(handlers=LOG_HANDLER)
    logger.configure(**logger_config)
 
    logger.debug("start lifespan")
        
    yield
    
    logger.debug("end lifespan")
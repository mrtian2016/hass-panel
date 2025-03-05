import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from loguru import logger
from hass_panel.utils.loguru_cfg import LOG_HANDLER, InterceptHandler
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from hass_panel.utils.homeassistant_api import HomeAssistantAPI
from hass_panel.utils.cache import FileCache
from hass_panel.models.database import SessionLocal,Entity

file_cache = FileCache()
scheduler = AsyncIOScheduler()



async def update_energy_statistics():
    db = None
    try:
        db = SessionLocal()
        entity = db.query(Entity).filter(Entity.name == 'total_usage').first()
        if entity is None:
            logger.error(f"entity is None")
            return
        api = HomeAssistantAPI()
        statistics_cache_key = f"energy_statistics_{entity.entity_id}"
        daily_consumption_cache_key = f"energy_daily_{entity.entity_id}_7"
        statistics = await api.get_all_statistics(entity.entity_id)
        daily_consumption = await api.get_daily_consumption(entity.entity_id,7)
        await api.close()
        file_cache.set(statistics_cache_key, statistics, ttl=3600)
        file_cache.set(daily_consumption_cache_key, daily_consumption, ttl=3600)
        logger.info(f"update_energy_statistics success")
    except Exception as e:
        logger.error(f"update_energy_statistics error: {e}")
    finally:
        if db:
            db.close()
            logger.debug("Database connection closed in update_energy_statistics")

async def async_task():
    await update_energy_statistics()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # init logger
    intercept_handler = InterceptHandler()
    logging.getLogger("uvicorn").handlers = [intercept_handler]
    logging.getLogger("uvicorn.access").handlers = [intercept_handler]
    logger_config = dict(handlers=LOG_HANDLER)
    logger.configure(**logger_config)
 
    logger.debug("start lifespan")
    asyncio.create_task(async_task())
    scheduler.add_job(update_energy_statistics, 'interval', seconds=3500)
    scheduler.start()

    yield
    
    logger.debug("end lifespan")
    scheduler.shutdown()
from fastapi import APIRouter, Depends
from loguru import logger

from hass_panel.utils.common import generate_resp

router = APIRouter(
    prefix='/api/items',
    tags=['items']
)

@router.get('/testTimeout')
async def test_timeout_api():
    logger.debug("test timeout api")
    return generate_resp(message="success")


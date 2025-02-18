from typing import Optional, List
from fastapi import Request
from sqlalchemy.orm import Session
from hass_panel.models.database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def log_request_info(request: Request):
    try:
        logger = request.app.state.logger
    except AttributeError:
        return
    try:
        request_body = str(await request.body(), encoding='utf-8').replace('\n', '').replace(' ', '')
    except:
        request_body = ''
    request_form = await request.form()

    logger.info(
        f"{request.method} request to {request.url}\n"
        f"\tBody: {request_body}\n"
        f"\tForm: {request_form}\n"
        f"\tPath Params: {request.path_params}\n"
        f"\tQuery Params: {request.query_params}\n"
    )
    
async def Logger(request: Request):
    try:
        logger = request.app.state.logger
        return logger
    except AttributeError:
        raise Exception('[*] If you want to use logger, please make sure cfg.log.allow_log is True')
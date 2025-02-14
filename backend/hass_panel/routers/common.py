from fastapi import APIRouter, Depends, UploadFile
from loguru import logger
import os
from hass_panel.core.initial import cfg
from hass_panel.utils.common import generate_resp, handle_excel_file

router = APIRouter(
    prefix='/api/common',
    tags=['common']
)

@router.post("/upload")
async def upload_file(file: UploadFile):
    file_name, file_path = await handle_excel_file(file, file_dir=cfg.base.upload_dir)
    # copy_one_file(file_path, cfg.base.wms_path)
    return generate_resp(data={"file_name": file_name, "file_path": file_path})


import inspect
import asyncio
import datetime
import functools
from typing import Optional, Callable, Union, Iterable
from asyncio.exceptions import TimeoutError
import os.path as osp
import os
from fastapi import UploadFile
from loguru import logger
from core.exc import MSTimeout
from glob import glob

def generate_resp(code: Optional[int]=200, message: Optional[str]=None, data: Optional[dict]=None, error: Optional[str]=None, **kwargs):
    # assert message or data or error, 'generate response error'
    resp = {
        'code': code
    }
    if message is not None:
        resp['message'] = message
    if data is not None:
        resp['data'] = data
    if error is not None:
        resp['error'] = error
    for k, v in kwargs.items():
        resp[k] = v
    return resp



async def handle_excel_file(file: UploadFile, file_dir=None, file_path=None):
    os.makedirs(file_dir, exist_ok=True)
    file_name = get_file_name(file.filename, file_dir)

    if not file_path:
        file_path = osp.join(file_dir, file_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())
    return file_name, file_path


def get_file_name(filename, file_dir):
    full_path = osp.join(file_dir, filename)
    if full_path not in glob(f"{file_dir}/*"):
        return filename
    else:
        name, ext = osp.splitext(filename)
        parts = name.split("_")
        last_part = parts[-1]
        if last_part.isdigit():
            parts[-1] = str(int(last_part) + 1)
        else:
            parts.append("1")
        new_name = "_".join(parts) + ext
        return get_file_name(new_name, file_dir)
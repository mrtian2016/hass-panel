import inspect
import asyncio
import datetime
import functools
from typing import Optional, Callable, Union, Iterable
from asyncio.exceptions import TimeoutError


from core.exc import MSTimeout

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

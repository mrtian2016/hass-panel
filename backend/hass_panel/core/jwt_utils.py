
from typing import Optional
from datetime import datetime, timedelta

import jwt
from jwt import PyJWTError
from fastapi.security import OAuth2PasswordBearer

from core.initial import cfg

cfg_security = cfg.security

token_url = cfg_security.token_url


SECRET_KEY = cfg_security.SECRET_KEY
ALGORITHM = cfg_security.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = cfg_security.ACCESS_TOKEN_EXPIRE_MINUTES


# 用于拿到token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=token_url)


def jwt_decode(token, SECRET_KEY, algorithms):
    return jwt.decode(token, SECRET_KEY, algorithms)

def create_access_token(data: dict, expires_delta: Optional[timedelta]=None):
    """
    生成token
    :param data: 字典
    :param expires_delta: 有效时间
    :return:
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta  # expire 令牌到期时间
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
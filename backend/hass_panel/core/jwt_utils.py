from typing import Optional
from datetime import datetime, timedelta
import jwt
from fastapi.security import OAuth2PasswordBearer
from hass_panel.core.initial import cfg

cfg_security = cfg.security
token_url = "api/auth/token"

SECRET_KEY = cfg_security.SECRET_KEY
ALGORITHM = cfg_security.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = cfg_security.ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=token_url)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    生成token
    :param data: 字典
    :param expires_delta: 有效时间
    :return:
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    """
    解码token
    :param token: token字符串
    :return: 
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.PyJWTError:
        return None
from passlib.context import CryptContext
import hashlib
from core.initial import cfg

schemes = cfg.security.schemes


# 用于校验和哈希password
pwd_context = CryptContext(schemes=schemes, deprecated="auto")


def hash_password(password: str) -> str:
    """
    直接使用前端传来的加密密码
    :param password: 前端加密后的密码
    :return: 密码
    """
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码
    :param plain_password: 前端加密后的密码
    :param hashed_password: 数据库中存储的密码
    :return: bool
    """
    return plain_password == hashed_password

def md5_hash(text: str) -> str:
    """
    MD5哈希函数(提供给前端参考)
    :param text: 原始文本
    :return: MD5哈希值
    """
    return hashlib.md5(text.encode()).hexdigest()
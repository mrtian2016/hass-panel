from passlib.context import CryptContext

from core.initial import cfg

schemes = cfg.security.schemes


# 用于校验和哈希password
pwd_context = CryptContext(schemes=schemes, deprecated="auto")


def hash_password(password):
    """
    加密明文
    :param password: 明文密码
    :return:
    """
    return pwd_context.hash(password)

# def verify_password(plain_password, hashed_password):
#     """
#     验证明文密码 vs hash密码
#     :param plain_password: 明文密码
#     :param hashed_password: hash密码
#     :return:
#     """
#     return pwd_context.verify(plain_password, hashed_password)

def verify_password(password, db_password):
    """
    直接在前端进行md5加密
    :param plain_password: 输入的密码（在前端进行md5加密）
    :param hashed_password: 数据库存储密码
    :return:
    """
    return password == db_password
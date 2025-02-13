from utils.database import TinyRedis
from core.initial import cfg

rds = TinyRedis(cfg.database.redis.redis_host, 
                cfg.database.redis.redis_port, 
                cfg.database.redis.redis_db)


# 获取邀请码
async def get_invitation_code():
    code = await rds.get_invitation_code()
    if not code:
        default_invitation_code = cfg.service.default_invitation_code
        await rds.set_invitation_code(default_invitation_code)
        return default_invitation_code
    return code

async def set_invitation_code(code):
    await rds.set_invitation_code(code)


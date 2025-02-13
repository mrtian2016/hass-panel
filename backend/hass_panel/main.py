import sys
sys.path.append('.')
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from hass_panel.core.middlewares import proc_custom_exception

from hass_panel.routers import items, update, user_config
from hass_panel.core.initial import lifespan
from hass_panel.core.initial import cfg
ROUTERS = [
    items.router,
    update.router,
    user_config.router
]

# 添加安全方案
security = HTTPBearer()

app = FastAPI(
    title=cfg.base.name.upper(), 
    lifespan=lifespan,
    # 添加安全配置
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True
    }
)

# ROUTERS
for r in ROUTERS:
    app.include_router(r)

# MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.add_middleware(BaseHTTPMiddleware, dispatch=proc_custom_exception)

# 添加安全配置到OpenAPI文档
app.swagger_ui_parameters = {
    "persistAuthorization": True,
}

if __name__ == '__main__':
    uvicorn.run(
        app='main:app', 
        host="0.0.0.0", 
        port=cfg.base.web_port, 
        reload=cfg.base.debug
    )

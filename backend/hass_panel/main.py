import sys
sys.path.append('.')
import uvicorn
from fastapi import FastAPI, Depends
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from hass_panel.core.middlewares import proc_custom_exception

from hass_panel.routers import update, user_config, common, auth, users
from hass_panel.core.initial import lifespan
from hass_panel.core.initial import cfg
from loguru import logger
ROUTERS = [
    common.router,
    update.router,
    user_config.router,
    auth.router,
    users.router
]


app = FastAPI(
    title=cfg.base.name.upper(), 
    lifespan=lifespan,
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



if __name__ == '__main__':
    print(f"Starting {cfg.base.name} on port {cfg.base.web_port}, env: {cfg.base.env}")
    uvicorn.run(
        app='main:app', 
        host="0.0.0.0", 
        port=cfg.base.web_port, 
        reload=cfg.base.debug
    )

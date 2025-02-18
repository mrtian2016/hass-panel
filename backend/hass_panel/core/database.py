from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from hass_panel.core.initial import cfg
import os

# 确保数据库目录存在
os.makedirs(cfg.database.db_path, exist_ok=True)

# 创建数据库URL
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(cfg.database.db_path, 'hass-panel.db')}"

# 创建数据库引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # SQLite特定配置
)

# 创建SessionLocal类
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建Base类
Base = declarative_base()

# 获取数据库会话的依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 初始化数据库
def init_db():
    from hass_panel.models.user import User  # 避免循环导入
    from hass_panel.crud import user as user_crud
    
    Base.metadata.create_all(bind=engine)
    
    # 创建初始管理员用户
    db = SessionLocal()
    try:
        admin = user_crud.get_user(db, username="admin")
        if not admin:
            user_crud.create_user(
                db=db,
                username="admin",
                password="admin",
                email="admin@example.com"
            )
    finally:
        db.close()

# 在模块加载时初始化数据库
init_db() 
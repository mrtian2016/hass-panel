# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此代码仓库中工作时的指导。

## 项目概述

Hass-Panel 是一个使用 React(前端)和 FastAPI(后端)构建的 Home Assistant 控制面板。它通过现代化的卡片式界面提供响应式、可自定义的智能家居设备控制仪表板。

## 架构

### 前端 (React)
- **位置**: `frontend/`
- **技术栈**: React 19, Ant Design, @hakit/core 用于 Home Assistant 集成
- **构建工具**: Create React App + CRACO 自定义配置
- **核心功能**:
  - 基于卡片的模块化架构,支持 23+ 种卡片类型(完整列表见 README.md)
  - React Grid Layout 实现拖放定位
  - PWA 支持,包含 service worker
  - JWT 认证,使用 localStorage 管理 token
  - 主题系统,支持亮色/暗色/系统模式
  - 使用 Zustand 进行状态管理(查看 `frontend/src` 中的 stores)

**组件结构**:
- `components/`: 卡片组件(CameraCard, ClimateCard 等)和 UI 元素
- `pages/`: 路由页面(home, config, login, initialize)
- `utils/api.js`: 集中式 API 客户端,包含 axios 拦截器
- `theme/`: 主题上下文和配置
- `i18n/`: 国际化支持

### 后端 (FastAPI)
- **位置**: `backend/hass_panel/`
- **技术栈**: FastAPI, SQLAlchemy, Uvicorn, APScheduler
- **数据库**: SQLite,带连接池
- **核心功能**:
  - 多用户 JWT 认证,使用 bcrypt 密码哈希
  - ONVIF/RTSP 摄像头控制集成
  - 定时更新能源统计数据(约每小时一次)
  - 基于文件的配置版本管理
  - 自动检测 Docker 环境以选择配置

**后端结构**:
- `routers/`: API 端点(auth, user_config, hass, onvif_ctl 等)
- `models/database.py`: SQLAlchemy 模型(User, HassConfig, Entity)
- `core/initial.py`: 应用生命周期、日志设置、定时任务
- `utils/config.py`: TOML 配置加载器(根据 Docker 检测选择 dev.toml 或 prod.toml)

### 配置系统
后端使用环境感知的 TOML 配置:
- **开发环境**: `backend/config/dev.toml`(非 Docker 环境)
- **生产环境**: `backend/config/prod.toml`(Docker 环境)
- 通过 `is_running_in_docker()` 检查 `/.dockerenv` 文件自动检测

### 集成点
- **Home Assistant**: 前端使用 @hakit/core WebSocket 连接;后端发起 REST API 调用
- **go2rtc**: 独立服务,用于 WebRTC/RTSP 摄像头流(端口 5123),通过 `docker/config/go2rtc.yaml` 配置
- **nginx**: Docker 中的反向代理,提供前端服务(端口 5123)并代理后端 API(端口 5124)

## 常用开发命令

### 前端开发
```bash
cd frontend

# 安装依赖(React 19 兼容性需要 --legacy-peer-deps)
npm install --legacy-peer-deps

# 启动开发服务器(端口 3000)
npm start

# 生产构建
npm run build

# 运行测试
npm test
```

### 后端开发
```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 运行后端服务器(默认端口 5124)
python hass_panel/main.py
```

### Docker 开发
```bash
# 通过 docker-compose 运行(端口 5123 前端/go2rtc, 5124 后端)
docker-compose up -d

# 构建多平台 Docker 镜像(参见 docker/Dockerfile)
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -f docker/Dockerfile .
```

## 构建和发布工作流

### GitHub Actions 工作流
- **beta.yml**: 包含 'beta' 的标签触发 - 构建、发布并推送到 3 个仓库
- **release.yml**: 正式版本标签触发 - 生产发布流程
- 两个工作流都包括:
  1. 使用 Node.js 22 构建前端
  2. 创建 release.zip
  3. 构建多架构 Docker 镜像(amd64, arm64, armv7)
  4. 推送到 GitHub Container Registry、阿里云镜像仓库和 Docker Hub
  5. 触发外部仓库工作流(hassio-addons)

### 版本管理
- 前端版本记录在 `frontend/build/version.json`
- 后端从 `cfg.update_cfg.version_file` 读取版本文件
- 更新系统支持 GitHub releases 和手动包上传

## 数据库模式

SQLite 中的三个主要表(`hass_panel.db`):
1. **users**: 认证(username, hashed_password, is_active)
2. **hass_config**: Home Assistant 连接(hass_url, hass_token)
3. **entities**: 实体注册表(entity_id, name),用于能源追踪等特殊功能

## 关键实现细节

### 认证流程
1. 用户通过 `/api/auth/login` 登录 → 获得 JWT token
2. 前端将 token 存储在 localStorage 中,键名为 'hass_panel_token'
3. 所有 API 请求包含 `Authorization: Bearer <token>` 请求头
4. Token 30 天后过期(可在 config.toml 中配置)
5. 401 响应自动重定向到登录页面

### 配置管理
- 用户配置以 JSON 文件形式存储在 `user_config_dir`
- 版本系统创建带时间戳的备份
- 配置包括: 卡片布局、全局设置(背景图片、主题颜色)
- api.js 中的 `applyBackgroundToBody()` 处理动态主题/背景切换

### 摄像头集成
- 通过 go2rtc API 进行 ONVIF 发现(`/go2rtc/api/onvif`)
- 通过后端代理到 ONVIF 设备进行 PTZ 控制
- 支持 WebRTC、RTSP、HLS 并自动回退
- 预置位置通过 `routers/onvif_ctl.py` 管理

### 能源监控
- 使用 APScheduler 定期获取数据(每 3500 秒)
- 在 `cache_dir` 中基于文件缓存,TTL 为 1 小时
- 从 Home Assistant 的长期统计 API 获取统计数据
- 需要在数据库中配置实体(name='total_usage')

## 测试说明

- 前端测试使用 React Testing Library(在 setupTests.js 中配置)
- 目前不存在全面的测试套件
- 添加功能时,重点测试认证流程和 API 集成

## 部署目标

1. **Docker 独立部署**: docker-compose.yml 用于标准部署
2. **Home Assistant 插件**: 独立仓库(hassio-addons),通过 GitHub Actions 触发
3. **手动安装**: 非官方支持,但可以使用 nginx + supervisord

## 端口配置
- **5123**: nginx(前端 + go2rtc 代理)
- **5124**: FastAPI 后端
- go2rtc WebRTC/API 在同一容器内的内部端口运行

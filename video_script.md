# Hass Panel 视频介绍脚本

## 开场 (10秒)
大家好,今天给大家介绍一个基于React的智能家居控制面板 - Hass Panel。这是一个完全开源的项目,可以帮助你更好地控制和管理你的智能家居设备。

## 主要特性介绍 (30秒)
让我们先来看看Hass Panel的主要特性:
- 首先是响应式设计,无论是手机还是电脑都能获得良好的使用体验
- 支持高度自定义的布局,所有卡片都可以自由拖拽调整位置和大小
- 内置PWA支持,可以直接安装到手机桌面,像原生APP一样使用
- 支持明暗两种主题模式,满足不同场景的需求
- 通过WebDAV可以轻松实现多设备间的配置同步

## 安装教程 (1分钟)

### Docker方式安装
1. 首先展示Docker命令:
```bash
docker run \
  --name hass-panel \
  --restart unless-stopped \
  -p 5123:5123 \
  -p 5124:5124 \
  -v ./webdav:/config/hass-panel/webdav \
  -v ./media:/app/media \
  -e REACT_APP_HASS_URL=your-hass-instance:8123 \
  -e WEBDAV_USERNAME=admin \
  -e WEBDAV_PASSWORD=admin \
  -d \
  ghcr.io/mrtian2016/hass-panel:latest
```

2. 讲解重要参数:
- 端口映射: 5123是面板访问端口,5124是WebDAV端口
- 目录映射: webdav用于配置同步,media用于存放媒体文件
- 环境变量: 需要设置Home Assistant地址和WebDAV账号密码

### Home Assistant插件方式
1. 展示添加插件源:
- 打开Home Assistant
- 进入"配置" -> "加载项" -> "加载项商店"
- 点击右上角菜单,选择"存储库"
- 添加仓库地址: https://github.com/mrtian2016/hass-panel

2. 安装步骤:
- 在商店中找到"Hass Panel"
- 点击安装
- 等待安装完成后启动
- 在侧边栏即可看到入口

## 首次配置 (1分钟)

### Home Assistant连接配置
1. 获取长期访问令牌:
- 在Home Assistant中创建访问令牌
- 复制令牌到面板配置中

2. WebDAV配置:
- 设置WebDAV服务器地址
- 配置用户名密码
- 测试连接

### 界面初始化
- 添加常用卡片
- 调整布局
- 保存配置

## 功能演示 (2分钟)

### 基础操作
- 展示顶部快捷操作栏
- 演示卡片拖拽调整位置
- 展示配置面板的使用

### 设备控制
- 灯光控制
- 空调控制
- 窗帘控制
- 传感器显示
- 摄像头查看
- 场景控制

### 个性化配置
- 主题切换
- 布局调整
- 卡片管理
- 配置同步

## 常见问题解答 (30秒)
1. 配置不生效怎么办?
- 检查实体ID是否正确
- 刷新页面重试

2. 设备显示离线?
- 检查Home Assistant连接
- 确认设备是否在线

3. 配置同步失败?
- 验证WebDAV配置
- 检查网络连接

## 结语 (20秒)
以上就是Hass Panel的安装使用教程。项目完全开源,欢迎大家使用和贡献。如果觉得对你有帮助,也欢迎给个Star支持一下。

## 片尾
- 展示项目地址
- 展示交流群二维码
- 展示赞赏码
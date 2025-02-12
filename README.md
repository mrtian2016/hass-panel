# Hass-Panel

[English](README.en.md) | 简体中文

一个基于React的智能家居控制面板，它使用Home Assistant的Websocket API，并支持作为Home Assistant操作系统(HAOS)的插件部署。

## 视频预览
[![一个基于 React 的智能家居控制面板]( https://i.imgur.com/PpbbnAS.png )](https://www.bilibili.com/video/BV1yxfaYHE5A/?share_source=copy_web&vd_source=3ef738469d1538347bdba19ea015dbd7)

## 预览图
![预览图](https://i.imgur.com/ZV71KM8.jpeg)

## 交流群

<img src="https://i.imgur.com/M6wEC8M.jpeg" width="300" alt="交流群" />

## 主要特性

- 📱 响应式设计，支持移动端和桌面端
- 🔧 高度可配置，自由拖拽布局
- 🚀 PWA支持，可安装到桌面
- 🎨 美观的用户界面，支持暗色模式
- 💾 支持 WebDAV 配置同步
- 🔌 丰富的设备支持:
  - 灯光控制
  - 空调控制
  - 窗帘控制
  - 传感器监控
  - 摄像头查看
  - 场景控制
  - 更多设备支持中...

## 安装部署

### Docker方式
```bash
docker run \
  --name hass-panel \
  --restart unless-stopped \
  -p 5123:5123 \
  -p 5124:5124 \
  -v ./webdav:/config/hass-panel/webdav \ # 持久化webdav文件
  -v ./media:/app/media \ # 媒体资源，主要是房间图片
  -e REACT_APP_HASS_URL=your-hass-instance:8123 \
  -e REACT_APP_HASS_TOKEN=your-hass-token \ # 可选，如果需要使用token认证
  -e WEBDAV_USERNAME=your-webdav-username \ # WebDAV 用户名
  -e WEBDAV_PASSWORD=your-webdav-password \ # WebDAV 密码
  -d \
  ghcr.io/mrtian2016/hass-panel:latest
```

环境变量说明:
- `REACT_APP_HASS_URL`: Home Assistant 实例地址
- `REACT_APP_HASS_TOKEN`: Home Assistant 长期访问令牌(可选)
- `WEBDAV_USERNAME`: WebDAV 用户名
- `WEBDAV_PASSWORD`: WebDAV 密码

### Home Assistant Addon方式

[![添加到Home Assistant](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fmrtian2016%2Fhass-panel)

或者手动添加：

1. 在Home Assistant的侧边栏中，点击"配置" -> "加载项" -> "加载项商店"
2. 点击右上角的三个点，选择"存储库"
3. 添加存储库地址：`https://github.com/mrtian2016/hass-panel`
4. 点击"添加"并刷新页面
5. 在加载项商店中找到并安装"Hass Panel"
6. 启动后即可在侧边栏访问

## 功能配置

### 支持的卡片类型

1. 时间卡片 (TimeCard)
2. 天气卡片 (WeatherCard) 
3. 灯光状态卡片 (LightStatusCard)
4. 房间灯光概览卡片 (LightOverviewCard)
5. 传感器卡片 (SensorCard)
6. 媒体播放器卡片 (MediaPlayerCard)
7. 窗帘控制卡片 (CurtainCard)
8. 电量监控卡片 (ElectricityCard)
9. 路由器监控卡片 (RouterCard)
10. NAS监控卡片 (NASCard)
11. 摄像头卡片 (CameraCard)
12. 空调控制卡片 (ClimateCard)
13. 人体传感器卡片 (MotionCard)
14. 净水器卡片 (WaterPurifierCard)
15. 光照传感器卡片 (IlluminanceCard)
16. 快捷指令面板 (ScriptPanel)

### WebDAV 配置同步

支持通过内置 WebDAV 服务在多个设备间同步配置:

1. 准备工作
   - 使用容器内置的 WebDAV 服务 (`http://your-docker-host:5124`)
   - 默认用户名和密码可通过环境变量设置

2. 设置步骤
   - 点击面板顶部"WebDAV配置"按钮
   - 输入服务器地址、用户名和密码
   - 选择是否启用自动同步
   - 保存配置

3. 使用说明
   - 支持自动/手动同步
   - 配置文件保存在 WebDAV 根目录的 `config.json`

### 卡片管理

- 支持显示/隐藏控制
- 支持拖拽排序
- 支持自定义大小(桌面端)
- 支持添加/编辑/删除卡片
- 支持自定义布局(3-5列)
- 支持响应式布局

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build
```

## 常见问题

1. 配置不生效
   - 确认实体 ID 是否正确
   - 刷新页面后重试

2. 设备显示离线
   - 检查 Home Assistant 连接
   - 验证实体 ID 是否存在
   - 确认设备是否在线

3. 图标不显示
   - 检查图标名称是否正确
   - 确认使用了支持的图标


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mrtian2016/hass-panel&type=Date)](https://star-history.com/#mrtian2016/hass-panel&Date)

## 贡献

欢迎提交 Pull Request 和 Issue！

## 许可证

本项目采用 GNU Affero General Public License v3.0 (AGPL-3.0) 许可证。这意味着：

- 您可以自由使用、修改和分发本软件
- 如果您修改并分发本软件，您必须：
  - 向所有用户提供您修改后的源代码
  - 使用 AGPL-3.0 许可证授权您的修改
  - 说明您所做的更改
- 任何网络使用（如 Web 应用程序）都视为分发
- 所有衍生作品也必须使用 AGPL-3.0 许可证

详细信息请查看[完整许可证文本](https://www.gnu.org/licenses/agpl-3.0.zh-cn.html)。

## 赞助

如果您觉得这个项目对您有帮助，欢迎赞助支持！

<img src="https://i.imgur.com/qYhxNZx.jpeg" width="300" alt="赞助二维码" />



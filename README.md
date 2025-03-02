# Hass-Panel

[English](README.en.md) | 简体中文

> 史上最简单的 Home Assistant 控制面板，基于 React 开发 | 一键部署到 HAOS | 有手就能用 | 无需编程经验 | 开箱即用

🌐 [官方网站](https://hass-panel.com) | 📖 [使用指南](https://hass-panel.com/guide/install.html)

## 视频预览
[![一个基于 React 的智能家居控制面板]( https://i.imgur.com/Kl6fPUi.jpeg )](https://www.bilibili.com/video/BV1yxfaYHE5A/?share_source=copy_web&vd_source=3ef738469d1538347bdba19ea015dbd7)

## 预览图
![预览图](https://i.imgur.com/3bkRnE7.jpeg)
![预览图](https://i.imgur.com/ONjR4Fp.jpeg)

## 交流群

<img src="https://i.imgur.com/ct6Tu5R.jpeg" width="300" alt="交流群" />

## 主要特性

- 📱 响应式设计，支持移动端和桌面端
- 🔧 高度可配置，自由拖拽布局
- 🚀 PWA支持，可安装到桌面
- 🎨 美观的用户界面：
  - 支持亮色/暗色/跟随系统三种主题模式
  - 毛玻璃效果卡片设计
  - 主题色滚动条
  - 优化的移动端视图
- 👥 多用户管理系统，支持JWT认证
- 🔐 安全的密码加密存储
- 🎥 强大的摄像头支持：
  - WebRTC/ONVIF/RTSP协议支持
  - HLS流自动检测和切换
  - 优化的视频流播放体验
- 🔌 丰富的设备支持:
  - 灯光控制
  - 空调控制
  - 窗帘控制
  - 传感器监控
  - 摄像头查看
  - 场景控制
  - 用电量统计
  - 插座控制
  - 服务器监控
  - PVE虚拟机监控
  - 通用实体卡片（支持自定义配置和分组显示）
  - 更多设备支持中...

## 安装部署

### 重要提示
从 v1.3.2 版本开始:
- 系统使用 SQLite 数据库进行配置存储
- 首次使用需要完成系统初始化流程
- 摄像头功能需要正确配置 ONVIF/RTSP 地址

详细的安装和配置说明请访问[官方文档](https://hass-panel.com/guide/install.html)。

### Docker方式 正式版
```bash
docker run \
  --name hass-panel \
  --restart unless-stopped \
  --network host \
  -v ./data/:/config/hass-panel \
  -d \
  ghcr.io/mrtian2016/hass-panel:latest
```
安装完成后直接打开机器的5123端口即可使用

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

详细的功能配置和使用说明请访问[使用指南](https://hass-panel.com/guide/install.html)。

### 支持的卡片类型

1. 时间卡片 (TimeCard)
2. 天气卡片 (WeatherCard) - 支持AQI国际化和风向指示
3. 灯光状态卡片 (LightStatusCard)
4. 房间灯光概览卡片 (LightOverviewCard)
5. 传感器卡片 (SensorCard)
6. 媒体播放器卡片 (MediaPlayerCard)
7. 大型媒体播放器卡片 (MaxPlayerCard)
8. 窗帘控制卡片 (CurtainCard)
9. 电量监控卡片 (ElectricityCard) - 优化的电压、电流和功率显示
10. 路由器监控卡片 (RouterCard) - 支持运行时间显示
11. NAS监控卡片 (NASCard) - 改进的存储信息显示
12. 摄像头卡片 (CameraCard) - 支持多种视频流协议
13. 空调控制卡片 (ClimateCard)
14. 人体传感器卡片 (MotionCard)
15. 净水器卡片 (WaterPurifierCard)
16. 光照传感器卡片 (IlluminanceCard)
17. 快捷指令面板 (ScriptPanel)
18. 插座状态卡片 (SocketCard)
19. 通用实体卡片 (UniversalCard) - 支持自定义实体配置和分组显示
20. PVE监控卡片 (PVECard) - 虚拟机监控
21. 服务器监控卡片 (ServerCard)

### 卡片管理

- 支持显示/隐藏控制
- 支持拖拽排序
- 支持自定义大小(桌面端)
- 支持添加/编辑/删除卡片（带确认保护）
- 支持自定义布局
- 支持响应式布局
- 支持实体智能搜索和自动补全

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build
```

## 最新版本 (v1.3.5.2)

### 🌟 主要更新
- 主题系统全面升级，支持"跟随系统"选项
- 全新毛玻璃效果卡片设计
- 新增通用卡片组件，支持自定义配置
- 新增PVE和服务器监控功能
- 摄像头功能增强，支持多种视频流

### 🔧 技术优化
- SQLite数据库连接池优化
- 组件升级与重构
- 性能提升与bug修复
- 多语言支持完善

详细更新日志请查看[Releases](https://github.com/mrtian2016/hass-panel/releases)

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

| 微信赞赏码 | 支付宝赞赏码 |
|--------|--------|
| ![微信赞赏码](https://i.imgur.com/f3Fxtsc.png) | ![支付宝赞赏码](https://i.imgur.com/bdNzzyW.png) |




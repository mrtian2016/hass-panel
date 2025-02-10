# Hass-Panel

一个基于 React 的智能家居控制面板，基于Home Assistant Websocket api。

## 视频预览
[![一个基于 React 的智能家居控制面板](https://img.youtube.com/vi/H6tz_ZBFPSM/0.jpg)](https://youtu.be/H6tz_ZBFPSM)

## 预览图
![预览图](https://i.imgur.com/ZV71KM8.jpeg)

## 交流群

<img src="https://i.imgur.com/NUpsXUl.jpeg" width="200" alt="交流群" />

## 特性

- 📱 响应式设计，支持移动端和桌面端
  - 灯光控制
  - 空调控制
  - 窗帘控制
  - 传感器监控
  - 摄像头查看
  - 场景控制
  - 更多设备支持中...
- 🔧 高度可配置，自由拖拽布局，支持移动端和桌面端
- 🚀 PWA支持，可安装到桌面
- 🎨 美观的用户界面，支持暗色模式

## 功能特点

- 支持多种卡片类型：时间、天气、灯光、传感器、媒体播放器等
- 支持自定义卡片布局和排序
- 支持卡片显示/隐藏控制
- 支持暗色/亮色主题切换
- 支持响应式布局，自适应不同屏幕尺寸
- 支持 PWA，可离线访问
- 支持 Docker 部署
- 支持 Home Assistant Addon 方式安装
- 支持 WebDAV 配置同步

## WebDAV 配置同步

Hass Panel 支持通过 WebDAV 在多个设备间同步配置，让您可以轻松备份和恢复面板配置。

### WebDAV 功能特点

- 支持自动/手动同步配置
- 支持多设备配置同步
- 支持配置文件版本控制
- 安全的配置文件存储

### 配置 WebDAV

1. 准备工作
   - 使用 Docker 内置的 WebDAV 服务
     - WebDAV 地址: `http://your-docker-host:5124`
     - 用户名和密码通过环境变量 `WEBDAV_USERNAME` 和 `WEBDAV_PASSWORD` 设置
   - 或使用其他 WebDAV 服务（如坚果云、NextCloud 等）
     - 获取 WebDAV 服务器地址
     - 准备 WebDAV 账号和密码

2. 设置步骤
   - 在面板顶部点击"WebDAV配置"按钮
   - 输入 WebDAV 服务器地址
     - 如果使用 Docker 内置服务，地址为 `http://your-docker-host:5124`
     - 如果使用其他服务，填写对应的 WebDAV 地址
   - 输入用户名和密码
   - 选择是否启用自动同步
   - 点击保存完成配置

3. 使用说明
   - 自动同步：启用后，每次修改配置都会自动同步到 WebDAV
   - 手动同步：可以随时点击"同步到WebDAV"或"从WebDAV同步"按钮进行手动同步
   - 配置文件路径：配置文件会保存在 WebDAV 根目录下的 `config.json` 文件中

### 注意事项

1. 确保 WebDAV 服务器地址正确且可访问
2. 如果使用自动同步，建议确保网络连接稳定
3. 首次使用时建议先备份本地配置
4. 从 WebDAV 同步时会覆盖本地配置，请谨慎操作

### 常见问题

1. 同步失败
   - 检查 WebDAV 服务器地址是否正确
   - 验证用户名和密码是否正确
   - 确认网络连接是否正常

2. 配置丢失
   - 检查 WebDAV 服务器上的配置文件是否存在
   - 尝试使用本地备份恢复

3. 自动同步不工作
   - 确认是否启用了自动同步选项
   - 检查网络连接是否正常
   - 验证 WebDAV 配置是否正确

## 动态卡片配置

### 卡片类型

目前支持以下类型的卡片：

1. 时间卡片 (TimeCard)
   - 显示当前时间和日期
   - 支持自定义时间和日期格式

2. 天气卡片 (WeatherCard)
   - 显示当前天气状况
   - 支持显示天气预报

3. 灯光状态卡片 (LightStatusCard)
   - 显示房间内的灯光状态
   - 支持灯光开关和亮度调节

4. 房间灯光概览卡片 (LightOverviewCard)
   - 支持自定义房间平面图
   - 支持灯光位置标记
   - 支持灯光状态可视化
   - 支持长按调节灯光

5. 传感器卡片 (SensorCard)
   - 支持温度、湿度等多种传感器数据显示
   - 支持按房间分组显示

6. 媒体播放器卡片 (MediaPlayerCard)
   - 支持播放控制
   - 显示当前播放状态和封面

7. 窗帘控制卡片 (CurtainCard)
   - 支持窗帘开关和位置控制
   - 支持多个窗帘分组显示

8. 电量监控卡片 (ElectricityCard)
   - 显示用电量统计
   - 支持历史用电趋势图

9. 路由器监控卡片 (RouterCard)
   - 显示路由器状态
   - 支持网速监控

10. NAS监控卡片 (NASCard)
    - 显示 NAS 系统状态
    - 支持存储空间监控
    - 支持硬盘健康状态监控

11. 摄像头卡片 (CameraCard)
    - 支持实时画面预览
    - 支持多个摄像头切换

12. 空调控制卡片 (ClimateCard)
    - 支持温度调节
    - 支持模式切换
    - 支持风速调节

13. 人体传感器卡片 (MotionCard)
    - 显示人体感应状态
    - 支持光照强度显示

14. 净水器卡片 (WaterPurifierCard)
    - 显示滤芯状态
    - 支持用水量统计

15. 光照传感器卡片 (IlluminanceCard)
    - 显示光照强度
    - 支持多个传感器数据显示

16. 快捷指令面板 (ScriptPanel)
    - 支持自定义场景触发
    - 支持多个快捷指令分组

### 卡片配置

每个卡片都支持以下基本配置：

- 显示/隐藏控制
- 拖拽排序
- 自定义大小（仅限桌面端）
- 删除功能

### 添加新卡片

1. 点击配置页面右上角的"添加卡片"按钮
2. 从可用卡片列表中选择需要添加的卡片类型
3. 配置卡片所需的参数（如实体 ID、名称等）
4. 保存配置后即可在主页面看到新添加的卡片

### 编辑卡片

1. 在配置页面中找到需要编辑的卡片
2. 修改卡片的相关配置
3. 点击保存按钮使修改生效

### 删除卡片

1. 在配置页面中找到需要删除的卡片
2. 点击卡片右上角的删除按钮
3. 确认删除后，卡片将从面板中移除

### 卡片布局

- 支持自定义列数（3-5列）
- 支持响应式布局，自动适应不同屏幕尺寸
- 支持拖拽调整卡片位置
- 支持保存自定义布局
- 支持重置为默认布局

### 启动

#### Docker方式
```bash
docker run \
  --name hass-panel \
  --restart unless-stopped \
  -p 5123:5123 \
  -p 5124:5124 \
  -v ./webdav:/config/hass-panel/webdav \ # 持久化webdav文件
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
- `WEBDAV_USERNAME`: WebDAV 用户名(可选)
- `WEBDAV_PASSWORD`: WebDAV 密码(可选)

#### Home Assistant Addon方式

[![添加到Home Assistant](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fmrtian2016%2Fhass-panel)

或者手动添加：

1. 在Home Assistant的侧边栏中，点击"配置" -> "加载项" -> "加载项商店"
2. 点击右上角的三个点，选择"存储库"
3. 添加以下存储库地址：`https://github.com/mrtian2016/hass-panel`
4. 点击"添加"
5. 刷新页面后，在加载项商店中找到"Hass Panel"
6. 点击"安装"
7. 安装完成后，点击"启动"
8. 在Home Assistant的侧边栏中，点击"Hass Panel"即可访问

## 注意事项

1. 所有的 `entity_id` 必须与您的 Home Assistant 中的实体 ID 保持一致
2. 修改配置后刷新页面即可生效
3. 确保您的 Home Assistant 实体可以正常访问

## 常见问题

1. 配置不生效
   - 确认实体 ID 是否正确
   - 刷新页面后重试

2. 设备显示离线
   - 检查 Home Assistant 连接是否正常
   - 验证实体 ID 是否存在
   - 确认设备是否在线

3. 图标不显示
   - 检查图标名称是否正确
   - 确认使用了支持的图标

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build

# 运行测试
npm test
```

## 贡献

欢迎提交 Pull Request 和 Issue！

## 赞助

如果您觉得这个项目对您有帮助，欢迎赞助支持！

<img src="https://i.imgur.com/qYhxNZx.jpeg" width="200" alt="赞助二维码" />



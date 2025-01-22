# 配置文件说明

本文档详细说明了 `userConfig.json` 的配置结构。通过修改此配置文件，你可以根据自己的智能家居设备来自定义应用。
完整配置样例【[userConfig.json](./public/config/userConfig.json)】

## 配置文件结构

配置文件包含以下主要部分：
- 天气
- 灯光
- 传感器
- 摄像头
- 空调
- 窗帘
- 媒体播放器
- 电量统计
- 路由器信息
- NAS信息
- 净水器信息
- 场景脚本

### 天气配置
```javascript
{
    "weather": [
        "weather.wo_de_jia"  // Home Assistant 中的天气实体ID
    ]
}
```

### 灯光配置
```javascript
{
    "lights": {
        "room_id": {  // 房间标识
            "entity_id": "light.xxxx",  // Home Assistant 中的灯光实体ID
            "name": "灯具名称",
            "room": "room_id"  // 房间标识
        }
    },
    "lightsOverview": {
        "background": "/static/media/关灯背景.webp",  // 关灯时的背景图
        "rooms": [
            {
                "entity_id": "light.xxxx",  // 与上面lights中的entity_id对应
                "name": "灯具名称",
                "room": "room_id",
                "position": {
                    "top": "70%",   // 在界面中的垂直位置
                    "left": "44%"   // 在界面中的水平位置
                },
                "image": "/static/media/房间.webp"  // 灯具对应的图片资源
            }
        ]
    }
}
```

### 传感器配置
```javascript
{
    "sensors": [
        {
            "id": "ROOM_ID",    // 房间唯一标识
            "name": "房间名称",
            "sensors": {
                "temperature": {
                    "entity_id": "sensor.xxxx",  // 温度传感器实体ID
                    "name": "温度",
                    "icon": "mdiThermometer"
                },
                "humidity": {
                    "entity_id": "sensor.xxxx",  // 湿度传感器实体ID
                    "name": "湿度",
                    "icon": "mdiWaterPercent"
                }
            }
        }
    ]
}
```

### 摄像头配置
```javascript
{
    "cameras": [
        {
            "entity_id": "camera.xxxx",  // 摄像头实体ID
            "stream_url": "https://xxx",  // WebRTC 流地址
            "name": "摄像头名称",
            "room": "room_id"  // 房间标识
        }
    ]
}
```

### 空调配置
```javascript
{
    "climates": [
        {
            "entity_id": "climate.xxxx",  // 空调实体ID
            "name": "空调名称",
            "room": "room_id",
            "features": {
                "eco": {
                    "entity_id": "switch.xxxx",  // 节能模式开关实体ID
                    "name": "节能",
                    "icon": "mdiLeaf",
                    "disableWhen": {
                        "state": "off"
                    }
                },
                // 其他功能如 sleep, heater, unStraightBlowing 等
            }
        }
    ]
}
```

### 窗帘配置
```javascript
{
    "curtains": [
        {
            "entity_id": "cover.xxxx",  // 窗帘实体ID
            "name": "窗帘名称",
            "room": "room_id"
        }
    ]
}
```

### 媒体播放器配置
```javascript
{
    "mediaPlayers": [
        {
            "entity_id": "media_player.xxxx",  // 媒体播放器实体ID
            "name": "播放器名称",
            "room": "room_id"
        }
    ]
}
```

### 电量统计配置
```javascript
{
    "electricity": {
        "lastUsage": {
            "entity_id": "sensor.xxxx",  // 当前用电量实体ID
            "name": "当前用电量"
        },
        "dailyDate": {
            "entity_id": "sensor.xxxx",
            "name": "日期"
        },
        // 其他电量相关配置...
    }
}
```

### 路由器信息配置
```javascript
{
    "router": {
        "sysName": {
            "entity_id": "sensor.xxxx",
            "name": "系统名称"
        },
        "cpuTemp": {
            "entity_id": "sensor.xxxx",
            "name": "CPU温度"
        },
        // 其他路由器信息配置...
    }
}
```

### NAS信息配置
```javascript
{
    "syno_nas": {
        "main": {
            "cpuTemp": {
                "entity_id": "sensor.xxxx",
                "name": "CPU温度"
            },
            // 其他主要信息...
        },
        "volumes": [
            {
                "name": "存储池1",
                "status": {
                    "entity_id": "sensor.xxxx",
                    "name": "状态"
                },
                // 其他存储池信息...
            }
        ],
        "drives": [
            {
                "name": "硬盘1",
                "status": {
                    "entity_id": "sensor.xxxx",
                    "name": "状态"
                },
                "temperature": {
                    "entity_id": "sensor.xxxx",
                    "name": "温度"
                }
            }
        ],
        "m2ssd": [
            {
                "name": "M.2 SSD 1",
                "status": {
                    "entity_id": "sensor.xxxx",
                    "name": "状态"
                },
                "temperature": {
                    "entity_id": "sensor.xxxx",
                    "name": "温度"
                }
            }
        ]
    }
}
```

### 净水器配置
```javascript
{
    "waterpuri": {
        "temperature": {
            "entity_id": "sensor.xxxx",
            "name": "温度"
        },
        "tds_in": {
            "entity_id": "sensor.xxxx",
            "name": "进水TDS"
        },
        // 其他净水器信息...
    }
}
```

### 场景脚本配置
```javascript
{
    "scripts": [
        {
            "name": "离家模式",
            "entity_id": "script.home_away_mode",
            "icon": "log-out"
        },
        // 其他场景脚本...
    ]
}
```

## 配置说明

1. `entity_id`: 必须与 Home Assistant 中的实体 ID 保持一致
2. `room`: 用于关联设备与房间的标识符
3. `position`: 仅用于灯光概览配置，决定灯具在界面中的显示位置
4. `image`: 仅用于灯光概览配置，设置灯具对应的图片资源

## 图片资源

灯光配置需要以下图片资源：
- 各个房间的灯光效果图
- 关灯背景图

## 注意事项

1. 所有的 `entity_id` 必须是有效的 Home Assistant 实体
2. 灯光的位置配置使用百分比，确保在不同屏幕尺寸下都能正确显示
3. 空调的特殊功能配置中，`disableWhen` 和 `enableWhen` 用于控制功能按钮的状态
4. 确保所有配置的图片资源都已正确导入
5. webrtc使用homeassistant的go2rtc addon


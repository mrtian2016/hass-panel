#!/bin/sh
# ==============================================================================
# 启动Hass Panel
# ==============================================================================

# 判断是否在 addon 环境中运行
if [ -f "/data/options.json" ]; then
    # Addon 模式
    export IS_ADDON=true
else
    # Docker 模式
    export IS_ADDON=false
fi
CONFIG_DIR="/config/hass-panel"

echo "IS_ADDON: $IS_ADDON"

echo "CONFIG_DIR: $CONFIG_DIR"

# 如果 logs 目录不存在，则创建
if [ ! -d "$CONFIG_DIR/logs" ]; then
    mkdir -p "$CONFIG_DIR/logs"
fi

# 如果 logs/supervisord 目录不存在，则创建
if [ ! -d "$CONFIG_DIR/logs/supervisord" ]; then
    mkdir -p "$CONFIG_DIR/logs/supervisord"
fi

# 如果 logs/backend 目录不存在，则创建
if [ ! -d "$CONFIG_DIR/logs/backend" ]; then
    mkdir -p "$CONFIG_DIR/logs/backend"
fi



# 如果 user_configs 目录不存在，则创建
if [ ! -d "$CONFIG_DIR/user_configs" ]; then
    mkdir -p "$CONFIG_DIR/user_configs"
fi

# 创建上传目录并设置权限
if [ ! -d "$CONFIG_DIR/upload" ]; then
    mkdir -p "$CONFIG_DIR/upload"
fi

# 如果 go2rtc.yaml 文件不存在，则创建
if [ ! -f "$CONFIG_DIR/go2rtc.yaml" ]; then
    cp /etc/go2rtc.yaml "$CONFIG_DIR/go2rtc.yaml"
fi

# 设置目录权限
chown -R nginx:nginx "$CONFIG_DIR/upload"
chmod -R 755 "$CONFIG_DIR/upload"

/usr/bin/supervisord -c /etc/supervisord.conf

tail -f /config/hass-panel/logs/supervisord/fastapi.out.log


#!/bin/sh
# ==============================================================================
# 启动Hass Panel
# ==============================================================================

# 判断是否在 addon 环境中运行
if [ -f "/data/options.json" ]; then
    # Addon 模式
    export IS_ADDON=true
    export REACT_APP_HASS_URL=$(jq -r '.hass_url // empty' /data/options.json)
    export WEBDAV_USERNAME=$(jq -r '.webdav_username // empty' /data/options.json)
    export WEBDAV_PASSWORD=$(jq -r '.webdav_password // empty' /data/options.json)
    export REACT_APP_HASS_TOKEN=$(jq -r '.hass_token // empty' /data/options.json)
   
    # 如果没有设置hass_token，和hass_url，则退出容器
    if [ -z "$REACT_APP_HASS_URL" ] || [ -z "$REACT_APP_HASS_TOKEN" ]; then
        echo "Error: hass_url and hass_token must be set"
        echo "错误：hass_url 和 hass_token 必须设置"
        echo "hass_url: $REACT_APP_HASS_URL"
        echo "hass_token: $REACT_APP_HASS_TOKEN"
        exit 1
    fi
    # curl 测试hass_url和hass_token
    api_result=$(curl -H "Authorization: Bearer $REACT_APP_HASS_TOKEN" -H "Content-Type: application/json" $REACT_APP_HASS_URL/api/)
    echo "api_result: $api_result"
   
    if ! echo "$api_result" | jq -e '.message == "API running."' > /dev/null; then
        echo "Error: hass_url and hass_token are invalid"
        echo "错误：hass_url 和 hass_token 无效"
        echo "hass_url: $REACT_APP_HASS_URL"
        echo "hass_token: $REACT_APP_HASS_TOKEN"
        exit 1
    fi

    CONFIG_DIR="/config/hass-panel"
    WEBDAV_DIR="$CONFIG_DIR/webdav"
else
    # Docker 模式
    export IS_ADDON=false
    CONFIG_DIR="/config/hass-panel"
    WEBDAV_DIR="/data/webdav"
fi

echo "Running mode: $([ "$IS_ADDON" = "true" ] && echo "Addon" || echo "Docker")"
echo "REACT_APP_HASS_URL: $REACT_APP_HASS_URL"
echo "WEBDAV_USERNAME: $WEBDAV_USERNAME"
echo "CONFIG_DIR: $CONFIG_DIR"
echo "WEBDAV_DIR: $WEBDAV_DIR"

# 创建必要的目录
mkdir -p "$CONFIG_DIR/media"
mkdir -p "$WEBDAV_DIR"

# 如果 media 目录存在，则链接 media 文件
if [ -d "$CONFIG_DIR/media" ]; then
    ln -sf "$CONFIG_DIR/media/"* /app/media/
else
    # 如果不存在则使用示例配置
    cp -r /app/media/* "$CONFIG_DIR/media/"
fi

# 生成环境配置
envsubst < /app/env.template.js > /app/env.js

# 根据环境修改 WebDAV 配置
if [ "$IS_ADDON" = "true" ]; then
    # Addon 模式下修改 WebDAV 配置路径
    sed -i "s|/data/webdav|$WEBDAV_DIR|g" /webdav_config.yaml
fi

# 使用 supervisor 启动所有服务
supervisord -c /backend/supervisord.conf
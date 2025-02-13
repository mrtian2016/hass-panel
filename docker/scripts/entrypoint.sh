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
else
    # Docker 模式
    export IS_ADDON=false
    CONFIG_DIR="/config/hass-panel"
fi

echo "Running mode: $([ "$IS_ADDON" = "true" ] && echo "Addon" || echo "Docker")"
echo "REACT_APP_HASS_URL: $REACT_APP_HASS_URL"
echo "WEBDAV_USERNAME: $WEBDAV_USERNAME"
echo "CONFIG_DIR: $CONFIG_DIR"

# 创建必要的目录
mkdir -p "$CONFIG_DIR/media"


if [ -d "$CONFIG_DIR/media" ]; then
    # 如果 media 目录存在，覆盖/app/media
    rm -rf /app/media
    ln -sf "$CONFIG_DIR/media" /app/media
else
    # 如果不存在则使用示例配置
    cp -r /app/media/* "$CONFIG_DIR/media/"
fi

# 如果 user_configs 目录不存在，则创建
if [ ! -d "$CONFIG_DIR/user_configs" ]; then
    mkdir -p "$CONFIG_DIR/user_configs"
fi

# 如果webdav目录存在，则复制文件到user_configs
if [ -d "$CONFIG_DIR/webdav" ]; then
    # 如果有文件，则复制文件到user_configs
    if [ "$(ls -A "$CONFIG_DIR/webdav")" ]; then
        cp -r "$CONFIG_DIR/webdav/*" "$CONFIG_DIR/user_configs/"
    fi
fi


# 生成环境配置
envsubst < /app/env.template.js > /app/env.js
# HASS_BACKEND_URL

# 替换 HASS_BACKEND_URL
escaped_url=$(echo "$REACT_APP_HASS_URL" | sed 's/[\/&]/\\&/g')
sed -i "s|HASS_BACKEND_URL|$escaped_url|g" /backend/config/prod.toml

# 启动 nginx
nginx

# 启动 fastapi
python hass_panel/main.py
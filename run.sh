#!/usr/bin/with-contenv bashio
# ==============================================================================
# 启动Hass Panel
# ==============================================================================

# 检查更新
# /update.sh

# 设置环境变量


export REACT_APP_HASS_URL=$(bashio::config 'hass_url')
export REACT_APP_HASS_TOKEN='' #$(bashio::config 'hass_token')

mkdir -p /config/hass-panel/media

# 如果/config/hass-panel/media目录存在,则链接media文件
if [ -d "/config/hass-panel/media" ]; then
  ln -sf /config/hass-panel/media/* /app/media/
else
  # 如果不存在则使用示例配置
  cp -r /app/media/* /config/hass-panel/media/
fi


envsubst < /app/env.template.js > /app/env.js


# 启动应用
cd /app

nginx  -g "daemon off; "


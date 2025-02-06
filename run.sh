#!/usr/bin/with-contenv bashio
# ==============================================================================
# 启动Hass Panel
# ==============================================================================
set -e
# 获取 Home Assistant Core URL
core_url=$(bashio::core.url)

# 获取 Supervisor URL
supervisor_url=$(bashio::supervisor.url)

# 获取 Home Assistant API URL
api_url=$(bashio::core.api_url)

echo "core_url: $core_url"
echo "supervisor_url: $supervisor_url"
echo "api_url: $api_url"

# 获取 Supervisor token
supervisor_token=$(bashio::supervisor.token)
echo "supervisor_token: $supervisor_token"
# 获取 Home Assistant Long-Lived Access Token
ha_token=$(bashio::config.token)
echo "ha_token: $ha_token"
# 如果在 addon 配置中定义了 homeassistant_api: true，可以这样获取
ha_token=$(bashio::homeassistant.token)

echo "ha_token: $ha_token"

# 获取配置
SSL=$(bashio::config 'ssl')
CERTFILE=$(bashio::config 'certfile')
KEYFILE=$(bashio::config 'keyfile')
# 设置环境变量
export REACT_APP_HASS_URL=$(bashio::config 'hass_url')
export REACT_APP_HASS_TOKEN=$(bashio::config 'hass_token')
ls /etc/nginx/

mkdir -p /config/hass-panel
# 如果配置文件存在则复制
if [ -f "/config/hass-panel/userConfig.json" ]; then
  cp /config/hass-panel/userConfig.json /app/config/
else
  # 如果不存在则使用示例配置
  cp /app/config/userConfig.json.example /app/config/userConfig.json
fi



# 如果/config/hass-panel/media目录存在,则链接media文件
if [ -d "/config/hass-panel/media" ]; then
  ln -sf /config/hass-panel/media/* /app/static/media/
fi


envsubst < /app/env.template.js > /app/env.js


# 启动应用
cd /app

if [ "$SSL" == "true" ]; then
    # 使用SSL
    
    nginx  -g "daemon off; "
else
    # 不使用SSL
    nginx  -g "daemon off; "
fi


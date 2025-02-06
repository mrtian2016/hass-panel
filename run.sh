#!/usr/bin/with-contenv bashio
# ==============================================================================
# 启动Hass Panel
# ==============================================================================

# 设置环境变量
export REACT_APP_HASS_URL=$(bashio::config 'hass_url')
export REACT_APP_HASS_TOKEN='' #$(bashio::config 'hass_token')
ls /etc/nginx/

mkdir -p /config/hass-panel/media
# 如果配置文件存在则复制
if [ -f "/config/hass-panel/userConfig.json" ]; then
  cp /config/hass-panel/userConfig.json /app/config/
else
  # 如果不存在则使用示例配置
  cp /app/config/userConfig.json.example /app/config/userConfig.json
  cp /app/config/userConfig.json.example /config/hass-panel/userConfig.json
fi



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

if [ "$SSL" == "true" ]; then
    # 使用SSL
    
    nginx  -g "daemon off; "
else
    # 不使用SSL
    nginx  -g "daemon off; "
fi


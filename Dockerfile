FROM hub.pyer.net/library/nginx:alpine

# 添加必要的工具
RUN apk add --no-cache gettext curl jq unzip

WORKDIR /app

# 复制配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制更新脚本
COPY update.sh /update.sh

# 设置脚本权限
RUN chmod +x /update.sh


RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo '/update.sh &' >> /docker-entrypoint.sh && \
    echo 'envsubst < /app/env.template.js > /app/env.js' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 5123

# 使用启动脚本
CMD ["/docker-entrypoint.sh"]
FROM hub.pyer.net/library/nginx:alpine

# 添加 envsubst 命令
RUN apk add --no-cache gettext nginx

WORKDIR /app
# 复制文件
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./build /app
COPY ./public/env.template.js /app/env.template.js
RUN rm /app/config/userConfig.json
RUN rm /app/env.js
# 创建启动脚本
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'envsubst < /app/env.template.js > /app/env.js' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 5123

# 使用启动脚本
CMD ["/docker-entrypoint.sh"]
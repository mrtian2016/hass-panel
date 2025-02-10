FROM hub.pyer.net/library/nginx:alpine

# 添加必要的工具
RUN apk add --no-cache gettext curl jq unzip


# 设置 WebDAV 版本
ENV WEBDAV_VERSION=5.7.2

# 根据架构下载对应的 WebDAV
RUN case $(uname -m) in \
    aarch64) ARCH="arm64" ;; \
    x86_64) ARCH="amd64" ;; \
    *) echo "Unsupported architecture" && exit 1 ;; \
    esac && \
    curl -L "https://ghfast.top/https://github.com/hacdias/webdav/releases/download/v${WEBDAV_VERSION}/linux-${ARCH}-webdav.tar.gz" -o webdav.tar.gz && \
    tar xf webdav.tar.gz && \
    mv webdav /usr/local/bin/ && \
    rm webdav.tar.gz

# 创建WebDAV数据目录
RUN mkdir -p /config/hass-panel/webdav

COPY webdav_config.yaml /webdav_config.yaml

WORKDIR /app

COPY build /app

# 复制配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制更新脚本
COPY update.sh /update.sh

# 设置脚本权限
RUN chmod +x /update.sh

ENV WEBDAV_USERNAME=admin

ENV WEBDAV_PASSWORD=admin

RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'envsubst < /app/env.template.js > /app/env.js' >> /docker-entrypoint.sh && \
    echo 'nginx' >> /docker-entrypoint.sh && \
    echo 'webdav -c /webdav_config.yaml' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 5123 5124

# 使用启动脚本
CMD ["/docker-entrypoint.sh"]

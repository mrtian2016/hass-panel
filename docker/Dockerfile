FROM ghcr.io/hassio-addons/base:17.1.0

# 安装依赖
RUN apk add --no-cache nginx gettext curl jq unzip tzdata python3 py3-pip rsync vim

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 安装 Python 依赖
RUN pip install fastapi uvicorn requests supervisor loguru

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

# 创建必要的目录
RUN mkdir -p /config/hass-panel/webdav && \
    mkdir -p /data/webdav && \
    mkdir -p /var/log && \
    mkdir -p /backend/logs

# 复制配置文件
COPY docker/config/webdav_config.yaml /webdav_config.yaml
COPY docker/config/nginx.conf /etc/nginx/http.d/default.conf

# 复制后端代码
COPY backend /backend

# 创建工作目录
WORKDIR /app

# 复制前端文件
COPY build /app

# 设置默认环境变量
ENV WEBDAV_USERNAME=admin
ENV WEBDAV_PASSWORD=admin
ENV IS_ADDON=false

# 复制并设置启动脚本
COPY docker/scripts/entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 5123 5124 5125

# 使用启动脚本
ENTRYPOINT ["/docker-entrypoint.sh"] 
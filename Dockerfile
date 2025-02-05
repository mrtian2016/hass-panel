FROM nginx:alpine

# 安装依赖
RUN apk add --no-cache  gettext

# 创建工作目录
WORKDIR /app

# 只复制构建后的文件
COPY build /app

# 创建配置和media目录
RUN mkdir -p /app/config /app/static/media

# 添加默认配置文件
COPY public/config/userConfig.json /app/config/userConfig.json.example

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-ssl.conf /etc/nginx/nginx-ssl.conf

# 复制启动脚本
COPY run.sh /
RUN chmod a+x /run.sh

# 暴露端口
EXPOSE 5123

CMD [ "/run.sh" ]
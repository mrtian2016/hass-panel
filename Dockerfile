
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./build /usr/share/nginx/html
RUN rm /usr/share/nginx/html/config/userConfig.json
EXPOSE 80
# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 
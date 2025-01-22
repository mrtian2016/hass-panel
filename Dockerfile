
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./build /usr/share/nginx/html
EXPOSE 80
# 启动nginx
CMD ["nginx", "-g", "daemon off;"] 
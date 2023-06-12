FROM nginx:1.18-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY ./build/ ./

CMD ["nginx", "-g", "daemon off;"]

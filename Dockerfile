# 構建階段
FROM node:18 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生產階段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# 不需要再複製nginx.conf，因為在docker-compose.yml中使用了卷映射
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"] 
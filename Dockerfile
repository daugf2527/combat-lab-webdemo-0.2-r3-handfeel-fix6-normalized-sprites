FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 5173
RUN npm run build
CMD ["npx", "serve", "dist", "-l", "5173"]

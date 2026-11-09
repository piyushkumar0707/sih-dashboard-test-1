FROM node:20-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./

EXPOSE 5000
CMD ["node", "index.js"]

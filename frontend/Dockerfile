FROM node:20-alpine

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./

ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]

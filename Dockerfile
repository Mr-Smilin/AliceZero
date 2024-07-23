FROM node:16.9.1-slim
WORKDIR /app
COPY package.json package-lock.json ./
# RUN npm install
COPY node_modules/ ./node_modules/
COPY alice.js ./
COPY manager/ ./manager/
COPY baseJS/ ./baseJS/ 
CMD ["npm", "start"]
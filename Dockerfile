FROM node:18.17.1
WORKDIR /app
COPY package.json package-lock.json ./
# COPY libs/ ./libs/ 
RUN npm install
COPY node_modules/ ./node_modules/
COPY alice.js ./
COPY manager/ ./manager/
COPY baseJS/ ./baseJS/ 
COPY .env ./
CMD ["npm", "start"]
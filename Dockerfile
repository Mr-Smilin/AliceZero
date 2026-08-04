FROM node:18.17.1
WORKDIR /app
# 音樂系統靠 yt-dlp 抓音訊，ffmpeg 用於非 opus 音源的轉檔
# yt-dlp_linux 是獨立執行檔，不需要另外裝 python
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux \
      -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# COPY libs/ ./libs/ 
RUN npm install
COPY node_modules/ ./node_modules/
COPY alice.js ./
COPY manager/ ./manager/
COPY baseJS/ ./baseJS/ 
COPY .env ./
CMD ["npm", "start"]
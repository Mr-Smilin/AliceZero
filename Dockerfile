FROM node:22-bookworm
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
# 在容器內裝套件，不要從外面 COPY node_modules 進來
# (ffmpeg-static 這類套件會依作業系統下載不同的執行檔，把 windows 的複製進來會壞掉)
RUN npm ci
COPY alice.js ./
COPY manager/ ./manager/
COPY baseJS/ ./baseJS/
COPY .env ./
CMD ["npm", "start"]

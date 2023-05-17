// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
const ytdl = require('ytdl-core');

exports.checkUrl = async (msg, musicUrl) => {
  // 解析 url 是否有效
  if (ytdl.validateURL(musicUrl)) {
    return await ytdl.getInfo(musicUrl);
  } else {
    return false
  }
}
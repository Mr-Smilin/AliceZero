// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
const ytdl = require('ytdl-core');
const CatchF = require("../../baseJS/CatchF.js");
const { exceptions } = require("winston");

exports.CheckUrl = async (msg, musicUrl) => {
  // 解析 url 是否有效
  if (ytdl.validateURL(musicUrl)) {
    return await ytdl.getInfo(musicUrl);
  } else {
    return false
  }
}

/** 歌單初始化 & 群組綁定
 * 
 * @param {*} guildId 
 */
exports.InitMusicValue = (guildId) => {
  try {
    global.songList.set(guildId, []);
    global.songInfo.set(guildId, []);
    global.songLoop.set(guildId, 0);
    return true;
  }
  catch (err) {
    CatchF.ErrorDo(err, "InitMusicValue 方法異常!");
    return false;
  }
}

/** 添加歌曲進入歌單
 * 
 * @param {*} guildId 
 * @param {*} musicUrl 
 * @param {*} type 0 = 添加到最尾端 1 = 添加到最前面(插播) 
 */
exports.AddSongList = (guildId, musicUrl, type = 0) => {
  try {
    if (type === 0) {
      global.songList.get(guildId).push(musicUrl);
    } else if (type === 1) {
      global.songList.get(guildId).unshift(musicUrl)
    } else {
      new exceptions("未知的 type 代號");
    }
    return true;
  } catch (err) {
    CatchF.ErrorDo(err, "歌單新增歌曲目錄時發生異常!");
    return false;
  }
}

/** 添加歌曲資訊進入資訊清單
 * 
 * @param {*} guildId 
 * @param {*} info 
 * @param {*} type 0 = 添加到最尾端 1 = 添加到最前面(插播)
 */
exports.AddSongInfo = (guildId, info, type = 0){
  try {
    if (type === 0) {
      songInfo.get(guildId).push(info?.videoDetails);
    } else if (type === 1) {
      if (songInfo.get(guildId).length !== 0) {
        nowSongInfo = songInfo.get(guildId).shift();
        songInfo.get(guildId).unshift(info?.videoDetails);
        songInfo.get(guildId).unshift(nowSongInfo);
      } else {
        songInfo.get(guildId).unshift(info?.videoDetails);
      }
    }
    return true;
  } catch (err) {
    CatchF.ErrorDo(err, "歌單新增歌曲資訊時發生異常!");
    return false;
  }
}

exports.PlayMusic = async (connection, guildId, channelId) => {
  try {
    // 歌單不能沒有歌
    // if ()
  } catch (err) {
    CatchF.ErrorDo(err, "PlayMusic 方法異常!");
  }
}

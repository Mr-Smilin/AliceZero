//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
const fs = require('fs');
const ytdl = require('ytdl-core');
// js
const CatchF = require("../../baseJS/CatchF.js");
//#endregion

//#region 主要動點

/** message用的音樂指令入口
 * 
 * @param {*} msg discord.message 
 * @param {string} cmd 指令
 * @param {any[]} args 參數
 */
exports.DoStart = (msg, cmd, args) => {
  try {
    // 判斷屬於哪種指令
    switch (cmd) {
      // 音樂控制台
      case "Alice":
        break;
      // 無匹配指令
      default:
        // 是快速命令的話執行播歌指令
        if (cmd.substring(0, 4) === 'http') this.DoPlayMusic(msg, cmd);
        // esle
        break;
    }
  }
  catch (err) {
    CatchF.ErrorDo(err, "music 方法異常!");
  }
}

// 播歌指令
exports.DoPlayMusic = (msg, musicUrl) => {
  // 判斷指令使用者是否在語音頻道
  // 解析 url
  // 加入語音
  // 播放音樂
}

//#endregion

//#region 內部方法



//#endregion
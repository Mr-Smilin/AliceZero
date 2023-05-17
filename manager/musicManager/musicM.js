//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const musicC = require("./musicC.js");
//#endregion

//#region 參數
let voice = new Map(); // 語音頻道角色
let songList = new Map(); // 歌單
let songInfo = new Map(); // 歌曲資訊
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
        break;
    }
  }
  catch (err) {
    CatchF.ErrorDo(err, "music 方法異常!");
  }
}

// 播歌指令
exports.DoPlayMusic = async (msg, musicUrl) => {
  // 判斷指令使用者是否在語音頻道
  if (BDB.MuIsVoicing(msg)) {
    // 解析 url
    const info = await musicC.checkUrl(msg, musicUrl);
    if (info?.videoDetails) {
      // 判斷 bot 是否已經連到語音頻道 是:將歌曲加入歌單 否:進入語音頻道並播放歌曲
      BDB.MuJoinVoiceChannel(msg);
      BDB.MuIsVoicingMySelf(msg);
      // 加入語音
      // 播放音樂
    } else {
      BDB.MReply(msg, "小愛好像解析不了這個網址的內容...不好意思><!");
    }
  } else {
    BDB.MReply(msg, "請先進入頻道再點歌喔:3...");
  }
}

//#endregion

//#region 內部方法



//#endregion
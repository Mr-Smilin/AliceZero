//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const musicC = require("./musicC.js");
//#endregion



//#region 主要動點

/** message用的音樂指令入口
 * 
 * @param {*} msg discord.message 
 * @param {string} cmd 指令
 * @param {any[]} args 參數
 * @param {number} type 0 = message 1 = slash
 */
exports.DoStart = (msg, cmd, args, type = 0) => {
  try {
    // 判斷屬於哪種指令
    switch (cmd) {
      // 音樂控制台
      case "Alice":
        break;
      // 無匹配指令
      default:
        // 是快速命令的話執行播歌指令
        if (cmd.substring(0, 4) === 'http') this.DoPlayMusic(msg, cmd, type);
        break;
    }
  }
  catch (err) {
    CatchF.ErrorDo(err, "music 方法異常!");
  }
}

// 播歌指令
exports.DoPlayMusic = async (msg, musicUrl, type = 0) => {
  // 判斷指令使用者是否在語音頻道
  if (BDB.MuIsVoicing(msg)) {
    // 解析 url
    const info = await musicC.CheckUrl(msg, musicUrl);
    if (info?.videoDetails) {
      // 判斷 bot 是否已經連到語音頻道 是:將歌曲加入歌單 否:進入語音頻道並播放歌曲
      if (BDB.MuIsVoicingMySelf(msg)) {
        // 添加歌單
        (musicC.AddSongList(BDB.MuGetGuildId(msg), musicUrl) &&
          // 添加歌曲資訊
          musicC.AddSongInfo(BDB.MuGetGuildId(msg).info)) ?
          // 回傳訊息
          BDB.MuReply(msg, "加入歌單成功喔~!", type) :
          BDB.MuReply(msg, "歌曲加入失敗啦!!", type);
      } else {
        if (
          // 參數初始化
          musicC.InitMusicValue(BDB.MuGetGuildId(msg)) &&
          // 添加歌單
          musicC.AddSongList(BDB.MuGetGuildId(msg), musicUrl) &&
          // 添加歌曲資訊
          musicC.AddSongInfo(BDB.MuGetGuildId(msg).info)
        ) {
          // 加入語音
          const connection = BDB.MuJoinVoiceChannel(msg);
          // 播放音樂
        } else {
          BDB.MuReply(msg, "歌曲初始化時失敗了!如果持續出現這個問題的話，小愛可能要找 master 處理看看~~", type)
        }
      }
    } else {
      BDB.MuReply(msg, "小愛好像解析不了這個網址的內容...不好意思><!", type);
    }
  } else {
    BDB.MuReply(msg, "請先進入頻道再點歌喔:3...", type);
  }
}

//#endregion

//#region 內部方法



//#endregion
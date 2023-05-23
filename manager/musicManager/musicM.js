//#region import
// Discord
const { exceptions } = require("winston");
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const musicC = require("./musicC.js");
const componentM = require("../componentManager/componentM.js");
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
        this.DoAlice(msg, type);
        break;
      case "先播這個":
        this.DoPlayMusicFirst(msg, cmd, type).catch(err => CatchF.ErrorDo(err, "DoPlayMusicFirst 方法異常!"));
        break;
      case "先播這首":
        this.DoPlayMusicFirst(msg, cmd, type).catch(err => CatchF.ErrorDo(err, "DoPlayMusicFirst 方法異常!"));
        break;
      // 無匹配指令
      default:
        // 是快速命令的話執行播歌指令
        if (cmd.substring(0, 4) === 'http') this.DoPlayMusic(msg, cmd, type).catch(err => CatchF.ErrorDo(err, "DoPlayMusic 方法異常!"));
        break;
    }
  }
  catch (err) {
    CatchF.ErrorDo(err, "music 方法異常!");
  }
}

// 播歌指令
exports.DoPlayMusic = async (discordObject, musicUrl, type = 0) => {
  const guildId = BDB.MuGetGuildId(discordObject, type);

  // 判斷指令使用者是否在語音頻道
  if (BDB.MuIsVoicing(discordObject, type)) {
    BDB.MuMessageSend(discordObject, "請先進入頻道再點歌喔:3...", type);
    return;
  }

  // 判斷 bot 是否已經進入語音頻道
  if (!BDB.MuIsVoicingMySelf(discordObject, type)) {
    // 初始化
    musicC.InitMusicValue(guildId);
    BDB.MuJoinVoiceChannel(discordObject, type);
  }

  // 添加歌單
  await musicC.AddSongList(guildId, musicUrl);

  // 判斷是否正在播放歌曲 是:將歌曲加入歌單 否:播放歌曲
  if (musicC.IsPlaying()) {
    BDB.MuMessageSend(discordObject, "加入歌單成功喔~!", type);
  } else {
    musicC.SetIsPlaying(guildId, true);
    BDB.MuMessageSend(discordObject, `🎵　播放音樂：${musicC.GetNowSong(guildId)?.name}`, type);
    // 播放音樂
    musicC.PlayMusic(discordObject, musicC.GetNowSong(guildId), true, type);
  }
}

// 插播指令
exports.DoPlayMusicFirst = async (discordObject, musicUrl, type = 0) => {
  const guildId = BDB.MuGetGuildId(discordObject, type);

  // 判斷指令使用者是否在語音頻道
  if (BDB.MuIsVoicing(discordObject, type)) {
    BDB.MuMessageSend(discordObject, "請先進入頻道再點歌喔:3...", type);
    return;
  }

  // 判斷 bot 是否已經進入語音頻道
  if (!BDB.MuIsVoicingMySelf(discordObject, type)) {
    // 初始化
    musicC.InitMusicValue(guildId);
    BDB.MuJoinVoiceChannel(discordObject, type);
  }

  // 添加歌單
  await musicC.AddSongList(guildId, musicUrl, 1);

  // 判斷是否正在播放歌曲 是:將歌曲加入歌單 否:播放歌曲
  if (musicC.IsPlaying()) {
    BDB.MuMessageSend(discordObject, "好的，下一首播這個喔!", type);
  } else {
    musicC.SetIsPlaying(guildId, true);
    BDB.MuMessageSend(discordObject, `🎵　播放音樂：${musicC.GetNowSong(guildId)?.name}`, type);
    // 播放音樂
    musicC.PlayMusic(discordObject, musicC.GetNowSong(guildId), true, type);
  }
}

// 音樂控制台
exports.DoAlice = (discordObject, type = 0) => {
  let content = componentM.GetMusicAliceMessage(true);
  BDB.MuMessageSend(discordObject, content, type);
}

// 暫停播放
exports.DoPause = (discordObject, type = 0) => {
  const guildID = BDB.MuGetGuildId(discordObject, type);
  musicC.Pause(guildId, discordObject, type);
}

// 恢復播放
exports.DoResume = (discordObject, type = 0) => {
  const guildId = BDB.MuGetGuildId(discordObject, type);
  musicC.Resume(guildId, discordObject, type);
}

// 跳過目前歌曲
exports.DoSkip = (discordObject, type = 0) => {
  const guildId = BDB.MuGetGuildId(discordObject, type);
  musicC.Skip(guildId, discordObject, type);
}

// 取得目前隊列中的歌曲
exports.DoNowQueue = (discordObject, type = 0) => {
  const guildId = BDB.MuGetGuildId(discordObject, type);
  musicC.NowQueue(guildId, discordObject, type);
}

//#endregion

//#region 內部方法

//#endregion
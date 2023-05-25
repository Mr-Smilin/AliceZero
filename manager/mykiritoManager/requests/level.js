//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../../baseJS/CatchF.js");
require('dotenv').config();
//#endregion


// 轉生點
module.exports = {
  data: {
    name: "轉生點"
  },
  method: "GET",
  url: process.env.GASURL_LEVELS,
  async callback(data) {
    if (data === undefined) {
      throw new Error('下載轉生點時發生意外錯誤，通常是google不開心了');
    }
    global.mkLevel = data;
  },
  async execute(msg, cmd, args) {
    try {
      if (args[0] === undefined || args[0] === '' || args[1] === '' || args[0] > 100 || args[0] < 1 || args[1] > 10 || args[1] < 1 || isNaN(args[0]) === true || (isNaN(args[1]) === true && args[1] !== undefined)) {
        let content = '```轉生點查詢\n語法:攻略組 轉生點 {等級} [範圍]\n\n從選擇等級開始查詢，根據範圍返還查詢數量\n\n等級不可低於1，不可大於100\n範圍不可低於1，不可大於10(預設5)```';
        BDB.MSend(msg, content);
      } else {
        const responseData = global.mkLevel;
        const level = args[0];
        // 範圍預設5
        if (args[1] === undefined) {
          args[1] = 5;
        }
        const range = args[1];
        let message = "```";
        for (i = level; i <= Object.keys(responseData)?.length; i++) {
          if (i >= parseFloat(level) + parseFloat(range)) break;
          if (responseData[i] !== undefined)
            message += `等級${paddingLeft((i), 4)} | 等級所需經驗${paddingLeft(responseData[i].lat, 7)} | 累積轉生點${paddingLeft(responseData[i].lng, 3)} \n`;
        }
        message += "```";

        if (message === "``````")
          message = "你能不能正常打字?";

        BDB.MSend(msg, message);
      }
    }
    catch (err) {
      CatchF.ErrorDo(err, "攻略組 轉生點 查詢異常!");
    }
  }
}

//字串補空白
function paddingLeft(str, lenght) {
  if (str.length >= lenght)
    return str;
  else
    return paddingLeft(" " + str, lenght);
}
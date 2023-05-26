//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../../baseJS/CatchF.js");
const componentM = require("../../componentManager/componentM.js");
require('dotenv').config();
//#endregion


// 轉生點
module.exports = {
  data: {
    name: "樓層"
  },
  method: "GET",
  url: process.env.GASURL_BOSSES,
  async callback(data) {
    if (data === undefined) {
      throw new Error('下載樓層資訊時發生意外錯誤，通常是google不開心了');
    }
    global.mkBoss = data;
  },
  async execute(msg, cmd, args) {
    try {
      const responseData = global.mkBoss;
      const bossData = responseData[args[0]];
      if (bossData === undefined)
        BDB.MSend(msg, returnDefault(responseData));
      else
        BDB.MSend(msg, componentM.GetMyKiritoBossMessage({
          floor: args[0],
          data: bossData
        }));
    }
    catch (err) {
      CatchF.ErrorDo(err, "攻略組 樓層 查詢異常!");
    }
  }
}

function returnDefault(responseData) {
  let message = "```樓層Boss查詢\n" +
    "語法:攻略組 樓層 {層數}\n\n" +
    "根據層數，反饋此樓層Boss資訊\n\n" +
    "樓層名稱需與表單完全一致\n" +
    "目前表單收錄的樓層有~...\n";
  let count = 0;
  const floors = Object.keys(responseData);
  for (floor of floors) {
    if (count >= 5) {
      message += "\n";
      count = 0;
    }
    message += paddingRightFor(floor, 7)
    count++;
  }
  message += "```";
  return message;
}

//#region 字串補空白
function paddingRightFor(str, lenght) {
  if (str.length >= lenght)
    return str;
  else
    return paddingRightFor(str + " ", lenght);
};
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
    name: "情報"
  },
  method: "GET",
  url: process.env.GASURL_SKILLS,
  async callback(data) {
    if (data === undefined) {
      throw new Error('下載角色情報時發生意外錯誤，通常是google不開心了');
    }
    global.mkSkill = data;
  },
  async execute(msg, cmd, args) {
    try {
      const responseData = global.mkSkill;
      const roleData = responseData[args[0]];
      if (roleData === undefined)
        await BDB.MSend(msg, returnDefault(responseData));
      else
        await BDB.MSend(msg, componentM.GetMyKiritoSkillMessage({
          name: args[0],
          data: roleData,
        }));
    }
    catch (err) {
      CatchF.ErrorDo(err, "攻略組 情報 查詢異常!");
    }
  }
}

function returnDefault(responseData) {
  let message = "```角色情報查詢\n語法: 攻略組 情報 {角色名稱}\n\n根據角色名稱，反饋此角色已記錄技能與簡介\n\n角色名稱需與表單完全一致\n目前的角色有...\n";
  let count = 0;
  const names = Object.keys(responseData);
  for (nam of names) {
    if (count >= 4) {
      message += "\n";
      count = 0;
    }
    message += paddingRightForCn(nam, 14)
    count++;
  }
  message += "```";
  return message;
}

//中文
function paddingRightForCn(str, lenght) {
  if (str.length >= lenght)
    return str;
  else
    return paddingRightForCn(str + "　", lenght);
};
//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const selectMenuC = require("../selectMenuC.js");
const componentM = require("../../componentManager/componentM.js");
//#endregion

const musicSelectOption = () => {
  return BDB.SMNewOption()
    .SMSetLabel("🎧 音樂系統")
    .SMSetDescription("想要聽音樂的靠過來!")
    .SMSetValue("music");
}

const myKiritoSelectOption = () => {
  return BDB.SMNewOption()
    .SMSetLabel("⚔️ 攻略組系統")
    .SMSetDescription("myKirito 資訊查詢")
    .SMSetValue("mykirito");
}

const mainSelect = () => {
  const component = selectMenuC.GetHelpSelectMenu("help", "📖 指令教學", [musicSelectOption(), myKiritoSelectOption()]);
  return component;
}

module.exports = {
  data: mainSelect(),
  music: {
    async execute(interaction) {
      BDB.ISend(interaction, componentM.GetMusicHelpMessage(true));
    }
  },
  mykirito: {
    async execute(interaction) {
      BDB.ISend(interaction, componentM.GetMykiritoHelpMessage(true));
    }
  },
};
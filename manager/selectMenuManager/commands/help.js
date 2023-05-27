//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const selectMenuC = require("../selectMenuC.js");
const componentM = require("../../componentManager/componentM.js");
const { execute } = require("../../messageManager/nineData.js");
//#endregion

const musicSelectOption = () => {
  return BDB.SMNewOption()
    .SMSetLabel("🎧 音樂系統")
    .SMSetDescription("想要聽音樂的靠過來!")
    .SMSetValue("music");
}

const tRpgSelectOption = () => {
  return BDB.SMNewOption()
    .SMSetLabel("🍻 派對系統")
    .SMSetDescription("tRpg 相關指令")
    .SMSetValue("trpg");
}

const myKiritoSelectOption = () => {
  return BDB.SMNewOption()
    .SMSetLabel("⚔️ 攻略組系統")
    .SMSetDescription("myKirito 資訊查詢")
    .SMSetValue("mykirito");
}

const mainSelect = () => {
  const component = selectMenuC.GetHelpSelectMenu("help", "📖 指令教學", [musicSelectOption(), tRpgSelectOption(), myKiritoSelectOption()]);
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
  trpg: {
    async execute(interaction) {
      BDB.ISend(interaction, componentM.GetTrpgHelpMessage());
    }
  }
};
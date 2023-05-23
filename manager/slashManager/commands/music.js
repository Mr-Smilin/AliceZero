//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const componentM = require("../../componentManager/componentM.js");
//#endregion

module.exports = {
  data: BDB.SNewSlashCommand("music", "音樂指令"),
  async execute(interaction) {
    // 使用者輸入指令後程式要做的事
    BDB.ISend(interaction, componentM.GetMusicMessage());
  },
  button: {
    helpPlay: {
      async execute(interaction) {
        BDB.ISend(interaction, componentM.GetHelpMusicMessage(0));
      }
    },
    helpPlayFirst: {},
    helpPause: {},
    helpResume: {},
    helpSkip: {},
    helpNowQueue: {},
    helpSleep: {},
  }
};
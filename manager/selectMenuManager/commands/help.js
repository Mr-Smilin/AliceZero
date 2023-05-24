//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const selectMenuC = require("../selectMenuC.js");
const componentM = require("../../componentManager/componentM.js");
//#endregion

module.exports = {
  data: selectMenuC.GetHelpSelectMenu("help", "📖 指令教學"),
  music: {
    async execute(interaction) {
      BDB.ISend(interaction, componentM.GetMusicMessage(true));
    }
  },
  second_option: {
    async execute(interaction) {
      BDB.ISend(interaction, "music", 1);
    }
  },
};
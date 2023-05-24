//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const selectMenuC = require("../selectMenuC.js");
//#endregion

module.exports = {
  data: selectMenuC.GetHelpSelectMenu("help", "📖 指令教學"),
  music: {
    async execute(interaction) {
      BDB.ISend(interaction, "music");
    }
  },
  second_option: {
    async execute(interaction) {
      BDB.ISend(interaction, "music", 1);
    }
  },
};
//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const componentM = require("../../componentManager/componentM.js");
//#endregion

module.exports = {
  data: BDB.SNewSlashCommand("help", "查詢指令"),
  async execute(interaction) {
    // 使用者輸入指令後程式要做的事
    BDB.ISend(interaction, componentM.GetHelpMessage(this));
  },
  // selectMenu: {
  //   music: {
  //     async execute(interaction) {
  //       BDB.ISend(interaction, "music");
  //     }
  //   },
  //   second_option: {
  //     async execute(interaction) {
  //       BDB.ISend(interaction, "music", 1);
  //     }
  //   },
  // }
};
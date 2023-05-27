//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const componentM = require("../../componentManager/componentM.js");
//#endregion

module.exports = {
  data: BDB.BNewButton("helpTrpgDice", "骰骰子"),
  async execute(interaction) {
    // 使用者輸入指令後程式要做的事
    BDB.ISend(interaction, componentM.GetHelpTrpgMessage(0));
  },
};
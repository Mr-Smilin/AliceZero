//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const componentM = require("../../componentManager/componentM.js");
//#endregion

module.exports = {
  data: BDB.BNewButton("myKiritoSkillSkill", "技能"),
  async execute(interaction) {
    const nam = BDB.BGetMessageEmbedsAuthorName(interaction);
    const responseData = global.mkSkill;
    const roleData = responseData[nam];
    // 使用者輸入指令後程式要做的事
    BDB.IEdit(interaction, componentM.GetMyKiritoSkillMessage({
      name: nam,
      data: roleData,
    }, 0), 1);
  },
};
//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const componentM = require("../../componentManager/componentM.js");
const myKiritoC = require("../../mykiritoManager/myKiritoC.js");
//#endregion

module.exports = {
  data: BDB.BNewButton("myKiritoSkillStatus", "能力"),
  async execute(interaction) {
    const nam = BDB.BGetMessageEmbedsAuthorName(interaction);
    // 舊服與經典服的角色資料不同，跟著按鈕所在的頻道走
    const roleData = myKiritoC.GetData(interaction, "情報")?.[nam];
    // 這個頻道查不到這個角色，確認互動就好，不動原本的訊息
    if (roleData === undefined) return await BDB.IDeferUpdate(interaction);
    // 使用者輸入指令後程式要做的事
    BDB.IEdit(interaction, componentM.GetMyKiritoSkillMessage({
      name: nam,
      data: roleData,
    }, 1), 1);
  },
};
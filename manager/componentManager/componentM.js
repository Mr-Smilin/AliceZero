// 整合 discord 組件為固定方法的控制器
// js
const CatchF = require("../../baseJS/CatchF.js");
const embedC = require("../embedManager/embedC.js");
const selectMenuC = require("../selectMenuManager/selectMenuC.js");

exports.GetHelpMessage = (ephemeral = false) => {
  try {
    let embed = embedC.HelpMessage();
    let selectMenu = selectMenuC.GetHelpSelectMenu();
    return {
      embeds: [embed],
      ephemeral: ephemeral,
      components: [selectMenu],
    }
  }
  catch (err) {
    CatchF.ErrorDo(err, "GetHelpMessage 方法異常!");
  }
}
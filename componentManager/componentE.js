// 整合 discord 組件為固定方法的控制器
// js
const CatchF = require("../baseJS/CatchF.js");
const embedE = require("../embedManager/embedE.js");
const selectMenuE = require("../selectMenuManager/selectMenuE.js");

exports.GetHelpMessage = (ephemeral = false) => {
  try {
    let embed = embedE.HelpMessage();
    let selectMenu = selectMenuE.GetHelpSelectMenu();
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
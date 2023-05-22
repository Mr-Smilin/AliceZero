// 整合 discord 組件為固定方法的控制器
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const embedC = require("../embedManager/embedC.js");
const selectMenuC = require("../selectMenuManager/selectMenuC.js");
const buttonC = require("../buttonManager/buttonC.js");

exports.GetHelpMessage = (ephemeral = false) => {
  try {
    const returnMessage = BDB.MNewMessage();
    let embed = embedC.HelpMessage();
    let selectMenu = selectMenuC.GetHelpSelectMenu();
    returnMessage
      .setEphemeral(ephemeral)
      .addEmbed(embed)
      .addComponents(selectMenu);
    return returnMessage.toMessage();
  }
  catch (err) {
    CatchF.ErrorDo(err, "GetHelpMessage 方法異常!");
  }
}

exports.GetMusicAliceMessage = (ephemeral = false) => {
  const returnMessage = BDB.MNewMessage();
  let buttonComponents = buttonC.GetMusicAliceButtons();
  returnMessage
    .setEphemeral(ephemeral)
    .addComponents(buttonComponents);
  return returnMessage.toMessage();
}
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
    const command = BDB.CGetCommand(1);
    let selectMenu = command.get("help").data;
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

exports.GetMusicMessage = (ephemeral = false) => {
  try {
    const returnMessage = BDB.MNewMessage();
    let embed = embedC.MusicMessage();
    returnMessage
      .setEphemeral(ephemeral)
      .addEmbed(embed)
      .addComponents(buttonC.GetMusicHelpButtons(0))
      .addComponents(buttonC.GetMusicHelpButtons(1));
    return returnMessage.toMessage();
  }
  catch (err) {
    CatchF.ErrorDo(err, "GetMusicMessage 方法異常!");
  }
}

exports.GetMusicAliceMessage = (ephemeral = false) => {
  try {
    const returnMessage = BDB.MNewMessage();
    let buttonComponents = buttonC.GetMusicAliceButtons();
    returnMessage
      .setEphemeral(ephemeral)
      .addComponents(buttonComponents);
    return returnMessage.toMessage();
  }
  catch (err) {
    CatchF.ErrorDo(err, "GetMusicAliceMessage 方法異常!");
  }
}

exports.GetHelpMusicMessage = (helpNumber = 0, ephemeral = true) => {
  try {
    const returnMessage = BDB.MNewMessage();
    let embed = embedC.HelpMusicMessage(helpNumber);
    returnMessage
      .setEphemeral(ephemeral)
      .addEmbed(embed);
    return returnMessage.toMessage();
  }
  catch (err) {
    CatchF.ErrorDo(err, "GetHelpPlayMessage 方法異常!");
  }
}

exports.GetMyKiritoSkillMessage = (roleData, status = 0) => {
  try {
    const returnMessage = BDB.MNewMessage();
    let embed = embedC.MykiritoSkillMessage(roleData, status);
    // 技能 身體素質 稱號
    let buttonComponents = buttonC.GetMyKiritoSkillButtons(status);
    returnMessage
      .addEmbed(embed)
      .addComponents(buttonComponents);
    return returnMessage.toMessage();
  }
  catch (err) {
    CatchF.ErrorDo(err, "GetMyKiritoSkillMessage 方法異常!");
  }
}
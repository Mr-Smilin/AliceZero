//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
// json
const buttonType = require("./buttonType.json");
//#endregion

//#region 按鈕集合

exports.GetMusicHelpButtons = (row = 0) => {
  const command = BDB.CGetCommand(2);
  const buttonAction = BDB.NewActionRow();
  if (row === 0) {
    let messageButton1 = command.get("helpPlay").data;
    let messageButton2 = command.get("helpPlayFirst").data;
    BDB.ActionRowAddComponents(buttonAction, messageButton1);
    BDB.ActionRowAddComponents(buttonAction, messageButton2);
  }
  else {
    let messageButton1 = command.get("helpPause").data;
    let messageButton2 = command.get("helpResume").data;
    let messageButton3 = command.get("helpSkip").data;
    let messageButton4 = command.get("helpNowQueue").data;
    let messageButton5 = command.get("helpSleep").data;
    BDB.ActionRowAddComponents(buttonAction, messageButton1);
    BDB.ActionRowAddComponents(buttonAction, messageButton2);
    BDB.ActionRowAddComponents(buttonAction, messageButton3);
    BDB.ActionRowAddComponents(buttonAction, messageButton4);
    BDB.ActionRowAddComponents(buttonAction, messageButton5);
  }
  return buttonAction;
};

exports.GetMusicAliceButtons = () => {
  const buttonAction = BDB.NewActionRow();
  let messageButton1 = BDB.BNewButton("pause", "暫停");
  let messageButton2 = BDB.BNewButton("resume", "恢復");
  let messageButton3 = BDB.BNewButton("skip", "跳過");
  let messageButton4 = BDB.BNewButton("nowQueue", "歌單", buttonType.green);
  let messageButton5 = BDB.BNewButton("sleep", "休息", buttonType.gray);
  BDB.ActionRowAddComponents(buttonAction, messageButton1);
  BDB.ActionRowAddComponents(buttonAction, messageButton2);
  BDB.ActionRowAddComponents(buttonAction, messageButton3);
  BDB.ActionRowAddComponents(buttonAction, messageButton4);
  BDB.ActionRowAddComponents(buttonAction, messageButton5);
  return buttonAction;
};

//#endregion
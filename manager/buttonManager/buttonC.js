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

exports.GetMusicHelpButtons = (row = 0) => {
  const buttonAction = BDB.NewActionRow();
  if (row === 0) {
    let messageButton1 = BDB.BNewButton("helpPlay", "點歌");
    let messageButton2 = BDB.BNewButton("helpPlayFirst", "插播");
    BDB.ActionRowAddComponents(buttonAction, messageButton1);
    BDB.ActionRowAddComponents(buttonAction, messageButton2);
  }
  else {
    let messageButton1 = BDB.BNewButton("helpPause", "暫停");
    let messageButton2 = BDB.BNewButton("helpResume", "恢復");
    let messageButton3 = BDB.BNewButton("helpSkip", "跳過");
    let messageButton4 = BDB.BNewButton("helpNowQueue", "歌單");
    let messageButton5 = BDB.BNewButton("helpSleep", "休息");
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
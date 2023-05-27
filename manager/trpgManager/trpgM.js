//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const trpgC = require("./trpgC.js");
// json
//#endregion

/** 查詢入口
 * 
 * @param {*} msg 
 * @param {*} cmd 
 * @param {*} args 
 */
exports.DoMStart = async (msg, cmd, args) => {
  try {
    switch (cmd) {
      case 'dice': //骰子
        trpgC.getTRpgDice(msg, args);
        break;
      case 'DICE': //骰子
        trpgC.getTRpgDice(msg, args);
        break;
      case 'd': //骰子
        trpgC.getTRpgDice(msg, args);
        break;
      case 'D': //骰子
        trpgC.getTRpgDice(msg, args);
        break;
      // case '排序': //排序
      //   getRandomSortArray(msg, cmd, args);
      //   break;
    }
  } catch (err) {
    CatchF.ErrorDo(err, "trpg 主方法異常!");
  }
}
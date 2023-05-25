//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const myKiritoC = require("./myKiritoC.js");
// json
//#endregion

/** 查詢入口
 * 
 * @param {*} msg 
 * @param {*} cmd 
 * @param {*} args 
 */
exports.DoStart = async (msg, cmd, args) => {
  try {
    // 資料下載好了才可以執行
    if (myKiritoC.IsOk())
      await myKiritoC.Start(msg, cmd, args);
  } catch (err) {
    CatchF.ErrorDo(err, "攻略組主方法異常!");
  }
}

/** 下載攻略組必要資料
 * 
 */
exports.DoInsertMyKirito = async (client) => {
  // 檢查 .env 是否有資料
  if (myKiritoC.CheckData()) {
    // 下載資料存入 gloabl
    await myKiritoC.DownloadData();
  } else {
    CatchF.LogDo("Disabled myKirito with message function");
  }
}
//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const componentM = require("../componentManager/componentM.js");
//#endregion


exports.DoBaseFunction = async (message, cmd, args = []) => {
  try {
    switch (cmd) {
      case "helpp":
        BDB.MSend(message, global.mkLevel);
        break;
      case "老婆":
        BDB.MSend(message, "你沒有老婆!!");
        break;
    }
    // 開發方法必須是開發者觸發
    if (BDB.MGetAuthorId(message) === process.env.MASTER_ID) {
      switch (cmd) {
        // 重新下載 global 資料
        case "reset":
          await resetGlobal(message);
          break;
      }
    }
  }
  catch (err) {
    CatchF.ErrorDo(err, " DoBaseFunction 異常!");
  }
}


// #region dev 方法

// dev import
const devAlice = require("../../alice.js");

// 重新下載資訊
async function resetGlobal(message) {
  try {
    await devAlice.ResetGlobal(BDB.CGetClient());
    BDB.MSend(message, "ok");
  }
  catch (err) {
    CatchF.ErrorDo(err);
    BDB.MSend(message, "Fail");
  }
}

// #endregion
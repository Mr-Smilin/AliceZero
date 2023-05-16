//#region import
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../baseJS/CatchF.js");
const componentE = require("../componentManager/componentE.js");
//#endregion


exports.DoBaseFunction = async (message, cmd, args = []) => {
  try {
    switch (cmd) {
      case "helpp":
        BDB.MSend(message, componentE.GetHelpMessage());
        break;
      case "老婆":
        BDB.MSend(message, "你沒有老婆!!");
        break;
      case "test":
        BDB.MSend(message, args[1]);
        break;
    }
  }
  catch (err) {
    CatchF.ErrorDo(err, " DoBaseFunction 異常!");
  }
}
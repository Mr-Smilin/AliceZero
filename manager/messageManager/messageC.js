//#region import
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
        // message?.client?.commands?.get("help")
        BDB.MSend(message, componentM.GetHelpMessage());
        break;
      case "老婆":
        BDB.MSend(message, "你沒有老婆!!");
        break;
      case "test":
        console.log(global);
        BDB.MSend(message, "" + global.a);
        // BDB.MSend(message, args[1]);
        break;
      case "test2":
        global.a = args[0];
        break;
    }
  }
  catch (err) {
    CatchF.ErrorDo(err, " DoBaseFunction 異常!");
  }
}
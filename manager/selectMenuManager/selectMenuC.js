//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
// json
//#endregion

exports.GetHelpSelectMenu = (command) => {
	try {
		const selectMenuAction = BDB.NewActionRow();
		const messageSelectMenu = BDB.SMNewSelectMenu(
			"help",
			"📖 指令教學"
		);
		BDB.SMPushOptions(messageSelectMenu, command.selectMenu.data);
		BDB.ActionRowAddComponents(selectMenuAction, messageSelectMenu);
		return selectMenuAction;
	}
	catch (err) {
		CatchF.ErrorDo(err, "GetHelpSelectMenu 方法異常!");
	}
}
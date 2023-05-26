//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
// json
//#endregion

exports.GetHelpSelectMenu = (name, value, options = []) => {
	try {
		const selectMenuAction = BDB.NewActionRow();
		const messageSelectMenu = BDB.SMNewSelectMenu(
			name,
			value
		);
		BDB.SMPushOptions(messageSelectMenu, options);
		BDB.ActionRowAddComponents(selectMenuAction, messageSelectMenu);
		return selectMenuAction;
	}
	catch (err) {
		CatchF.ErrorDo(err, "GetHelpSelectMenu 方法異常!");
	}
}
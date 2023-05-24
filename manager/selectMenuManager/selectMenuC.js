//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
// json
//#endregion

exports.GetHelpSelectMenu = (name, value) => {
	try {
		const selectMenuAction = BDB.NewActionRow();
		const messageSelectMenu = BDB.SMNewSelectMenu(
			name,
			value
		);
		const option1 = BDB.SMNewOption()
			.SMSetLabel("🎧 音樂系統")
			.SMSetDescription("想要聽音樂的靠過來!")
			.SMSetValue("music");
		const option2 = BDB.SMNewOption()
			.SMSetLabel("You can select me too")
			.SMSetDescription("This is also a description")
			.SMSetValue("second_option");
		BDB.SMPushOptions(messageSelectMenu, [option1, option2]);
		BDB.ActionRowAddComponents(selectMenuAction, messageSelectMenu);
		return selectMenuAction;
	}
	catch (err) {
		CatchF.ErrorDo(err, "GetHelpSelectMenu 方法異常!");
	}
}
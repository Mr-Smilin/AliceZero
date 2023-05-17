//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
// json
const selectTable = require("./selectTable.json");
//#endregion

// 定義各觸發句該如何回應

exports.SendMessage = function (interaction, command, selectTable) {
	const optionValues = BDB.SMGetSelectValues(interaction);
	switch (command.name) {
		case "help":
			switch (optionValues[0]) {
				case "music":
					return {
						content: "music",
						ephemeral: selectTable.ephemeral,
					};
			}
	}
	return {
		content: "預期外的指令!!",
		ephemeral: true,
	};
};

exports.GetHelpSelectMenu = () => {
	try {
		const selectMenuAction = BDB.NewActionRow();
		const messageSelectMenu = BDB.SMNewSelectMenu(
			"help",
			"📖 指令教學"
		);
		const messageSelectMenuOption = selectTable.find(
			(data) => data.slashId === 0
		);
		BDB.SMPushOptions(messageSelectMenu, messageSelectMenuOption.options);
		BDB.ActionRowAddComponents(selectMenuAction, messageSelectMenu);
		return selectMenuAction;
	}
	catch (err) {
		CatchF.ErrorDo(err, "GetHelpSelectMenu 方法異常!");
	}
}
//#region import
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
// js
const embedM = require("../embedManager/embedM.js");
// json
const buttonType = require("../buttonManager/buttonType.json");
const selectTable = require("../selectMenuManager/selectTable.json");
//#endregion

// 定義各觸發句該如何回應

exports.SendMessage = function (interaction, command) {
	switch (command.name) {
		case "help":
			// let ephemeral = false;
			// if (interaction?.options?.getString(command.options[0].name) === "1") {
			// 	ephemeral = true;
			// }

			// const buttonAction = BDB.NewActionRow();
			// const messageButton = BDB.BNewButton("test1", "test2");
			// BDB.ActionRowAddComponents(buttonAction, messageButton);

			const selectMenuAction = BDB.NewActionRow();
			const messageSelectMenu = BDB.SMNewSelectMenu(
				command.name,
				"📖 指令教學"
			);
			const messageSelectMenuOption = selectTable.find(
				(data) => data.slashId === command.id
			);
			BDB.SMPushOptions(messageSelectMenu, messageSelectMenuOption.options);
			BDB.ActionRowAddComponents(selectMenuAction, messageSelectMenu);

			let embedMessage = embedM.HelpMessage();

			return {
				// content: "test",
				embeds: [embedMessage],
				ephemeral: command.ephemeral,
				components: [selectMenuAction],
			};
		default:
			return {
				content: "預期外的指令!!",
				ephemeral: true,
			};
	}
};

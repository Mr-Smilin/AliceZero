//#region import
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
// js
const componentE = require("../componentManager/componentE.js");
// json
const buttonType = require("../buttonManager/buttonType.json");
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

			// return {
			// 	// content: "test",
			// 	embeds: [embedMessage],
			// 	ephemeral: command.ephemeral,
			// 	components: [selectMenuAction],
			// };
			return componentE.GetHelpMessage(command.ephemeral);
		default:
			return {
				content: "預期外的指令!!",
				ephemeral: true,
			};
	}
};
//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const buttonC = require("./buttonC.js");
// json
const buttonTable = require("./buttonTable.json");
//#endregion

exports.Start = async (interaction) => {
	if (!BDB.IIsButton(interaction)) return;
	if (BDB.IIsBot(interaction)) return;

	const command = interaction?.client?.commands?.get(BDB.BGetButtonId(interaction));

	if (!command) {
		CatchF.ErrorDo(`找不到按鈕 ${BDB.BGetButtonId(interaction)}。`);
		return;
	}

	if (command.data.name !== BDB.BGetButtonId(interaction)) {
		CatchF.ErrorDo(`找不到按鈕 ${BDB.BGetButtonId(interaction)}`);
		return;
	}

	// const buttonCommand = command?.selectMenu[BDB.SMGetSelectValue(interaction)];

	// if (!command) {
	// 	CatchF.ErrorDo(`找不到選項 ${BDB.SMGetSelectValue(interaction)}！`);
	// 	return;
	// }

	const buttonId = BDB.BGetButtonId(interaction);
	for (i of buttonTable) {
		if (i === null) continue;
		if (buttonId === i.id) {
			buttonC.GetButtonAction(interaction);
		}
	}
};

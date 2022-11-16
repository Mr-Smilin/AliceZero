//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../baseJS/CatchF.js");
const buttonE = require("./buttonE.js");
// json
const buttonTable = require("./buttonTable.json");
//#endregion

exports.Start = async (interaction) => {
	if (!BDB.IIsButton(interaction)) return;
	if (BDB.IIsBot(interaction)) return;
	interaction?.user?.id === process.env.MASTER_ID &&
		console.log("button: ", interaction);

	const buttonId = BDB.BGetButtonId(interaction);
	for (i of buttonTable) {
		if (i === null) continue;
		if (buttonId === i.id) {
			buttonE.GetButtonAction(interaction);
		}
	}
};

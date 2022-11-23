//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../baseJS/CatchF.js");
const selectMenuE = require("./selectMenuE.js");
// json
const selectTable = require("./selectTable.json");
const slashTable = require("../slashManager/slashTable.json");
//#endregion

exports.Start = async (interaction) => {
	if (!BDB.IIsSelectMenu(interaction)) return;
	if (BDB.IIsBot(interaction)) return;
	interaction?.user?.id === process.env.MASTER_ID &&
		console.log("selectMenu: ", interaction);

	const smName = BDB.SMGetSelectMenuName(interaction);
	for (i of slashTable) {
		if (i === null) continue;
		if (smName === i.name) {
			for (j of selectTable) {
				if (j === null) continue;
				if (j.slashId === i.id) {
					const message = selectMenuE.SendMessage(interaction, j);
					const replyType = j.replyType;
					await BDB.ISend(interaction, message, replyType);
				}
			}
		}
	}
};

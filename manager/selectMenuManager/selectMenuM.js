//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const selectMenuC = require("./selectMenuC.js");
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
					const message = selectMenuC.SendMessage(interaction, i, j);
					const replyType = j.replyType && 0;
					await BDB.ISend(interaction, message, replyType);
				}
			}
		}
	}
};

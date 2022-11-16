//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
const rest = BDB.SNewRest();
// js
const CatchF = require("../baseJS/CatchF.js");
const slashE = require("./slashE.js");
// json
const slashTable = require("./slashTable.json");
//#endregion

// 監聽斜線事件
exports.Start = async (interaction) => {
	if (!BDB.IIsSlash(interaction)) return;
	if (BDB.IIsBot(interaction)) return;
	interaction?.user?.id === process.env.MASTER_ID &&
		console.log("slash: ", interaction);

	const slashName = BDB.SGetSlashName(interaction);
	for (i of slashTable) {
		if (i === null) continue;
		if (slashName === i.name) {
			const message = slashE.SendMessage(interaction, i);
			await BDB.ISend(interaction, message);
		}
	}
};

// 註冊斜線命令
exports.InsertSlash = async () => {
	try {
		await BDB.SRestPutRoutes(rest, getApplicationCommands(commandDatas));
	} catch (err) {
		CatchF.ErrorDo(err, "InsertSlash: ");
	}
};

function getApplicationCommands(commandDatas) {
	const returnData = [];
	for (i of commandDatas) {
		const slashCommandBuilder = BDB.SNewSlashCommand(i?.name, i?.description);
		for (j of i?.options) {
			const choices = j?.choices || [];
			BDB.SPushOption(
				slashCommandBuilder,
				j?.type,
				j?.name,
				j?.description,
				j?.required,
				choices
			);
		}
		returnData.push(slashCommandBuilder);
	}
	return returnData;
}

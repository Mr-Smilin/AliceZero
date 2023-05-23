//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const fs = require("node:fs"); // 用於讀寫檔案
const path = require("node:path"); // 用於處理路徑
const CatchF = require("../../baseJS/CatchF.js");
const selectMenuC = require("./selectMenuC.js");
// json
//#endregion

exports.Start = async (interaction) => {
	if (!BDB.IIsSelectMenu(interaction)) return;
	if (BDB.IIsBot(interaction)) return;

	const command = interaction?.client?.commands?.get(BDB.SMGetSelectMenuId(interaction));

	if (!command) {
		CatchF.ErrorDo(`找不到指令 ${BDB.SMGetSelectMenuId(interaction)}。`);
		return;
	}

	if (command.data.name !== BDB.SMGetSelectMenuName(interaction)) {
		CatchF.ErrorDo(`找不到指令 ${BDB.SMGetSelectMenuId(interaction)}`);
		return;
	}

	const selectMenu = command?.selectMenu[BDB.SMGetSelectValue(interaction)];

	if (!command) {
		CatchF.ErrorDo(`找不到指令 ${BDB.SMGetSelectValue(interaction)}！`);
		return;
	}

	try {
		await selectMenu.execute(interaction);
	} catch (err) {
		CatchF.ErrorDo(err, "Slash 監聽事件異常!");
		await BDB.ISend(interaction, {
			content: "執行指令時發生錯誤！",
			ephemeral: true,
		}, 1);
	}
};

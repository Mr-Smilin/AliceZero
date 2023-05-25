//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const fs = require("node:fs"); // 用於讀寫檔案
const path = require("node:path"); // 用於處理路徑
const CatchF = require("../../baseJS/CatchF.js");
const buttonC = require("./buttonC.js");
// json
//#endregion

exports.Start = async (interaction) => {
	if (!BDB.IIsButton(interaction)) return;
	if (BDB.IIsBot(interaction)) return;

	const command = interaction?.client?.buttonCommands?.get(BDB.BGetButtonId(interaction));

	if (!command) {
		CatchF.ErrorDo(`找不到按鈕 ${BDB.BGetButtonId(interaction)}。`);
		return;
	}

	if (command?.data?.data?.custom_id !== BDB.BGetButtonId(interaction)) {
		CatchF.ErrorDo(`找不到按鈕 ${BDB.BGetButtonId(interaction)}`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (err) {
		CatchF.ErrorDo(err, "Button 監聽事件異常!");
		await BDB.ISend(interaction, {
			content: "執行按鈕時發生錯誤！",
			ephemeral: true,
		}, 1);
	}
};

// 註冊菜單命令
exports.InsertButton = async (client) => {
	try {
		BDB.CInitCommand(2);
		const commands = getApplicationCommands();
		CatchF.LogDo(`Successfully binded ${commands?.length} buttons on client.`);
	} catch (err) {
		CatchF.ErrorDo(err, "InsertButton: ");
	}
};

function getApplicationCommands() {
	const commands = [];
	// 讀取 commands 資料夾下的 js 檔案
	const commandsPath = path.join(__dirname, "commands");
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

	// 將指令加入 Collection
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		// 在 Collection 中以指令名稱作為 key，指令模組作為 value 加入
		if ("data" in command && "execute" in command) {
			BDB.CSetButtonCommand(command?.data?.data?.custom_id, command, 0);
		} else {
			CatchF.LogDo(`[警告] ${filePath} 中的指令缺少必要的 "data" 或 "execute" 屬性。`);
		}

		// 存進 commands array
		commands.push(command.data.toJSON());
	}

	return commands;
}

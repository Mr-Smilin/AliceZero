//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const fs = require("node:fs"); // 用於讀寫檔案
const path = require("node:path"); // 用於處理路徑
const CatchF = require("../../baseJS/CatchF.js");
// json
//#endregion

// 監聽斜線事件
exports.Start = async (interaction) => {

	if (!BDB.IIsSlash(interaction)) return;
	if (BDB.IIsBot(interaction)) return;

	const command = BDB.IGetCommand(interaction);

	if (!command) {
		CatchF.ErrorDo(`找不到指令 ${BDB.IGetCommandName(interaction)}。`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (err) {
		CatchF.ErrorDo(err, "Slash 監聽事件異常!");
		if (interaction?.replied || interaction?.deferred) {
			await BDB.ISend(interaction, {
				content: "執行指令時發生錯誤！",
				ephemeral: true,
			}, 1);
		} else {
			await BDB.ISend(interaction, {
				content: "執行指令時發生錯誤！",
				ephemeral: true,
			});
		}
	}

	// if (!BDB.IIsSlash(interaction)) return;
	// if (BDB.IIsBot(interaction)) return;
	// interaction?.user?.id === process.env.MASTER_ID &&
	// 	console.log("slash: ", interaction);

	// const slashName = BDB.SGetSlashName(interaction);
	// for (i of slashTable) {
	// 	if (i === null) continue;
	// 	if (slashName === i.name) {
	// 		const message = slashC.SendMessage(interaction, i);
	// 		const replyType = i.replyType && 0;
	// 		await BDB.ISend(interaction, message, replyType);
	// 	}
	// }
};

// 註冊斜線命令
exports.InsertSlash = async (client) => {
	try {
		BDB.CInitCommand();
		const commands = getApplicationCommands();
		CatchF.LogDo(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await BDB.SRestPutRoutes(commands);
		CatchF.LogDo(`Successfully reloaded ${data.size} application (/) commands.`);
	} catch (err) {
		CatchF.ErrorDo(err, "InsertSlash: ");
	}
};

function getApplicationCommands(client) {
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
			BDB.CSetCommand(command.data.name, command);
		} else {
			console.log(`[警告] ${filePath} 中的指令缺少必要的 "data" 或 "execute" 屬性。`);
		}

		// 存進 commands array
		commands.push(command.data.toJSON());
	}

	return commands;

	// for (i of slashTable) {
	// 	const slashCommandBuilder = BDB.SNewSlashCommand(i?.name, i?.description);
	// 	if (i?.options) {
	// 		for (j of i?.options) {
	// 			const choices = j?.choices || [];
	// 			BDB.SPushOption(
	// 				slashCommandBuilder,
	// 				j?.type,
	// 				j?.name,
	// 				j?.description,
	// 				j?.required,
	// 				choices
	// 			);
	// 		}
	// 	}
	// 	returnData.push(slashCommandBuilder);
	// }
	// return returnData;
}

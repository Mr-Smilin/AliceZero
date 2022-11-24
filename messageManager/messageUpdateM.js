//#region import
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../baseJS/CatchF.js");
// json
const prefix = require("./messagePrefix.json");
//#endregion

exports.Start = async (oldMessage, newMessage) => {
	// 不會成功，但還是留著保險
	if (!oldMessage?.guildId || !newMessage?.guildId) return;
	try {
		if (oldMessage?.content !== newMessage?.content) {
			let nameStr = `事件 更新\n使用者 ${oldMessage?.author?.username}`;
			let guildStr = "";
			if (oldMessage?.member) {
				guildStr = `(${oldMessage?.member?.nickname})\n群組 ${oldMessage?.guild?.name}\n頻道 ${oldMessage?.channel?.name}`;
			}
			let talkStr = `\n舊對話 ${oldMessage?.content}\n新對話 ${newMessage?.content}\n`;
			const messageStr = nameStr + guildStr + talkStr;
			BDB.MSend(
				BDB.GetMe(),
				messageStr,
				2,
				"1045291181384413194",
				"717361302355312692"
			);
		}
	} catch (e) {
		CatchF.ErrorDo(e, "messageUpdate 錯誤");
	}
};

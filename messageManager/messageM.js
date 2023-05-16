//#region import
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../baseJS/CatchF.js");
const MessageE = require("./messageE.js");
// json
const prefix = require("./messagePrefix.json");
//#endregion

exports.Start = async (msg) => {
	try {
		if (!msg.guild || !msg.member) return;
		if (!msg.member.user) return;
		if (msg.member.user.bot) return;
	} catch (err) {
		return;
	}

	try {
		let cmd = BDB.MContent(msg).split(' ');
		let args = [];

		if (cmd[1] === undefined) {
			if (cmd[0] !== undefined)
				await SelectFunctionWithPrefix(msg, cmd);
		} else {
			args = cmd.splice(2, cmd.length - 2);
			await SelectFunctionWithPrefix(msg, cmd, args);
		}
	} catch (err) {
		CatchF.ErrorDo(err, "DiscordMessage");
	}
};

async function SelectFunctionWithPrefix(msg, cmd, args = []) {
	let nowPrefix = -1;
	const allPrefix = Object.keys(prefix);
	for (const onePrefix in allPrefix) {
		if (
			BDB.MContent(msg).substring(0, prefix[onePrefix].Value.length) ===
			prefix[onePrefix].Value
		) {
			nowPrefix = prefix[onePrefix].Id;
		}
	}

	// 正則判斷
	if (cmd[1] === undefined) {
		nowPrefix = DeleteTempIfHaveEx(cmd[0], nowPrefix);
	} else {
		nowPrefix = DeleteTempIfHaveEx(BDB.MContent(msg), nowPrefix);
	}


	switch (nowPrefix) {
		// 基本方法
		case "0":
			MessageE.DoBaseFunction(msg, cmd[1], args)
			break;
		// 音樂方法
		case "1":
			BDB.MSend(msg, "ok");
			break;
	}
}

//正則判斷 有奇怪符號的都給我出去
function DeleteTempIfHaveEx(msg, temp) {
	let tempValue = temp;
	//if (msg.substring(0, 4) !== 'http') {
	if (tempValue != '1') {
		const t = /\@|\:/;
		if (t.test(msg)) tempValue = -1;
	}
	return tempValue;
}
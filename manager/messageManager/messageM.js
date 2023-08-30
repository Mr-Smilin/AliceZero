//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
const MessageC = require("./messageC.js");
const messageConstant = require("./messageConstant.js")''
const musicM = require("../musicManager/musicM.js");
const myKiritoM = require("../mykiritoManager/myKiritoM.js");
const trpgM = require("../trpgManager/trpgM.js");
const nineDatas = require("./nineData.js");
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
		// 掃地
		if (BDB.MGetChannelId(msg) === '709293980684386344' || BDB.MGetChannelId(msg) === '716316365555761183' && BDB.MContent(msg).indexOf("掃地") > -1)
			nineDatas.execute(msg, nineDatas.data);
	} catch (err) {
		CatchF.ErrorDo(err, "掃地方法出錯啦");
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

/**
 * 
 * @param {*} msg discord.message
 * @param {*} cmd 0 - 前綴字 1 - 指令 
 * @param {*} args 參數
 */
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

	nowPrefix = findPowerFromConstant(msg, nowPrefix);
	// 正則判斷
	if (cmd[1] === undefined) {
		nowPrefix = DeleteTempIfHaveEx(cmd[0], nowPrefix);
	} else {
		nowPrefix = DeleteTempIfHaveEx(BDB.MContent(msg), nowPrefix);
	}


	switch (nowPrefix) {
		// 基本方法
		case "0":
			MessageC.DoBaseFunction(msg, cmd[1], args)
			break;
		// 音樂方法
		case "1":
			musicM.DoMStart(msg, cmd[1], args);
			break;
		// mykirito 攻略組
		case "2":
			myKiritoM.DoStart(msg, cmd[1], args);
			break;
		// TRPG 指令
		case "3":
			trpgM.DoMStart(msg, cmd[1], args);
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

//權限判斷 預設判斷群組id
function findPowerFromConstant(msg, temp) {
    let a = messageConstant.Power.find(item => item.ChannelID == BDB.MGetChannelId(msg) && item.Power.indexOf(temp) != -1);
    if (a !== undefined) temp = -1;
    else if (messageConstant.Power.find(item => item.ChannelID == BDB.MGetChannelId(msg)) === undefined) {
        a = messageConstant.Power.find(item => item.GroupID == BDB.MGetGuildId(msg) && item.Power.indexOf(temp) != -1);
        if (a !== undefined) temp = -1;
    }
    return temp;
}
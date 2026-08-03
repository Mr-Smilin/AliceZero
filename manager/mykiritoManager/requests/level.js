//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../../baseJS/CatchF.js");
const componentM = require("../../componentManager/componentM.js");
//#endregion

// 轉生點
const request = {
	data: {
		name: "轉生點",
	},
	// 舊版資料已停止更新，url 指向 myKiritoData 內的本地 json
	url: "levels.json",
	ver: "old",
	usage: "攻略組 轉生點 {等級} [範圍]",
	description:
		"從選擇等級開始查詢，根據範圍返還查詢數量(等級1~100，範圍1~10，預設5)",
	// 資料放在哪個 global，菜單與按鈕都靠這個拿資料
	getData: () => global.mkLevel ?? {},
	// 沒有指定等級時，菜單要列出來的選項
	targets: () => Object.keys(request.getData()),
	async callback(data) {
		if (data === undefined) {
			throw new Error("讀取轉生點時發生意外錯誤，通常是本地檔案不見了");
		}
		global.mkLevel = data;
	},
	async execute(discordObject, cmd, args) {
		try {
			// 等級或範圍不合法，改用菜單讓使用者挑
			if (
				args[0] === undefined ||
				args[0] === "" ||
				args[1] === "" ||
				args[0] > 100 ||
				args[0] < 1 ||
				args[1] > 10 ||
				args[1] < 1 ||
				isNaN(args[0]) === true ||
				(isNaN(args[1]) === true && args[1] !== undefined)
			)
				await BDB.MSend(
					discordObject,
					componentM.GetMyKiritoTargetMessage(request),
				);
			else await BDB.MSend(discordObject, returnLevelMessage(args));
		} catch (err) {
			CatchF.ErrorDo(err, "攻略組 轉生點 查詢異常!");
		}
	},
};

module.exports = request;

function returnLevelMessage(args) {
	const responseData = request.getData();
	const level = args[0];
	// 範圍預設5
	if (args[1] === undefined) {
		args[1] = 5;
	}
	const range = args[1];
	let message = "```";
	for (i = level; i <= Object.keys(responseData)?.length; i++) {
		if (i >= parseFloat(level) + parseFloat(range)) break;
		if (responseData[i] !== undefined)
			message += `等級${paddingLeft(i, 4)} | 等級所需經驗${paddingLeft(responseData[i].lat, 7)} | 累積轉生點${paddingLeft(responseData[i].lng, 3)} \n`;
	}
	message += "```";

	if (message === "``````") message = "你能不能正常打字?";

	return message;
}

//字串補空白
function paddingLeft(str, lenght) {
	if (str.length >= lenght) return str;
	else return paddingLeft(" " + str, lenght);
}

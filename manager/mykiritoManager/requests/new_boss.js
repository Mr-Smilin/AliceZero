//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../../baseJS/CatchF.js");
const componentM = require("../../componentManager/componentM.js");
require("dotenv").config();
//#endregion

// 樓層 - 經典服
const request = {
	data: {
		name: "樓層",
	},
	method: "GET",
	url: process.env.GASURL_NEW_BOSSES,
	ver: "new",
	usage: "攻略組 樓層 {層數}",
	description: "根據層數，反饋此樓層Boss資訊",
	// 資料放在哪個 global，菜單與按鈕都靠這個拿資料
	getData: () => global.newMkBoss ?? {},
	// 沒有指定樓層時，菜單要列出來的選項
	targets: () => Object.keys(request.getData()),
	async callback(data) {
		if (data === undefined) {
			throw new Error("下載樓層資訊時發生意外錯誤，通常是google不開心了");
		}
		global.newMkBoss = data;
	},
	async execute(discordObject, cmd, args) {
		try {
			const bossData = request.getData()[args[0]];
			// 沒指定樓層或查不到，改用菜單讓使用者挑
			if (bossData === undefined)
				await BDB.MSend(
					discordObject,
					componentM.GetMyKiritoTargetMessage(request),
				);
			else
				await BDB.MSend(
					discordObject,
					componentM.GetMyKiritoBossMessage({
						floor: args[0],
						data: bossData,
					}),
				);
		} catch (err) {
			CatchF.ErrorDo(err, "攻略組 樓層 查詢異常!");
		}
	},
};

module.exports = request;

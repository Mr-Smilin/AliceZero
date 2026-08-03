//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../../baseJS/CatchF.js");
const componentM = require("../../componentManager/componentM.js");
//#endregion

// 樓層
const request = {
	data: {
		name: "樓層",
	},
	// 舊版資料已停止更新，url 指向 myKiritoData 內的本地 json
	url: "bosses.json",
	ver: "old",
	usage: "攻略組 樓層 {層數}",
	description: "根據層數，反饋此樓層Boss資訊",
	// 沒有指定樓層時，菜單要列出來的選項
	targets: () => Object.keys(global.mkBoss ?? {}),
	async callback(data) {
		if (data === undefined) {
			throw new Error("讀取樓層資訊時發生意外錯誤，通常是本地檔案不見了");
		}
		global.mkBoss = data;
	},
	async execute(discordObject, cmd, args) {
		try {
			const bossData = global.mkBoss?.[args[0]];
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

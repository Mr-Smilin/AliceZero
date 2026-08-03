//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../../baseJS/CatchF.js");
const componentM = require("../../componentManager/componentM.js");
//#endregion

// 角色情報
const request = {
	data: {
		name: "情報",
	},
	// 舊版資料已停止更新，url 指向 myKiritoData 內的本地 json
	url: "skills.json",
	ver: "old",
	usage: "攻略組 情報 {角色名稱}",
	description: "根據角色名稱，反饋此角色已記錄技能與簡介",
	// 資料放在哪個 global，菜單與按鈕都靠這個拿資料
	getData: () => global.mkSkill ?? {},
	// 沒有指定角色時，菜單要列出來的選項
	targets: () => Object.keys(request.getData()),
	async callback(data) {
		if (data === undefined) {
			throw new Error("讀取角色情報時發生意外錯誤，通常是本地檔案不見了");
		}
		global.mkSkill = data;
	},
	async execute(discordObject, cmd, args) {
		try {
			const roleData = request.getData()[args[0]];
			// 沒指定角色或查不到，改用菜單讓使用者挑
			if (roleData === undefined)
				await BDB.MSend(
					discordObject,
					componentM.GetMyKiritoTargetMessage(request),
				);
			else
				await BDB.MSend(
					discordObject,
					componentM.GetMyKiritoSkillMessage(
						{
							name: args[0],
							data: roleData,
						},
						0,
					),
				);
		} catch (err) {
			CatchF.ErrorDo(err, "攻略組 情報 查詢異常!");
		}
	},
};

module.exports = request;

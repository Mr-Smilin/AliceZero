//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../../baseJS/CatchF.js");
const componentM = require("../../componentManager/componentM.js");
require("dotenv").config();
//#endregion

// 角色情報 - 經典服
const request = {
	data: {
		name: "情報",
	},
	method: "GET",
	url: process.env.GASURL_NEW_SKILLS,
	ver: "new",
	usage: "攻略組 情報 {角色名稱}",
	description: "根據角色名稱，反饋此角色已記錄技能與簡介",
	// 沒有指定角色時，菜單要列出來的選項
	targets: () => Object.keys(global.newMkSkill ?? {}),
	async callback(data) {
		if (data === undefined) {
			throw new Error("下載角色情報時發生意外錯誤，通常是google不開心了");
		}
		global.newMkSkill = data;
	},
	async execute(discordObject, cmd, args) {
		try {
			const roleData = global.newMkSkill?.[args[0]];
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

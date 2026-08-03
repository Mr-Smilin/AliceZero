//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const selectMenuC = require("../selectMenuC.js");
const componentM = require("../../componentManager/componentM.js");
const myKiritoC = require("../../mykiritoManager/myKiritoC.js");
//#endregion

/** 攻略組 目標菜單
 *  選項是資料本身(角色 / 樓層 / 等級)，數量會超過菜單上限，所以用分頁菜單
 *  值的格式為 {指令}|{目標}，換頁時則是 {指令}|#page:{頁數}
 */
module.exports = {
	data: selectMenuC.GetHelpSelectMenu("mykiritoTarget", "查詢目標"),
	async execute(interaction) {
		const { group, item, page } = selectMenuC.ParsePagedValue(
			BDB.SMGetSelectValue(interaction)
		);
		const ver = myKiritoC.GetVer(
			interaction?.guild?.id,
			interaction?.channel?.id
		);
		const request = myKiritoC.GetRequest(ver, group);
		if (request === undefined) return;

		// 換頁，直接更新原本的菜單訊息
		if (page !== undefined) {
			await BDB.IEdit(
				interaction,
				componentM.GetMyKiritoTargetMessage(request, page),
				1
			);
			return;
		}

		// 選到目標，先確認互動再沿用原本的查詢方法輸出 embed
		await BDB.IDeferUpdate(interaction);
		await request.execute(interaction, group, [item]);
	},
};

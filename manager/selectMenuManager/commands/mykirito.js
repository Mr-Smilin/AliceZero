//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const selectMenuC = require("../selectMenuC.js");
const componentM = require("../../componentManager/componentM.js");
const myKiritoC = require("../../mykiritoManager/myKiritoC.js");
//#endregion

/** 攻略組 指令菜單
 *  選項要看頻道能查哪個版本，傳送當下才產生，這裡只提供註冊用的空菜單
 */
module.exports = {
	data: selectMenuC.GetHelpSelectMenu("mykirito", "攻略組指令"),
	async execute(interaction) {
		const ver = myKiritoC.GetVer(
			interaction?.guild?.id,
			interaction?.channel?.id
		);
		const request = myKiritoC.GetRequest(
			ver,
			BDB.SMGetSelectValue(interaction)
		);
		if (request === undefined) return;

		// 接著在同一則訊息上顯示這個指令的效果與可查詢的目標
		await BDB.IEdit(interaction, componentM.GetMyKiritoTargetMessage(request), 1);
	},
};

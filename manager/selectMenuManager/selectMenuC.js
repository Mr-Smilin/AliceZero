//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
// json
//#endregion

exports.GetHelpSelectMenu = (name, value, options = []) => {
	try {
		const selectMenuAction = BDB.NewActionRow();
		const messageSelectMenu = BDB.SMNewSelectMenu(
			name,
			value
		);
		BDB.SMPushOptions(messageSelectMenu, options);
		BDB.ActionRowAddComponents(selectMenuAction, messageSelectMenu);
		return selectMenuAction;
	}
	catch (err) {
		CatchF.ErrorDo(err, "GetHelpSelectMenu 方法異常!");
	}
}

//#region 分頁菜單

// discord 一個菜單最多 25 個選項，預留 2 個位置給上下頁
const pageSize = 23;
// 換頁選項的值，用資料不會出現的符號開頭
const pageMark = "#page:";

/** 菜單的值格式為 {群組}|{選項}
 *  discord 選完只會回傳值，靠群組才知道這個選項屬於哪個指令
 */
const encodeValue = (group, value) => `${group}|${value}`;

/** 解析分頁菜單的值
 *
 * @param {string} value 菜單回傳的值
 * @returns {{group: string, item: string|undefined, page: number|undefined}} 換頁選項回傳 page，其餘回傳 item
 */
exports.ParsePagedValue = (value = "") => {
	try {
		const [group, ...rest] = value.split("|");
		const item = rest.join("|");
		if (item.startsWith(pageMark))
			return { group, page: Number(item.substring(pageMark.length)) };
		return { group, item };
	}
	catch (err) {
		CatchF.ErrorDo(err, "ParsePagedValue 方法異常!");
		return {};
	}
}

/** 回傳一個帶上下頁的菜單，選項超過上限時自動分頁
 *
 * @param {string} name 菜單 customId
 * @param {string} value 默認顯示的文字
 * @param {string} group 選項所屬的群組，解析時用來辨識來源
 * @param {string[]} items 所有選項
 * @param {number} page 第幾頁，從 0 開始
 */
exports.GetPagedSelectMenu = (name, value, group, items = [], page = 0) => {
	try {
		const maxPage = Math.max(Math.ceil(items.length / pageSize) - 1, 0);
		const nowPage = Math.min(Math.max(page, 0), maxPage);
		const options = items
			.slice(nowPage * pageSize, (nowPage + 1) * pageSize)
			.map((item) =>
				BDB.SMNewOption()
					.SMSetLabel(`${item}`)
					.SMSetValue(encodeValue(group, item))
			);

		if (nowPage > 0)
			options.unshift(
				BDB.SMNewOption()
					.SMSetLabel("⬅ 上一頁")
					.SMSetDescription(`第 ${nowPage} / ${maxPage + 1} 頁`)
					.SMSetValue(encodeValue(group, `${pageMark}${nowPage - 1}`))
			);
		if (nowPage < maxPage)
			options.push(
				BDB.SMNewOption()
					.SMSetLabel("➡ 下一頁")
					.SMSetDescription(`第 ${nowPage + 2} / ${maxPage + 1} 頁`)
					.SMSetValue(encodeValue(group, `${pageMark}${nowPage + 1}`))
			);

		return this.GetHelpSelectMenu(
			name,
			`${value} (${nowPage + 1}/${maxPage + 1})`,
			options
		);
	}
	catch (err) {
		CatchF.ErrorDo(err, "GetPagedSelectMenu 方法異常!");
	}
}

//#endregion
/**
 * 菜單系統測試
 *
 * selectMenuC 負責產生菜單(含分頁)，selectMenuM 負責把使用者選到的值分派給對應的處理方法。
 * 動態選項(選項是資料本身，例如角色名稱)靠的就是這兩者的組合，這裡把規則釘住。
 */

//#region import
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const BDB = require("../baseJS/BaseDiscordBot.js");
const selectMenuC = require("../manager/selectMenuManager/selectMenuC.js");
const selectMenuM = require("../manager/selectMenuManager/selectMenuM.js");
//#endregion

//#region 測試工具

/** 取出 ActionRow 裡菜單的 json */
const getMenu = (actionRow) => actionRow.toJSON().components[0];

/** 模擬 discord.js 的菜單 interaction
 *
 * @param {string} customId 菜單 id
 * @param {string} value 被選中的值
 * @param {*} commands 已註冊的菜單指令
 */
function newFakeInteraction(customId, value, commands = new Map()) {
	return {
		customId,
		values: [value],
		user: { bot: false },
		client: { selectMenuCommands: commands },
		isStringSelectMenu: () => true,
		isButton: () => false,
		isChatInputCommand: () => false,
		isUserContextMenuCommand: () => false,
		reply: async () => {},
	};
}

/** 關掉 console，避免測試錯誤路徑時洗版 */
async function silence(doSomeThing) {
	const rawLog = console.log;
	const rawError = console.error;
	console.log = () => {};
	console.error = () => {};
	try {
		return await doSomeThing();
	} finally {
		console.log = rawLog;
		console.error = rawError;
	}
}

// 造 50 筆假資料，剛好切成 3 頁(每頁 23 筆)
const items = Array.from({ length: 50 }, (_, i) => `項目${i}`);

//#endregion

describe("selectMenuC - 分頁菜單", () => {
	it("選項數量不會超過 discord 的 25 個上限", () => {
		const menu = getMenu(
			selectMenuC.GetPagedSelectMenu("test", "測試", "群組", items, 0)
		);
		assert.ok(menu.options.length <= 25, `選項有 ${menu.options.length} 個`);
	});

	it("第一頁只有下一頁，中間頁上下頁都有，最後一頁只有上一頁", () => {
		const labels = (page) =>
			getMenu(
				selectMenuC.GetPagedSelectMenu("test", "測試", "群組", items, page)
			).options.map((option) => option.label);

		assert.equal(labels(0).includes("⬅ 上一頁"), false);
		assert.equal(labels(0).includes("➡ 下一頁"), true);
		assert.equal(labels(1).includes("⬅ 上一頁"), true);
		assert.equal(labels(1).includes("➡ 下一頁"), true);
		assert.equal(labels(2).includes("⬅ 上一頁"), true);
		assert.equal(labels(2).includes("➡ 下一頁"), false);
	});

	it("選項一頁放得下時不會出現換頁選項", () => {
		const menu = getMenu(
			selectMenuC.GetPagedSelectMenu("test", "測試", "群組", ["只有一筆"], 0)
		);
		assert.equal(menu.options.length, 1);
		assert.equal(menu.placeholder, "測試 (1/1)");
	});

	it("每頁接續不漏資料", () => {
		const values = [0, 1, 2]
			.flatMap((page) =>
				getMenu(
					selectMenuC.GetPagedSelectMenu("test", "測試", "群組", items, page)
				).options
			)
			.map((option) => selectMenuC.ParsePagedValue(option.value).item)
			.filter((item) => item !== undefined);

		assert.deepEqual(values, items);
	});

	it("超出範圍的頁數會被夾在有效範圍內", () => {
		const first = getMenu(
			selectMenuC.GetPagedSelectMenu("test", "測試", "群組", items, -5)
		);
		const last = getMenu(
			selectMenuC.GetPagedSelectMenu("test", "測試", "群組", items, 99)
		);
		assert.equal(first.placeholder, "測試 (1/3)");
		assert.equal(last.placeholder, "測試 (3/3)");
	});

	it("值帶著群組，解析後可以還原成選項或頁數", () => {
		const options = getMenu(
			selectMenuC.GetPagedSelectMenu("test", "測試", "情報", items, 1)
		).options;

		const item = selectMenuC.ParsePagedValue(
			options.find((option) => option.label === "項目25").value
		);
		assert.deepEqual(item, { group: "情報", item: "項目25" });

		const next = selectMenuC.ParsePagedValue(
			options.find((option) => option.label === "➡ 下一頁").value
		);
		assert.deepEqual(next, { group: "情報", page: 2 });
	});
});

describe("selectMenuM - 選項分派", () => {
	it("選項值有專屬處理方法時優先使用", async () => {
		const called = [];
		const commands = new Map([
			[
				"help",
				{
					data: selectMenuC.GetHelpSelectMenu("help", "說明"),
					music: { execute: async () => called.push("music") },
					execute: async () => called.push("共用"),
				},
			],
		]);

		await selectMenuM.Start(newFakeInteraction("help", "music", commands));
		assert.deepEqual(called, ["music"]);
	});

	it("選項是動態產生時交給模組共用的 execute", async () => {
		const called = [];
		const commands = new Map([
			[
				"mykiritoTarget",
				{
					data: selectMenuC.GetHelpSelectMenu("mykiritoTarget", "查詢目標"),
					execute: async (interaction) =>
						called.push(BDB.SMGetSelectValue(interaction)),
				},
			],
		]);

		await selectMenuM.Start(
			newFakeInteraction("mykiritoTarget", "情報|桐人", commands)
		);
		assert.deepEqual(called, ["情報|桐人"]);
	});

	it("找不到處理方法時只記錄錯誤，不會中斷", async () => {
		const commands = new Map([
			[
				"help",
				{ data: selectMenuC.GetHelpSelectMenu("help", "說明") },
			],
		]);

		await silence(() =>
			selectMenuM.Start(newFakeInteraction("help", "不存在的選項", commands))
		);
	});

	it("不是菜單的 interaction 直接略過", async () => {
		const called = [];
		const commands = new Map([
			[
				"help",
				{
					data: selectMenuC.GetHelpSelectMenu("help", "說明"),
					execute: async () => called.push("不該被呼叫"),
				},
			],
		]);
		const interaction = newFakeInteraction("help", "music", commands);
		interaction.isStringSelectMenu = () => false;

		await selectMenuM.Start(interaction);
		assert.deepEqual(called, []);
	});
});

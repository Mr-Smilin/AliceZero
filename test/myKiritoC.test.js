/**
 * 攻略組資料來源測試
 *
 * 舊版(ver: old)資料在 mykirito 關服後就不會再更新，改由 myKiritoData 內的本地 json 提供；
 * 只有經典服(ver: new)還需要向 api 下載。這裡盯住的就是「該讀本地的別去打 api」。
 */

//#region import
const { describe, it, before, after, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");
//#endregion

// request 模組在 require 當下就會讀取 api 位址，必須比 myKiritoC 更早設定
process.env.GASURL_NEW_SKILLS = "https://example.invalid/new_skills";
process.env.GASURL_NEW_BOSSES = "https://example.invalid/new_bosses";

const BDB = require("../baseJS/BaseDiscordBot.js");
const myKiritoC = require("../manager/mykiritoManager/myKiritoC.js");
const selectMenuM = require("../manager/selectMenuManager/selectMenuM.js");
const selectMenuC = require("../manager/selectMenuManager/selectMenuC.js");
const buttonM = require("../manager/buttonManager/buttonM.js");

const requestsPath = path.join(__dirname, "../manager/mykiritoManager/requests");
const dataPath = path.join(__dirname, "../manager/mykiritoManager/myKiritoData");

/** 讀取所有 request 模組 */
function getRequests() {
	return fs
		.readdirSync(requestsPath)
		.filter((file) => file.endsWith(".js"))
		.map((file) => require(path.join(requestsPath, file)));
}

/** 模擬 discord.js 的 Message */
function newFakeMessage(guildId, channelId) {
	const sent = [];
	return {
		guild: { id: guildId },
		channel: {
			id: channelId,
			send: async (message) => {
				sent.push(message);
				return message;
			},
		},
		sent,
	};
}

/** 模擬 discord.js 的菜單 interaction */
function newFakeInteraction(customId, value, guildId, channelId) {
	const message = newFakeMessage(guildId, channelId);
	return Object.assign(message, {
		customId,
		values: [value],
		user: { bot: false },
		client: BDB.CGetClient(),
		isStringSelectMenu: () => true,
		isButton: () => false,
		isChatInputCommand: () => false,
		isUserContextMenuCommand: () => false,
		// 更新的訊息與 deferUpdate 都記錄下來，方便驗證互動有沒有被確認
		updated: [],
		deferred: [],
		update: async (updateMessage) => message.updated.push(updateMessage),
		deferUpdate: async () => message.deferred.push(true),
	});
}

/** 取出訊息裡菜單的 json */
const getMenu = (message) =>
	message?.components?.[0]?.toJSON()?.components?.[0];

// 白名單頻道，與 myKiritoC 內的設定一致
const oldChannel = ["716213468394553396", "815932181566324756"];
const newChannel = ["716213468394553396", "1532687389150019595"];

describe("攻略組 - request 模組的資料來源", () => {
	it("舊版模組的 url 指向真的存在的本地 json", () => {
		const oldRequests = getRequests().filter((request) => request.ver === "old");

		assert.equal(oldRequests.length, 3, "舊版模組應該有 樓層 / 轉生點 / 情報 三支");
		for (const request of oldRequests) {
			assert.ok(
				fs.existsSync(path.join(dataPath, request.url)),
				`${request.data.name} 的本地資料 ${request.url} 不存在`
			);
		}
	});

	it("經典服模組的 url 來自 .env 的 api 位址", () => {
		const newRequests = getRequests().filter((request) => request.ver === "new");

		assert.equal(newRequests.length, 2, "經典服模組應該有 樓層 / 情報 兩支");
		for (const request of newRequests) {
			assert.match(request.url, /^https?:\/\//, `${request.data.name} 沒有 api 位址`);
		}
	});
});

describe("攻略組 - CheckData", () => {
	const rawEnv = { ...process.env };

	beforeEach(() => {
		process.env.GASURL_NEW_SKILLS = rawEnv.GASURL_NEW_SKILLS;
		process.env.GASURL_NEW_BOSSES = rawEnv.GASURL_NEW_BOSSES;
	});

	after(() => {
		process.env.GASURL_NEW_SKILLS = rawEnv.GASURL_NEW_SKILLS;
		process.env.GASURL_NEW_BOSSES = rawEnv.GASURL_NEW_BOSSES;
	});

	it("經典服的 api 位址齊全時通過", () => {
		assert.equal(myKiritoC.CheckData(), true);
	});

	it("少了任何一個經典服 api 位址就不通過", () => {
		delete process.env.GASURL_NEW_BOSSES;
		assert.equal(myKiritoC.CheckData(), false);
	});

	it("舊版的 api 位址已經不再是必要條件", () => {
		delete process.env.GASURL_LEVELS;
		delete process.env.GASURL_SKILLS;
		delete process.env.GASURL_BOSSES;
		assert.equal(myKiritoC.CheckData(), true);
	});
});

describe("攻略組 - DownloadData", () => {
	before(async () => {
		// 攔截 api，測試不對外連線
		mock.method(axios, "get", async (url) => ({ data: { fromApi: url } }));
		await myKiritoC.DownloadData();
	});

	after(() => mock.restoreAll());

	it("舊版資料直接讀本地 json，不會打 api", () => {
		assert.equal(axios.get.mock.callCount(), 2, "只有經典服的兩支模組該打 api");

		const urls = axios.get.mock.calls.map((call) => call.arguments[0]);
		assert.deepEqual(urls.sort(), [
			process.env.GASURL_NEW_BOSSES,
			process.env.GASURL_NEW_SKILLS,
		].sort());
	});

	it("舊版資料被放進對應的 global", () => {
		assert.ok(global.mkBoss["1F"], "樓層資料缺少 1F");
		assert.ok(global.mkSkill["桐人"], "角色情報缺少 桐人");
		assert.ok(global.mkLevel["1"], "轉生點資料缺少 等級1");
	});

	it("經典服資料由 api 取得後放進對應的 global", () => {
		assert.deepEqual(global.newMkBoss, { fromApi: process.env.GASURL_NEW_BOSSES });
		assert.deepEqual(global.newMkSkill, { fromApi: process.env.GASURL_NEW_SKILLS });
	});

	it("下載完成後才會開啟攻略組功能", () => {
		assert.equal(global.isMykirito, true);
		assert.equal(myKiritoC.IsOk(), true);
	});
});

describe("攻略組 - 頻道分流", () => {
	before(async () => {
		mock.method(axios, "get", async (url) => ({ data: { [url]: {} } }));
		await myKiritoC.DownloadData();
		mock.restoreAll();
	});

	it("舊服頻道查得到本地資料", async () => {
		const msg = newFakeMessage(...oldChannel);
		await myKiritoC.Start(msg, "樓層", ["1F"]);

		assert.equal(msg.sent.length, 1);
		assert.ok(msg.sent[0].embeds, "應該回覆一則 embed 訊息");
	});

	it("舊服頻道查不到的樓層會回覆選單", async () => {
		const msg = newFakeMessage(...oldChannel);
		await myKiritoC.Start(msg, "樓層", ["不存在的樓層"]);

		assert.match(msg.sent[0].content, /語法: 攻略組 樓層/);
		assert.equal(getMenu(msg.sent[0]).custom_id, "mykiritoTarget");
	});

	it("經典服頻道走的是經典服資料", async () => {
		const msg = newFakeMessage(...newChannel);
		await myKiritoC.Start(msg, "樓層", ["1F"]);

		// 經典服資料是測試餵進去的假資料，查不到 1F 時會回覆選單
		assert.equal(msg.sent.length, 1);
		assert.match(msg.sent[0].content, /語法: 攻略組 樓層/);
	});

	it("非白名單頻道只會收到關服訊息", async () => {
		const msg = newFakeMessage("其他群組", "其他頻道");
		await myKiritoC.Start(msg, "樓層", ["1F"]);

		assert.equal(msg.sent.length, 1);
		assert.match(msg.sent[0], /已關服|從來都沒存在過/);
	});
});

describe("攻略組 - 版本與模組查詢", () => {
	it("GetVer 依頻道回傳版本", () => {
		assert.equal(myKiritoC.GetVer(...oldChannel), "old");
		assert.equal(myKiritoC.GetVer(...newChannel), "new");
		assert.equal(myKiritoC.GetVer("其他群組", "其他頻道"), undefined);
	});

	it("GetRequests 只拿到該版本的模組", () => {
		const names = (ver) =>
			myKiritoC.GetRequests(ver).map((request) => request.data.name);

		assert.deepEqual(names("old").sort(), ["情報", "樓層", "轉生點"].sort());
		assert.deepEqual(names("new").sort(), ["情報", "樓層"].sort());
	});

	it("GetRequest 同名指令會拿到該版本的那一支", () => {
		assert.equal(myKiritoC.GetRequest("old", "樓層").url, "bosses.json");
		assert.equal(myKiritoC.GetRequest("new", "樓層").ver, "new");
		assert.equal(myKiritoC.GetRequest("old", "不存在的指令"), undefined);
	});
});

describe("攻略組 - 菜單流程", () => {
	before(async () => {
		// 經典服拿真實格式的資料，embed 才組得起來
		const bosses = require("../manager/mykiritoManager/myKiritoData/bosses.json");
		const skills = require("../manager/mykiritoManager/myKiritoData/skills.json");
		mock.method(axios, "get", async (url) => ({
			data: url === process.env.GASURL_NEW_BOSSES ? bosses : skills,
		}));
		await myKiritoC.DownloadData();
		mock.restoreAll();

		// 菜單與按鈕都要註冊，選單分派與 embed 上的按鈕才拿得到
		await selectMenuM.InsertSelectMenu(BDB.CGetClient());
		await buttonM.InsertButton(BDB.CGetClient());
	});

	it("只輸入攻略組，用選單列出該頻道可用的指令", async () => {
		const msg = newFakeMessage(...oldChannel);
		await myKiritoC.Start(msg, undefined, []);

		const menu = getMenu(msg.sent[0]);
		assert.equal(menu.custom_id, "mykirito");
		assert.deepEqual(
			menu.options.map((option) => option.value).sort(),
			["情報", "樓層", "轉生點"].sort()
		);
		// 每個選項都要說明這個指令的效果
		assert.ok(menu.options.every((option) => option.description));
	});

	it("經典服頻道的指令選單不會出現舊服才有的轉生點", async () => {
		const msg = newFakeMessage(...newChannel);
		await myKiritoC.Start(msg, undefined, []);

		assert.deepEqual(
			getMenu(msg.sent[0]).options.map((option) => option.value).sort(),
			["情報", "樓層"].sort()
		);
	});

	it("輸入攻略組 {指令} 顯示指令效果並列出可查詢的目標", async () => {
		const msg = newFakeMessage(...oldChannel);
		await myKiritoC.Start(msg, "情報", []);

		assert.match(msg.sent[0].content, /語法: 攻略組 情報 {角色名稱}/);
		assert.match(msg.sent[0].content, /根據角色名稱，反饋此角色已記錄技能與簡介/);

		const menu = getMenu(msg.sent[0]);
		assert.equal(menu.custom_id, "mykiritoTarget");
		assert.ok(menu.options.length <= 25);
		assert.equal(
			selectMenuC.ParsePagedValue(menu.options[0].value).group,
			"情報"
		);
	});

	it("從指令選單選一個指令，原訊息換成該指令的目標選單", async () => {
		const interaction = newFakeInteraction("mykirito", "樓層", ...oldChannel);
		await selectMenuM.Start(interaction);

		assert.equal(interaction.updated.length, 1, "應該更新原本的訊息");
		assert.match(interaction.updated[0].content, /語法: 攻略組 樓層/);
		assert.equal(getMenu(interaction.updated[0]).custom_id, "mykiritoTarget");
	});

	it("選到換頁選項時只換頁，不會送出資料", async () => {
		const interaction = newFakeInteraction(
			"mykiritoTarget",
			"情報|#page:1",
			...oldChannel
		);
		await selectMenuM.Start(interaction);

		assert.equal(getMenu(interaction.updated[0]).placeholder, "情報 (2/5)");
		assert.equal(interaction.sent.length, 0);
	});

	it("選到目標時確認互動並輸出原本的 embed", async () => {
		const interaction = newFakeInteraction(
			"mykiritoTarget",
			"情報|桐人",
			...oldChannel
		);
		await selectMenuM.Start(interaction);

		assert.equal(interaction.deferred.length, 1, "沒有確認互動 discord 會顯示失敗");
		assert.equal(interaction.updated.length, 0, "選單訊息應該原封不動");
		assert.equal(
			interaction.sent[0].embeds[0].toJSON().author.name,
			"桐人",
			"embed 呈現方式維持原狀"
		);
	});

	it("經典服頻道的選單走經典服資料", async () => {
		const interaction = newFakeInteraction(
			"mykiritoTarget",
			"樓層|1F",
			...newChannel
		);
		await selectMenuM.Start(interaction);

		assert.equal(interaction.sent[0].embeds[0].toJSON().author.name, "1F");
	});

	it("頻道沒有權限時菜單不會有任何反應", async () => {
		const interaction = newFakeInteraction(
			"mykiritoTarget",
			"情報|桐人",
			"其他群組",
			"其他頻道"
		);
		await selectMenuM.Start(interaction);

		assert.equal(interaction.sent.length, 0);
		assert.equal(interaction.updated.length, 0);
		assert.equal(interaction.deferred.length, 0);
	});
});

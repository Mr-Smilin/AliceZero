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

const myKiritoC = require("../manager/mykiritoManager/myKiritoC.js");

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

	it("舊服頻道查不到的樓層會回覆使用說明", async () => {
		const msg = newFakeMessage(...oldChannel);
		await myKiritoC.Start(msg, "樓層", ["不存在的樓層"]);

		assert.match(msg.sent[0], /語法:攻略組 樓層/);
	});

	it("經典服頻道走的是經典服資料", async () => {
		const msg = newFakeMessage(...newChannel);
		await myKiritoC.Start(msg, "樓層", ["1F"]);

		// 經典服資料是測試餵進去的假資料，查不到 1F 時會回覆使用說明
		assert.equal(msg.sent.length, 1);
		assert.match(msg.sent[0], /語法:攻略組 樓層/);
	});

	it("非白名單頻道只會收到關服訊息", async () => {
		const msg = newFakeMessage("其他群組", "其他頻道");
		await myKiritoC.Start(msg, "樓層", ["1F"]);

		assert.equal(msg.sent.length, 1);
		assert.match(msg.sent[0], /已關服|從來都沒存在過/);
	});
});

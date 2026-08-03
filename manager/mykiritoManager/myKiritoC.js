//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const fs = require("node:fs"); // 用於讀寫檔案
const path = require("node:path"); // 用於處理路徑
const axios = require("axios");
const CatchF = require("../../baseJS/CatchF.js");
const componentM = require("../componentManager/componentM.js");
require("dotenv").config();
// json
//#endregion

// 本地資料夾，存放已停止更新的舊版(ver: old)資料
const dataPath = path.join(__dirname, "myKiritoData");
// 查詢模組資料夾，一個檔案代表一個攻略組指令
const requestsPath = path.join(__dirname, "requests");

/** 讀取所有查詢模組 */
const getRequests = () => {
	return fs
		.readdirSync(requestsPath)
		.filter((file) => file.endsWith(".js"))
		.map((file) => require(path.join(requestsPath, file)));
};

const selectMethod = async (url, method, body = {}) => {
	switch (method) {
		case "GET":
			return await axios.get(url);
		case "POST":
			return await axios.post(url, body);
	}
};

/** 向 api 取得資料(ver: new 使用)
 *
 * @param {string} url api 位址
 * @param {string} method GET | POST
 */
const getData = async (url, method = "GET") => {
	try {
		const response = await selectMethod(url, method);
		return response.data;
	} catch (err) {
		CatchF.ErrorDo(err, "下載檔案時發生異常");
		throw new Error(err);
	}
};

/** 讀取本地資料(ver: old 使用)
 *
 * @param {string} fileName myKiritoData 資料夾內的檔名
 */
const readData = (fileName) => {
	try {
		return JSON.parse(
			fs.readFileSync(path.join(dataPath, fileName), "utf8"),
		);
	} catch (err) {
		CatchF.ErrorDo(err, "讀取本地檔案時發生異常");
		throw new Error(err);
	}
};

exports.CheckData = () => {
	try {
		// 舊版資料已停止更新，改讀本地 json，只有經典服(ver: new)需要 api 位址
		return (
			!!process.env.GASURL_NEW_SKILLS && !!process.env.GASURL_NEW_BOSSES
		);
	} catch (err) {
		CatchF.ErrorDo(err, "檢查 mykirito .env 資料時發生異常!");
		return false;
	}
};

exports.DownloadData = async () => {
	try {
		CatchF.LogDo("Started Dowload myKirito Data");

		// 依 ver 決定資料來源，取得後交由各模組的 callback 存進 global
		for (const request of getRequests()) {
			// url 對 ver: old 而言是 myKiritoData 內的檔名，對 ver: new 而言是 api 位址
			if ("url" in request) {
				const data =
					request?.ver === "old"
						? readData(request.url)
						: await getData(request.url, request.method);
				await request?.callback?.(data);
			} else {
				CatchF.LogDo(
					`[警告] ${request?.data?.name} 指令缺少必要的 "url" 屬性。`,
				);
			}
		}
		global.isMykirito = true;
		CatchF.LogDo("Successfully Dowload myKirito Data");
	} catch (err) {
		CatchF.ErrorDo(err, "myKirito 資料下載失敗!");
	}
};

exports.IsOk = () => {
	return global.isMykirito;
};

/** 判斷這個頻道能用哪個版本的攻略組
 *
 * @returns {string} "old" = 舊服 | "new" = 經典服 | undefined = 不開放
 */
exports.GetVer = (guildId = null, channelId = null) => {
	if (checkChannel(guildId, channelId)) return "old";
	if (checkChannelForNewMyKirito(guildId, channelId)) return "new";
	return undefined;
};

/** 取得該版本的所有查詢模組
 *
 * @param {string} ver "old" | "new"
 */
exports.GetRequests = (ver) => {
	try {
		return getRequests().filter((request) => request?.ver === ver);
	} catch (err) {
		CatchF.ErrorDo(err, "GetRequests 方法異常!");
		return [];
	}
};

/** 取得該版本的指定查詢模組
 *
 * @param {string} ver "old" | "new"
 * @param {string} name 指令名稱，Ex: 樓層
 */
exports.GetRequest = (ver, name) =>
	this.GetRequests(ver).find((request) => request?.data?.name === name);

/** 取得該頻道版本的指令資料
 *  按鈕、菜單這類事後互動用的，資料要跟著發問的頻道走，不能寫死版本
 * @param {*} discordObject message 或 interaction
 * @param {string} name 指令名稱，Ex: 情報
 */
exports.GetData = (discordObject, name) =>
	this.GetRequest(
		this.GetVer(discordObject?.guild?.id, discordObject?.channel?.id),
		name,
	)?.getData();

exports.Start = async (msg, cmd, args) => {
	const ver = this.GetVer(msg.guild?.id, msg.channel?.id);

	// 不開放的頻道
	if (ver === undefined) {
		await BDB.MSend(
			msg,
			probabilityGate()
				? "其實Mykirito從來都沒存在過，只是網友的臆想"
				: "2024/11/07 14:55(JST) 已關服",
		);
		return;
	}

	// 沒有指定指令，用菜單列出這個頻道查得到的指令
	if (!cmd) {
		await BDB.MSend(msg, componentM.GetMyKiritoCommandMessage(this.GetRequests(ver)));
		return;
	}

	await this.GetRequest(ver, cmd)?.execute(msg, cmd, args);
};

/**
 * 機率邏輯閥 - 回傳 true 代表觸發 A 結果 (1% 機率)，false 代表觸發 B 結果 (99% 機率)
 * @returns {boolean} 是否觸發 A 結果
 */
function probabilityGate() {
	// 產生 0-1 之間的隨機數
	const random = Math.random();

	// 如果隨機數小於 0.01 (1%)，則觸發 A 結果
	return random < 0.01;
}

/**
 * 只有在特定頻道開啟該功能
 */
function checkChannel(guildId = null, channelId = null) {
	// 定義允許使用該功能的伺服器 ID
	const allowedGuildId = ["716213468394553396"];
	// 定義允許使用該功能的頻道 ID
	const allowedChannels = ["815932181566324756"];

	return (
		allowedGuildId.includes(guildId) && allowedChannels.includes(channelId)
	);
}

/**
 * 只有在特定頻道開啟該經典服功能
 */
function checkChannelForNewMyKirito(guildId = null, channelId = null) {
	// 定義允許使用該功能的伺服器 ID
	const allowedGuildId = ["716213468394553396"];
	// 定義允許使用該功能的頻道 ID
	const allowedChannels = ["1532687389150019595"];

	return (
		allowedGuildId.includes(guildId) && allowedChannels.includes(channelId)
	);
}


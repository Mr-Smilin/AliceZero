//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const fs = require("node:fs"); // 用於讀寫檔案
const path = require("node:path"); // 用於處理路徑
const axios = require("axios");
const CatchF = require("../../baseJS/CatchF.js");
require("dotenv").config();
// json
//#endregion

// 本地資料夾，存放已停止更新的舊版(ver: old)資料
const dataPath = path.join(__dirname, "myKiritoData");

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
		// 讀取 commands 資料夾下的 js 檔案
		const requestsPath = path.join(__dirname, "requests");
		const requestFiles = fs
			.readdirSync(requestsPath)
			.filter((file) => file.endsWith(".js"));

		// 依 ver 決定資料來源，取得後交由各模組的 callback 存進 global
		for (const file of requestFiles) {
			const filePath = path.join(requestsPath, file);
			const request = require(filePath);

			// url 對 ver: old 而言是 myKiritoData 內的檔名，對 ver: new 而言是 api 位址
			if ("url" in request) {
				const data =
					request?.ver === "old"
						? readData(request.url)
						: await getData(request.url, request.method);
				await request?.callback?.(data);
			} else {
				CatchF.LogDo(`[警告] ${filePath} 中的指令缺少必要的 "url" 屬性。`);
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

exports.Start = async (msg, cmd, args) => {
	// 讀取 commands 資料夾下的 js 檔案
	const requestsPath = path.join(__dirname, "requests");
	const requestFiles = fs
		.readdirSync(requestsPath)
		.filter((file) => file.endsWith(".js"));

	if (checkChannel(msg.guild?.id, msg.channel?.id)) {
		await sendRequestForFile(msg, cmd, args, requestsPath, requestFiles, "old");
	} else if (checkChannelForNewMyKirito(msg.guild?.id, msg.channel?.id)) {
		await sendRequestForFile(msg, cmd, args, requestsPath, requestFiles, "new");
	} else if (probabilityGate()) {
		await BDB.MSend(msg, "其實Mykirito從來都沒存在過，只是網友的臆想");
	} else {
		await BDB.MSend(msg, "2024/11/07 14:55(JST) 已關服");
	}

	// for (const file of requestFiles) {
	// 	const filePath = path.join(requestsPath, file);
	// 	const request = require(filePath);

	// 	if (request.data.name === cmd) {
	// 		await request.execute(msg, cmd, args);
	// 		break;
	// 	}
	// }
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

async function sendRequestForFile(
	msg,
	cmd,
	args,
	requestsPath,
	requestFiles,
	ver = "old",
) {
	for (const file of requestFiles) {
		const filePath = path.join(requestsPath, file);
		const request = require(filePath);

		if (request.data.name === cmd && request?.ver === ver) {
			await request.execute(msg, cmd, args);
			break;
		}
	}
}

//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("./baseJS/BaseDiscordBot.js");
// js
const CatchF = require("./baseJS/CatchF.js");
const slashM = require("./manager/slashManager/slashM.js");
const messageM = require("./manager/messageManager/messageM.js");
const messageUpdateM = require("./manager/messageManager/messageUpdateM.js");
const buttonM = require("./manager/buttonManager/buttonM.js");
const selectMenuM = require("./manager/selectMenuManager/selectMenuM.js");
const myKiritoM = require("./manager/mykiritoManager/myKiritoM.js");
// json
const configJson = require("./baseJS/Config.json");
// 健康狀態
const cornTask = require("./baseJS/CronTask.js");
require("./baseJS/HealthCheck.js").start();
//#endregion

//#region 參數

//#region 音樂模組相關

global.isPlaying = new Map(); // 是否正在播放音樂
/**
 * let listData = {
			id: musicId,
			name: musicName,
			url: musicUrl
		};
 */
global.songList = new Map(); // 歌單
global.connection = new Map(); // https://discord.js.org/#/docs/voice/main/class/VoiceConnection
global.dispatcher = new Map(); // https://discord.js.org/#/docs/voice/main/class/AudioPlayer

//#endregion

//#region myKirito 相關

// 如果沒辦法下載資料就不會提供攻略組功能
global.isMykirito = false;
// 轉生點
global.mkLevel = undefined;
// 角色情報
global.mkSkill = undefined;
// 樓層
global.mkBoss = undefined;
// 掃地
// global.ninePeople = new Map();
//#endregion

//#endregion

//#region Discord宣告
//#region 基本行為
let client;
DoStart();
async function DoStart() {
	client = await BDB.Login(process.env.TOKEN);
	BDB.On(client, "ready", DiscordReady);
	BDB.On(client, "message", messageM.Start);
	// BDB.On(client, "messageUpdate", messageUpdateM.Start);
	BDB.On(client, "slash", slashM.Start);
	BDB.On(client, "button", buttonM.Start);
	BDB.On(client, "selectMenu", selectMenuM.Start);
}
//#endregion
//#region 基本方法
async function DiscordReady(client) {
	// 定時自我呼叫
	callMyself();
	initGlobal();
	// 註冊斜線命令
	await slashM.InsertSlash(client);
	// 刪除艾恩葛朗特的斜線命令
	await slashM.DeleteSAOSlash(client);
	// 綁定菜單命令
	await selectMenuM.InsertSelectMenu(client);
	// 綁定按鈕命令
	await buttonM.InsertButton(client);
	// 下載攻略組資料
	await myKiritoM.DoInsertMyKirito(client);
	// 設定狀態消息
	BDB.CSetStatus(configJson?.status);
	// 系統訊息
	CatchF.LogDo(`Logged in as ${client.user.tag}!`);
}

//#endregion
//#endregion

//#region 其餘宣告

function callMyself() {
	global.cornTask = cornTask.cronCallMysell();
	CatchF.LogDo("Start cronCallMysell");
}

function initGlobal() {
	global.isPlaying = new Map(); // 是否正在播放音樂
	global.songList = new Map(); // 歌單
	global.connection = new Map(); // https://discord.js.org/#/docs/voice/main/class/VoiceConnection
	global.dispatcher = new Map(); // https://discord.js.org/#/docs/voice/main/class/AudioPlayer
	global.isMykirito = false;
	// 轉生點
	global.mkLevel = undefined;
	// 角色情報
	global.mkSkill = undefined;
	// 樓層
	global.mkBoss = undefined;
	// 掃地
	// global.ninePeople = new Map();
}

exports.ResetGlobal = async (client) => {
	await DiscordReady(client);
};

//#endregion

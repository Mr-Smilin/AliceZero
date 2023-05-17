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
const dataBaseM = require('./manager/dataBaseManager/dataBaseM.js');
//#endregion

//#region 參數
global.songList = new Map(); // 歌單
global.songInfo = new Map(); // 歌曲資訊
global.songLoop = new Map(); // 循環開關 0 = 不循環 1 = 單曲循環 2 = 歌單循環
//#endregion

//#region Discord宣告
//#region 基本行為
let client;
DoStart();
async function DoStart() {
	client = await BDB.Login(process.env.TOKEN);
	BDB.On(client, "ready", DiscordReady);
	BDB.On(client, "message", messageM.Start);
	BDB.On(client, "messageUpdate", messageUpdateM.Start);
	BDB.On(client, "slash", slashM.Start);
	BDB.On(client, "button", buttonM.Start);
	BDB.On(client, "selectMenu", selectMenuM.Start);
}
//#endregion
//#region 基本方法
async function DiscordReady() {

	// 系統訊息
	console.log(`Logged in as ${client.user.tag}!`);
	// 註冊協槓命令
	CatchF.LogDo("Started refreshing application (/) commands.");
	slashM.InsertSlash();
	CatchF.LogDo("Successfully reloaded application (/) commands.");
}

//#endregion
//#endregion

//#region 其餘宣告
async function getDBData() {

}
//#endregion

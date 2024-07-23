//#region import
// 載入env變量
require("dotenv").config();
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const fs = require("node:fs"); // 用於讀寫檔案
const path = require("node:path"); // 用於處理路徑
const CatchF = require("../../baseJS/CatchF.js");
// json
//#endregion

exports.Start = async (interaction) => {
	if (!BDB.IIsContext(interaction)) return;
	if (BDB.IIsBot(interaction)) return;
};

exports.InsertSlash = async (client) => {
	// const data = new BDB.
};

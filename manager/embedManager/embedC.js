//#region import
// 載入env變量
require("dotenv").config();
const { disableValidators } = require("discord.js");
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
// json
const messagePrefix = require("../messageManager/messagePrefix.json");
// constants
const color = "#fbfbc9";
const title = "A.L.I.C.E.";
const Author = "アリス・ツーベルク";
const Author2 = "https://i.imgur.com/crrk7I2.png";
const Author3 = "https://home.gamer.com.tw/homeindex.php";
const Description = "人工高適應性知性自律存在";
const Thumbnail = "https://i.imgur.com/5ffD6du.png";
const Field = "小愛#0143";
const Field2 = "主人您好，請問有何吩咐?";
//07群的都是變態484
//Season生日快樂٩(｡・ω・｡)﻿و
//DeasonDio生日快樂٩(｡・ω・｡)﻿و
const footerText = "當前版本v14.10.0";
const footerPicture = "https://i.imgur.com/crrk7I2.png";
//#endregion

exports.HelpMessage = () => {
	const embedMessage = baseEmbed();
	embedMessage
		.EAddField(
			"自我檢測執行..",
			" 🔨 版本復原進度 20%\n 🎧 音樂系統 ✅\n 🍻 派對指令 ❌\n ⚔️ mykirito系統 ✅\n ... \n ...\n ☄️ 隱藏功能 ✅ ✅"
		)
		.EAddField(
			"模組加載完畢，請根據需求選擇對應系統說明",
			"主人您好，請問有何吩咐?",
			true
		);
	return embedMessage;
};

exports.MusicMessage = () => {
	const embedMessage = baseEmbed();
	embedMessage.EAddField("音樂指令~", "點擊按鈕可以看到詳細說明喔!");
	embedMessage.EAddField("指令一覽", `\`點歌\` - Add\n\`插播\` - Insert\n\`暫停\` - Pause\n\`恢復\` - Resume\n\`跳過\` - Skip\n\`歌單\` - NowQueue\n\`休息\` - Sleep`);
	return embedMessage;
};

//▬▬▬▬▬▬▬▬▬🔘▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// function streamString(songLength, nowSongLength) {
// 	let mainText = '🔘';
// 	const secondText = '▬';
// 	const whereMain = Math.floor((nowSongLength / songLength) * 100);
// 	let message = '';
// 	for (i = 1; i <= 30; i++) {
// 		if (i * 3.3 + 1 >= whereMain) {
// 			message = message + mainText;
// 			mainText = secondText;
// 		} else {
// 			message = message + secondText;
// 		}
// 	}
// 	return message;
// }

/**
 * 
 * @param {*} helpNumber 0 = 播放 1 = 插播 2 = 暫停 3 = 恢復 4 = 跳過 5 = 歌單 6 = 休息 
 * @returns 
 */
exports.HelpMusicMessage = (helpNumber) => {
	const embedMessage = baseEmbed();
	// 從 messagePrefix 找出 id = 1 = 音樂指令 的元素
	const musicPrefix = messagePrefix.find(e => e?.Id === "1");
	switch (helpNumber) {
		case 0:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} {網址}`);
			embedMessage.EAddField("斜線指令", `2`);
			break;
		case 1:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} i {網址}`);
			embedMessage.EAddField("斜線指令", `3`);
			break;
		case 2:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} p`);
			embedMessage.EAddField("斜線指令", `4`);
			break;
		case 3:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} rp`);
			embedMessage.EAddField("斜線指令", `5`);
			break;
		case 4:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} s`);
			embedMessage.EAddField("斜線指令", `6`);
			break;
		case 5:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} np`);
			embedMessage.EAddField("斜線指令", `7`);
			break;
		case 6:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} sp`);
			embedMessage.EAddField("斜線指令", `8`);
			break;
	}
	return embedMessage;
}

function baseEmbed() {
	const embedMessage = BDB.ENewEmbed();
	embedMessage
		.ESetColor(color)
		.ESetAuthor(Author, Author2, Author3)
		.ESetTitle(title)
		.ESetAuthor(Author, Author2, Author3)
		.ESetDescription(Description)
		.ESetThumbnail(Thumbnail)
		.ESetTimestamp()
		.ESetFooter(footerText, footerPicture);
	return embedMessage;
}

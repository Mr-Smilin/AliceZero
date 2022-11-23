//#region import
// 載入env變量
require("dotenv").config();
const { disableValidators } = require("discord.js");
// Discord
const BDB = require("../baseJS/BaseDiscordBot.js");
// js
// json
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
const footerText = "當前版本v14.0.1";
const footerPicture = "https://i.imgur.com/crrk7I2.png";
//#endregion

exports.HelpMessage = () => {
	const embedMessage = baseEmbed();
	embedMessage
		.EAddField(
			"自我檢測執行..",
			"🎧 音樂系統 ✅\n 🍻 派對指令 ✅\n ⚔️ mykirito系統 ✅\n ... \n ...\n ☄️ 隱藏功能 ✅ ✅"
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
	embedMessage.EAddField("test", "test2");
	return embedMessage;
};

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

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
//07群的都是變態484
//Season生日快樂٩(｡・ω・｡)﻿و
//DeasonDio生日快樂٩(｡・ω・｡)﻿و
const footerText = "當前版本b14.11.0";
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
	embedMessage.EAddField("指令一覽", `\`點歌\` - Play\n\`插播\` - Insert\n\`暫停\` - Pause\n\`恢復\` - Resume\n\`跳過\` - Skip\n\`歌單\` - NowQueue\n\`休息\` - Sleep`);
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
	const command = BDB.CGetCommand(0)?.get("m");
	switch (helpNumber) {
		case 0:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} {網址}`);
			embedMessage.EAddField("斜線指令", `/${command?.data?.name} ${command?.subcommand?.play?.data?.name} {網址}`);
			break;
		case 1:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} i {網址}`);
			embedMessage.EAddField("斜線指令", `/${command?.data?.name} ${command?.subcommand?.insert?.data?.name} {網址}`);
			break;
		case 2:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} p`);
			embedMessage.EAddField("斜線指令", `/${command?.data?.name} ${command?.subcommand?.pause?.data?.name}`);
			break;
		case 3:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} rp`);
			embedMessage.EAddField("斜線指令", `/${command?.data?.name} ${command?.subcommand?.resume?.data?.name}`);
			break;
		case 4:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} s`);
			embedMessage.EAddField("斜線指令", `/${command?.data?.name} ${command?.subcommand?.skip?.data?.name}`);
			break;
		case 5:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} np`);
			embedMessage.EAddField("斜線指令", `/${command?.data?.name} ${command?.subcommand?.nowqueue?.data?.name}`);
			break;
		case 6:
			embedMessage.EAddField("文字指令", `${musicPrefix?.Value} sp`);
			embedMessage.EAddField("斜線指令", `/${command?.data?.name} ${command?.subcommand?.sleep?.data?.name}`);
			break;
	}
	return embedMessage;
}

exports.MykiritoSkillMessage = (roleData) => {
	const embedMessage = baseEmbed({
		Author: roleData?.name,
		title: "獲得方式",
		Description: roleData?.data?.getData,
		Thumbnail: roleData?.data?.authorImg
	});

	// 備註 & 角色頻道
	if (roleData?.data?.backUp !== "" && roleData?.data?.dcUrl !== "")
		embedMessage.EAddField("備註", roleData?.data?.backUp, true).EAddField("角色頻道", roleData?.data?.dcUrl, true);
	else if (roleData?.data?.backUp !== "")
		embedMessage.EAddField("備註", roleData?.data?.backUp);
	else if (roleData?.data?.dcUrl !== "")
		embedMessage.EAddField("角色頻道", roleData?.data?.dcUrl);

	embedMessage.EAddEmptyField();

	for (i = 1; i <= 10; i++) {
		if (roleData?.data[`skill${i}`] === "")
			break;
		else {
			embedMessage.EAddField(roleData?.data[`skill${i}`], roleData?.data[`task${i}`], true);
		}
	}

	return embedMessage;
}

function baseEmbed({
	color = "#fbfbc9",
	title = "A.L.I.C.E.",
	Author = "アリス・ツーベルク",
	Author2 = "https://i.imgur.com/crrk7I2.png",
	Author3 = "https://smilin.net",
	Description = "人工高適應性知性自律存在",
	Thumbnail = "https://i.imgur.com/5ffD6du.png",
}) {
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

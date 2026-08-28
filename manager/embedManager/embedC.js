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
const configJson = require("../../baseJS/Config.json");
// constants
//07群的都是變態484
//Season生日快樂٩(｡・ω・｡)﻿و
//DeasonDio生日快樂٩(｡・ω・｡)﻿و
const footerText = `當前版本 v${configJson?.version}`;
const footerPicture = "https://i.imgur.com/crrk7I2.png";
// 隱藏功能
// 掃地
//#endregion

exports.HelpMessage = () => {
	const embedMessage = baseEmbed();
	// ✅ ❌
	embedMessage
		.EAddField(
			"自我檢測執行..",
			" 🔨 版本復原進度 75%\n 🎧 音樂系統 ✅\n 🍻 派對系統(開發中) 🛠️\n ⚔️ mykirito系統 ✅\n ... \n ...\n ☄️ 隱藏功能 ✅",
		)
		.EAddField(
			"模組加載完畢，請根據需求選擇對應系統說明",
			"主人您好，請問有何吩咐?",
			true,
		);
	return embedMessage;
};

exports.MusicHelpMessage = () => {
	const embedMessage = baseEmbed();
	embedMessage
		.EAddField("音樂指令~", "點擊按鈕可以看到詳細說明喔!")
		.EAddField(
			"指令一覽",
			"`點歌` - Play\n" +
				"`插播` - Insert\n" +
				"`暫停` - Pause\n" +
				"`恢復` - Resume\n" +
				"`跳過` - Skip\n" +
				"`歌單` - NowQueue\n" +
				"`休息` - Sleep",
		);
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

exports.MykiritoHelpMessage = () => {
	const embedMessage = baseEmbed();
	embedMessage
		.EAddField("https://mykirito.com", "夢開始的遊戲，創造出小愛的地方！")
		.EAddEmptyField()
		.EAddField("攻略組指令", "歡迎聯絡作者，投稿新資料")
		.EAddField(
			"指令一覽 - {} 為必填 [] 為選填",
			"`攻略組 轉生點` {等級} [範圍]\n" +
				"`攻略組 情報` {角色名稱}\n" +
				"`攻略組 樓層` {層數}\n",
		);
	return embedMessage;
};

/**
 *
 * @param {*} helpNumber 0 = 播放 1 = 插播 2 = 暫停 3 = 恢復 4 = 跳過 5 = 歌單 6 = 休息
 * @returns
 */
exports.HelpMusicMessage = (helpNumber) => {
	const embedMessage = baseEmbed();
	// 從 messagePrefix 找出 id = 1 = 音樂指令 的元素
	const prefix = messagePrefix.find((e) => e?.Id === "1");
	const command = BDB.CGetCommand(0)?.get("m");
	switch (helpNumber) {
		case 0:
			embedMessage.EAddField("文字指令", `${prefix?.Value} {網址}`);
			embedMessage.EAddField(
				"斜線指令",
				`/${command?.data?.name} ${command?.subcommand?.play?.data?.name} {網址}`,
			);
			break;
		case 1:
			embedMessage.EAddField("文字指令", `${prefix?.Value} i {網址}`);
			embedMessage.EAddField(
				"斜線指令",
				`/${command?.data?.name} ${command?.subcommand?.insert?.data?.name} {網址}`,
			);
			break;
		case 2:
			embedMessage.EAddField("文字指令", `${prefix?.Value} p`);
			embedMessage.EAddField(
				"斜線指令",
				`/${command?.data?.name} ${command?.subcommand?.pause?.data?.name}`,
			);
			break;
		case 3:
			embedMessage.EAddField("文字指令", `${prefix?.Value} rp`);
			embedMessage.EAddField(
				"斜線指令",
				`/${command?.data?.name} ${command?.subcommand?.resume?.data?.name}`,
			);
			break;
		case 4:
			embedMessage.EAddField("文字指令", `${prefix?.Value} s`);
			embedMessage.EAddField(
				"斜線指令",
				`/${command?.data?.name} ${command?.subcommand?.skip?.data?.name}`,
			);
			break;
		case 5:
			embedMessage.EAddField("文字指令", `${prefix?.Value} np`);
			embedMessage.EAddField(
				"斜線指令",
				`/${command?.data?.name} ${command?.subcommand?.nowqueue?.data?.name}`,
			);
			break;
		case 6:
			embedMessage.EAddField("文字指令", `${prefix?.Value} sp`);
			embedMessage.EAddField(
				"斜線指令",
				`/${command?.data?.name} ${command?.subcommand?.sleep?.data?.name}`,
			);
			break;
	}
	return embedMessage;
};

exports.MykiritoSkillMessage = (roleData, status) => {
	const embedMessage = baseEmbed({
		Author: roleData?.name,
		title: "獲得方式",
		Description: roleData?.data?.getData,
		Thumbnail: roleData?.data?.authorImg,
	});

	// 備註 & 角色頻道
	if (roleData?.data?.backUp !== "" && roleData?.data?.dcUrl !== "")
		embedMessage
			.EAddField("備註", roleData?.data?.backUp, true)
			.EAddField("角色頻道", roleData?.data?.dcUrl, true);
	else if (roleData?.data?.backUp !== "")
		embedMessage.EAddField("備註", roleData?.data?.backUp);
	else if (roleData?.data?.dcUrl !== "")
		embedMessage.EAddField("角色頻道", roleData?.data?.dcUrl);

	embedMessage.EAddEmptyField();

	switch (status) {
		// 技能
		case 0:
			for (let i = 1; i <= 20; i++) {
				if (roleData?.data[`skill${i}`] === "") break;
				else
					embedMessage.EAddField(
						roleData?.data[`skill${i}`],
						roleData?.data[`task${i}`],
						true,
					);
			}
			break;
		// 身體素質
		case 1:
			embedMessage
				.EAddField("HP", "" + addMykiritoField(roleData?.data?.state1))
				.EAddField("攻擊", "" + addMykiritoField(roleData?.data?.state2), true)
				.EAddField("防禦", "" + addMykiritoField(roleData?.data?.state3), true)
				.EAddField("體力", "" + addMykiritoField(roleData?.data?.state4), true)
				.EAddField("敏捷", "" + addMykiritoField(roleData?.data?.state5), true)
				.EAddField(
					"反應速度",
					"" + addMykiritoField(roleData?.data?.state6),
					true,
				)
				.EAddField("技巧", "" + addMykiritoField(roleData?.data?.state7), true)
				.EAddField("智力", "" + addMykiritoField(roleData?.data?.state8), true)
				.EAddField("幸運", "" + addMykiritoField(roleData?.data?.state9), true)
				.EAddEmptyField(true);
			break;
		// 稱號
		case 2:
			embedMessage.EAddField(
				"初始稱號",
				addMykiritoField(roleData?.data?.nickname1),
			);
			for (let i = 2; i <= 7; i++) {
				if (roleData?.data[`nickname${i}`] === "") break;
				else {
					embedMessage
						.EAddField(
							roleData?.data[`nickname${i}`],
							roleData?.data[`nicknameQuest${i}`],
							true,
						)
						.EAddField("效果", roleData?.data[`nicknameData${i}`], true)
						.EAddEmptyField();
					if (roleData?.data[`nicknamePic${i}`] !== "")
						embedMessage.ESetThumbnail(roleData?.data[`nicknamePic${i}`]);
				}
			}
			break;
	}

	return embedMessage;
};

exports.MyKiritoBossMessage = (bossData) => {
	const embedMessage = baseEmbed({
		Author: bossData?.floor,
		title: "Boss資訊",
		Description: bossData?.data?.name,
		Thumbnail: bossData?.data?.authorImg,
	});

	// 素質
	embedMessage
		.EAddField("HP", addMykiritoField("" + bossData?.data?.hp))
		.EAddField("攻擊", addMykiritoField("" + bossData?.data?.atk), true)
		.EAddField("防禦", addMykiritoField("" + bossData?.data?.def), true)
		.EAddField("體力", addMykiritoField("" + bossData?.data?.vit), true)
		.EAddField("敏捷", addMykiritoField("" + bossData?.data?.agi), true)
		.EAddField("反應速度", addMykiritoField("" + bossData?.data?.agi2), true)
		.EAddField("技巧", addMykiritoField("" + bossData?.data?.agi3), true)
		.EAddField("智力", addMykiritoField("" + bossData?.data?.mAtk), true)
		.EAddField("幸運", addMykiritoField("" + bossData?.data?.dex), true);

	if (bossData?.data?.backUp !== "")
		embedMessage.EAddField("備註", "" + bossData?.data?.backUp, true);
	else embedMessage.EAddEmptyField(true);

	embedMessage.EAddEmptyField();

	// 技能
	for (let i = 1; i <= 10; i++) {
		if (bossData?.data[`skill${i}`] === "") break;
		else
			embedMessage.EAddField(
				bossData?.data[`skill${i}`],
				bossData?.data[`task${i}`],
				true,
			);
	}

	embedMessage.EAddEmptyField();

	embedMessage
		.EAddField(
			"推薦攻略等級",
			addMykiritoField("" + bossData?.data?.LvCan),
			true,
		)
		.EAddField(
			"推薦攻略角色",
			addMykiritoField("" + bossData?.data?.AuthorCan),
			true,
		)
		.EAddField(
			"不推薦攻略角色",
			addMykiritoField("" + bossData?.data?.AuthorCant),
			true,
		);

	return embedMessage;
};

exports.TrpgHelpMessage = () => {
	const embedMessage = baseEmbed();
	embedMessage
		.EAddField("派對指令~", "點擊按鈕可以看到詳細說明喔!")
		.EAddField("指令一覽", "`骰子` - Dice\n" + "`排序` - Sort(未實裝)");
	return embedMessage;
};

/**
 *
 * @param {*} helpNumber 0 = 骰子 1 = 排序
 * @returns
 */
exports.HelpTrpgMessage = (helpNumber) => {
	const embedMessage = baseEmbed();
	// 從 messagePrefix 找出 id = 3 = 派對指令 的元素
	const prefix = messagePrefix.find((e) => e?.Id === "3");
	// const command = BDB.CGetCommand(0)?.get("m");
	switch (helpNumber) {
		case 0:
			embedMessage
				.EAddField("文字指令", `${prefix?.Value} d {骰目} [次數]`)
				.EAddField("斜線指令", `開發中`)
				.EAddField(
					"`骰目` - 必填",
					`輸入任意數進行擲骰，可接受如 2D12 & 3B12>6 等格式`,
					true,
				)
				.EAddField("`次數` - 選填", `預設1次，指定整個擲骰行為要做幾次`, true);
			// embedMessage.EAddField("斜線指令", `/${command?.data?.name} ${command?.subcommand?.play?.data?.name} {網址}`);
			break;
		case 1:
			// embedMessage.EAddField("文字指令", `${prefix?.Value} i {網址}`);
			embedMessage.EAddField("文字指令", `開發中`);
			embedMessage.EAddField("斜線指令", `開發中`);
			break;
	}
	return embedMessage;
};

exports.PrivacyStatementMessage = () => {
	const embedMessage = baseEmbed();
	embedMessage
		.EAddField(
			"隱私權政策",
			"A.L.I.C.E. 會收集使用者的 Discord ID、使用者名稱、使用者暱稱、使用者頭像、使用者所在伺服器 ID、使用者所在伺服器名稱、使用者所在伺服器暱稱、使用者所在伺服器頭像，並將這些資訊用於提供服務、改善服務品質、分析使用者行為等目的。",
		)
		.EAddField(
			"資料保護",
			"A.L.I.C.E. 將採取適當的技術和組織措施來保護使用者的個人資料，防止未經授權的訪問、洩露、修改或破壞。",
		)
		.EAddField(
			"資料保留",
			"A.L.I.C.E. 將在必要的期間內保留使用者的個人資料，以提供服務和履行法律義務。",
		)
		.EAddField(
			"資料分享",
			"A.L.I.C.E. 不會將使用者的個人資料出售或出租給第三方，但可能會在法律要求或保護 A.L.I.C.E. 的權利和財產的情況下，分享使用者的個人資料。",
		)
		.EAddField(
			"聯絡方式",
			"如對本隱私權政策有任何疑問，請聯絡 A.L.I.C.E. 的開發者。",
		);
	return embedMessage;
};

function addMykiritoField(str = undefined) {
	if (str === undefined || str === "") return "小愛不知道喔";
	else return str;
}

function baseEmbed({
	color = "#fbfbc9",
	title = "A.L.I.C.E.",
	Author = "アリス・ツーベルク",
	Author2 = "https://i.imgur.com/crrk7I2.png",
	Author3 = "https://smilin.net",
	Description = "人工高適應性知性自律存在",
	Thumbnail = "https://i.imgur.com/5ffD6du.png",
} = {}) {
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

/**
 * BaseDiscordBot 介面層測試
 *
 * 這一層是全專案唯一直接接觸 discord.js 的檔案，其餘程式碼只認識這裡的介面。
 * 因此測試的目的不是驗證 discord.js 本身，而是「當 discord.js 改版時，
 * 能立刻知道哪一個介面的欄位名稱、列舉值或物件形狀對不上了」。
 *
 * 兩種測法：
 * 1. 取值介面 - 餵入模擬的 discord 物件，確認有沒有抓到正確欄位。
 * 2. 產生器介面 - 呼叫真正的 discord.js builder，比對 toJSON() 的欄位名與列舉值
 *    (這些數值由 Discord API 規格決定，改版時最容易出事)。
 */

//#region import
const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const BDB = require("../baseJS/BaseDiscordBot.js");
const buttonType = require("../manager/buttonManager/buttonType.json");
//#endregion

//#region 測試工具

/** 介面層對於缺欄位的物件會呼叫 CatchF 印出錯誤而不是拋例外，
 *  測試這類路徑時把 console 暫時關掉，避免測試輸出被洗版
 */
async function silence(doSomeThing) {
	const rawLog = console.log;
	const rawError = console.error;
	console.log = () => {};
	console.error = () => {};
	try {
		return await doSomeThing();
	} finally {
		console.log = rawLog;
		console.error = rawError;
	}
}

/** 模擬 discord.js 的 Message，只保留介面層真正會讀到的欄位 */
function newFakeMessage({
	content = "~help",
	channelId = "channel-1",
	guildId = "guild-1",
	authorId = "user-1",
} = {}) {
	const sent = [];
	return {
		content,
		author: { id: authorId },
		guild: { id: guildId },
		channel: {
			id: channelId,
			send: async (message) => {
				sent.push(message);
				return message;
			},
		},
		reply: async (message) => {
			sent.push(message);
			return message;
		},
		sent,
	};
}

/** 模擬 discord.js 的 Interaction */
function newFakeInteraction({
	commandName = "m",
	customId = "helpPlay",
	values = ["music"],
	isBot = false,
	type = "slash",
	options = {},
} = {}) {
	const called = [];
	const record = (name, value) => {
		called.push(name);
		return value;
	};
	return {
		commandName,
		customId,
		values,
		user: { bot: isBot },
		called,
		options: {
			getString: (name) => record(`getString:${name}`, options.string),
			getInteger: (name) => record(`getInteger:${name}`, options.int),
			getBoolean: (name) => record(`getBoolean:${name}`, options.bool),
			getUser: (name) => record(`getUser:${name}`, options.user),
			getChannel: (name) => record(`getChannel:${name}`, options.channel),
			getRole: (name) => record(`getRole:${name}`, options.role),
			getMentionable: (name) => record(`getMentionable:${name}`, options.mention),
			getNumber: (name) => record(`getNumber:${name}`, options.number),
			getAttachment: (name) => record(`getAttachment:${name}`, options.attachment),
			getSubcommand: () => record("getSubcommand", options.subcommand),
		},
		isChatInputCommand: () => type === "slash",
		isButton: () => type === "button",
		isStringSelectMenu: () => type === "selectMenu",
		isUserContextMenuCommand: () => type === "context",
		reply: async (message) => record("reply", message),
		editReply: async (message) => record("editReply", message),
		update: async (message) => record("update", message),
		followUp: async (message) => record("followUp", message),
		channel: { send: async (message) => record("channelSend", message) },
	};
}

//#endregion

//#region 客戶端操作 C

describe("C - 客戶端 command 容器", () => {
	it("四種 command 容器都能初始化並存取", () => {
		const cases = [
			[0, BDB.CSetSlashCommand],
			[1, BDB.CSetSelectMenuCommand],
			[2, BDB.CSetButtonCommand],
			[3, BDB.CSetContextCommand],
		];

		for (const [commandNumber, setCommand] of cases) {
			BDB.CInitCommand(commandNumber);
			const value = { data: { name: `command-${commandNumber}` } };
			setCommand("test", value);
			assert.equal(BDB.CGetCommand(commandNumber).get("test"), value);
		}
	});

	it("CInitCommand 會清空既有的 command", () => {
		BDB.CInitCommand(0);
		BDB.CSetSlashCommand("test", {});
		BDB.CInitCommand(0);
		assert.equal(BDB.CGetCommand(0).size, 0);
	});

	it("CGetClient 回傳的是同一個 client", () => {
		assert.equal(BDB.CGetClient(), BDB.GetMe());
	});
});

//#endregion

//#region 訊息動作 M

describe("M - 訊息取值", () => {
	const msg = newFakeMessage({
		content: "!p",
		channelId: "c-9",
		guildId: "g-9",
		authorId: "u-9",
	});

	it("能取得訊息的各項資訊", () => {
		assert.equal(BDB.MContent(msg), "!p");
		assert.equal(BDB.MGetChannelId(msg), "c-9");
		assert.equal(BDB.MGetGuildId(msg), "g-9");
		assert.equal(BDB.MGetAuthorId(msg), "u-9");
	});

	it("欄位不存在時回傳錯誤訊息字串，不會中斷流程", async () => {
		await silence(() => {
			assert.match(BDB.MContent({}), /MContent 方法異常/);
			assert.match(BDB.MGetChannelId({}), /MGetChannelId 方法異常/);
			assert.match(BDB.MGetGuildId({}), /MGetGuildId 方法異常/);
			assert.match(BDB.MGetAuthorId({}), /MGetAuthorId 方法異常/);
		});
	});
});

describe("M - MSend 傳送分流", () => {
	it("type 0 送到訊息所在頻道，type 1 走回覆", async () => {
		const msg = newFakeMessage();
		await BDB.MSend(msg, "頻道");
		await BDB.MSend(msg, "回覆", 1);
		assert.deepEqual(msg.sent, ["頻道", "回覆"]);
	});

	it("type 2 用 client 撈頻道後傳送", async () => {
		const sent = [];
		const fakeClient = {
			channels: {
				fetch: async (channelId) => ({
					send: async (message) => sent.push(`${channelId}:${message}`),
				}),
			},
		};
		await BDB.MSend(fakeClient, "公告", 2, "c-1");
		assert.deepEqual(sent, ["c-1:公告"]);
	});

	it("參數不合法時拋出例外", async () => {
		await assert.rejects(() => BDB.MSend({}, "x", "非數字"), /type Error/);
		await assert.rejects(() => BDB.MSend({}, "x", 2), /channelId Error/);
		await assert.rejects(() => BDB.MSend({}, "x", 3, "c-1"), /guildId Error/);
	});
});

describe("M - MessageBuilder", () => {
	it("組出 discord 傳送訊息用的格式", () => {
		const embed = BDB.ENewEmbed().ESetTitle("t");
		const row = BDB.NewActionRow();
		const message = BDB.MNewMessage("哈囉")
			.setEphemeral(true)
			.addEmbed(embed)
			.addComponents(row)
			.toMessage();

		assert.deepEqual(Object.keys(message).sort(), [
			"components",
			"content",
			"embeds",
			"ephemeral",
		]);
		assert.equal(message.content, "哈囉");
		assert.equal(message.ephemeral, true);
		assert.deepEqual(message.embeds, [embed]);
		assert.deepEqual(message.components, [row]);
	});
});

//#endregion

//#region 斜線動作 S

describe("S - 斜線指令產生器", () => {
	it("SNewSlashCommand 產生的 json 帶有名稱與介紹", () => {
		const json = BDB.SNewSlashCommand("m", "音樂系統").toJSON();
		assert.equal(json.name, "m");
		assert.equal(json.description, "音樂系統");
	});

	it("各種 option 型別對應到 discord 的型別代號", () => {
		// 代號由 Discord API 規格決定，改版對不上就是這裡爆
		const cases = [
			["string", 3],
			["int", 4],
			["bool", 5],
			["user", 6],
			["channel", 7],
			["role", 8],
			["mention", 9],
			["number", 10],
			["attachment", 11],
		];

		for (const [type, apiType] of cases) {
			const slash = BDB.SNewSlashCommand("test", "測試");
			BDB.SPushOption(slash, type, "opt", "選項", true);
			const option = slash.toJSON().options[0];
			assert.equal(option.type, apiType, `${type} 型別對應錯誤`);
			assert.equal(option.name, "opt");
			assert.equal(option.required, true);
		}
	});

	it("string option 可以帶預設選項", () => {
		const slash = BDB.SNewSlashCommand("test", "測試");
		BDB.SPushOption(slash, "string", "mode", "模式", false, [
			{ name: "快", value: "fast" },
		]);
		const [choice] = slash.toJSON().options[0].choices;
		assert.equal(choice.name, "快");
		assert.equal(choice.value, "fast");
	});

	it("subcommand 會把自己的 option 一起帶進去", () => {
		const slash = BDB.SNewSlashCommand("m", "音樂系統");
		BDB.SPushOption(slash, "subcommand", "play", "播放", false, [
			{ type: "string", name: "url", description: "網址", required: true },
		]);
		const subcommand = slash.toJSON().options[0];
		assert.equal(subcommand.type, 1);
		assert.equal(subcommand.name, "play");
		assert.equal(subcommand.options[0].type, 3);
		assert.equal(subcommand.options[0].required, true);
	});
});

describe("S - 斜線取值", () => {
	it("SGetSlashName 取得指令名稱", () => {
		assert.equal(BDB.SGetSlashName(newFakeInteraction()), "m");
	});

	it("SGetOptionValue 依型別呼叫對應的 discord.js 方法", () => {
		const cases = [
			["string", "getString:url"],
			["int", "getInteger:url"],
			["bool", "getBoolean:url"],
			["user", "getUser:url"],
			["channel", "getChannel:url"],
			["role", "getRole:url"],
			["mention", "getMentionable:url"],
			["number", "getNumber:url"],
			["attachment", "getAttachment:url"],
		];

		for (const [type, expected] of cases) {
			const interaction = newFakeInteraction();
			BDB.SGetOptionValue(interaction, type, "url");
			assert.deepEqual(interaction.called, [expected]);
		}
	});

	it("SGetOptionValue 取得 subcommand 名稱", () => {
		const interaction = newFakeInteraction({ options: { subcommand: "play" } });
		assert.equal(BDB.SGetOptionValue(interaction, "subcommand"), "play");
		assert.deepEqual(interaction.called, ["getSubcommand"]);
	});
});

//#endregion

//#region 按鈕動作 B

describe("B - 按鈕產生器", () => {
	it("一般按鈕帶 custom_id 與顏色代號", () => {
		const json = BDB.BNewButton("helpPlay", "點歌").toJSON();
		assert.equal(json.custom_id, "helpPlay");
		assert.equal(json.label, "點歌");
		assert.equal(json.style, 1); // Primary
		assert.equal(json.disabled, false);
	});

	it("buttonType.json 的顏色對應到 discord 的樣式代號", () => {
		const cases = [
			[buttonType.blue, 1],
			[buttonType.gray, 2],
			[buttonType.green, 3],
			[buttonType.red, 4],
		];

		for (const [type, style] of cases) {
			assert.equal(BDB.BNewButton("id", "文字", type).toJSON().style, style);
		}
	});

	it("link 按鈕改帶 url 且沒有 custom_id", () => {
		const json = BDB.BNewButton(
			"https://smilin.net",
			"官網",
			buttonType.link
		).toJSON();
		assert.equal(json.url, "https://smilin.net");
		assert.equal(json.style, 5); // Link
		assert.equal(json.custom_id, undefined);
	});

	it("可以產生禁用狀態的按鈕", () => {
		assert.equal(BDB.BNewButton("id", "文字", buttonType.blue, true).toJSON().disabled, true);
	});
});

describe("B - 按鈕取值", () => {
	it("取得按鈕 id 與所屬指令名稱", () => {
		const interaction = newFakeInteraction({ customId: "helpSkip" });
		interaction.message = { interaction: { commandName: "m" } };
		assert.equal(BDB.BGetButtonId(interaction), "helpSkip");
		assert.equal(BDB.BGetSlashName(interaction), "m");
	});

	it("取得原始訊息內嵌訊息的 author 名稱 (攻略組用)", () => {
		const interaction = newFakeInteraction();
		interaction.message = {
			embeds: [{ data: { author: { name: "桐人" } } }],
		};
		assert.equal(BDB.BGetMessageEmbedsAuthorName(interaction), "桐人");
	});
});

//#endregion

//#region 菜單動作 SM

describe("SM - 菜單產生器", () => {
	it("菜單與選項組出來的 json 結構正確", () => {
		const option = BDB.SMNewOption()
			.SMSetLabel("🎧 音樂系統")
			.SMSetDescription("想要聽音樂的靠過來!")
			.SMSetValue("music");
		const selectMenu = BDB.SMNewSelectMenu("help", "📖 指令教學");
		BDB.SMPushOptions(selectMenu, [option]);

		const json = selectMenu.toJSON();
		assert.equal(json.custom_id, "help");
		assert.equal(json.placeholder, "📖 指令教學");
		assert.equal(json.options.length, 1);
		assert.equal(json.options[0].label, "🎧 音樂系統");
		assert.equal(json.options[0].value, "music");
		assert.equal(json.options[0].description, "想要聽音樂的靠過來!");
	});

	it("selectMenuM 用來取 key 的路徑仍然存在", () => {
		// selectMenuM 是靠 data.components[0].data.custom_id 當作 Collection 的 key
		const row = BDB.ActionRowAddComponents(
			BDB.NewActionRow(),
			BDB.SMNewSelectMenu("help", "📖 指令教學")
		);
		assert.equal(row.components[0].data.custom_id, "help");
	});
});

describe("SM - 菜單取值", () => {
	it("取得菜單 id 與被選中的值", () => {
		const interaction = newFakeInteraction({
			customId: "help",
			values: ["mykirito"],
			type: "selectMenu",
		});
		assert.equal(BDB.SMGetSelectMenuId(interaction), "help");
		assert.equal(BDB.SMGetSelectMenuName(interaction), "help");
		assert.equal(BDB.SMGetSelectValue(interaction), "mykirito");
	});
});

//#endregion

//#region 交互動作 I

describe("I - interaction 判斷", () => {
	it("四種 interaction 各自只會被自己的判斷式認可", () => {
		const cases = [
			["slash", BDB.IIsSlash],
			["button", BDB.IIsButton],
			["selectMenu", BDB.IIsSelectMenu],
			["context", BDB.IIsContext],
		];

		for (const [type, isType] of cases) {
			for (const [otherType] of cases) {
				assert.equal(
					isType(newFakeInteraction({ type: otherType })),
					type === otherType,
					`${type} 的判斷式對 ${otherType} 判斷錯誤`
				);
			}
		}
	});

	it("IIsBot 判斷發送者是不是 bot", () => {
		assert.equal(BDB.IIsBot(newFakeInteraction({ isBot: true })), true);
		assert.equal(BDB.IIsBot(newFakeInteraction({ isBot: false })), false);
	});

	it("IGetCommandName 取得指令名稱", () => {
		assert.equal(BDB.IGetCommandName(newFakeInteraction()), "m");
	});
});

describe("I - interaction 回覆", () => {
	it("ISend 依 replyType 呼叫 reply 或 channel.send", async () => {
		const reply = newFakeInteraction();
		await BDB.ISend(reply, "訊息");
		assert.deepEqual(reply.called, ["reply"]);

		const channel = newFakeInteraction();
		await BDB.ISend(channel, "訊息", 2);
		assert.deepEqual(channel.called, ["channelSend"]);
	});

	it("ISend replyType 1 對已回覆過的 interaction 改用 followUp", async () => {
		const interaction = newFakeInteraction();
		interaction.replied = true;
		interaction.deferReply = async () => {
			throw new Error("已經回覆過了");
		};
		await BDB.ISend(interaction, "錯誤訊息", 1);
		assert.deepEqual(interaction.called, ["followUp"]);
	});

	it("IDeferUpdate 確認互動但不更動訊息", async () => {
		const interaction = newFakeInteraction();
		interaction.deferUpdate = async () => interaction.called.push("deferUpdate");
		await BDB.IDeferUpdate(interaction);
		assert.deepEqual(interaction.called, ["deferUpdate"]);
	});

	it("IEdit 依 replyType 呼叫 editReply 或 update", async () => {
		const edit = newFakeInteraction();
		await BDB.IEdit(edit, "訊息");
		assert.deepEqual(edit.called, ["editReply"]);

		const update = newFakeInteraction();
		await BDB.IEdit(update, "訊息", 1);
		assert.deepEqual(update.called, ["update"]);
	});
});

//#endregion

//#region 組件動作

describe("組件 - ActionRow", () => {
	it("按鈕塞進 ActionRow 後的 json 結構正確", () => {
		const row = BDB.ActionRowAddComponents(
			BDB.NewActionRow(),
			BDB.BNewButton("helpPlay", "點歌")
		);
		const json = row.toJSON();
		assert.equal(json.type, 1); // ActionRow
		assert.equal(json.components[0].type, 2); // Button
		assert.equal(json.components[0].custom_id, "helpPlay");
	});
});

//#endregion

//#region 嵌入式訊息動作 E

describe("E - 嵌入式訊息", () => {
	it("每個設定都對應到 discord 的 embed 欄位", () => {
		const json = BDB.ENewEmbed()
			.ESetColor("#fbfbc9")
			.ESetAuthor("アリス", "https://i.imgur.com/crrk7I2.png", "https://smilin.net")
			.ESetTitle("A.L.I.C.E.")
			.ESetUrl("https://smilin.net")
			.ESetDescription("人工高適應性知性自律存在")
			.ESetThumbnail("https://i.imgur.com/5ffD6du.png")
			.EAddField("標題", "內容", true)
			.EAddEmptyField()
			.ESetImage("https://i.imgur.com/5ffD6du.png")
			.ESetFooter("頁尾", "https://i.imgur.com/crrk7I2.png")
			.ESetTimestamp()
			.toJSON();

		assert.equal(json.color, 0xfbfbc9);
		assert.equal(json.author.name, "アリス");
		// discord.js 的欄位是 iconURL，寫錯會被靜默忽略，這裡專門盯著它
		assert.equal(json.author.icon_url, "https://i.imgur.com/crrk7I2.png");
		assert.equal(json.author.url, "https://smilin.net");
		assert.equal(json.title, "A.L.I.C.E.");
		assert.equal(json.url, "https://smilin.net");
		assert.equal(json.description, "人工高適應性知性自律存在");
		assert.equal(json.thumbnail.url, "https://i.imgur.com/5ffD6du.png");
		assert.equal(json.image.url, "https://i.imgur.com/5ffD6du.png");
		assert.deepEqual(json.fields[0], {
			name: "標題",
			value: "內容",
			inline: true,
		});
		assert.deepEqual(json.fields[1], {
			name: "​",
			value: "​",
			inline: false,
		});
		assert.equal(json.footer.text, "頁尾");
		assert.equal(json.footer.icon_url, "https://i.imgur.com/crrk7I2.png");
		assert.ok(json.timestamp);
	});

	it("EToMessage 轉成可以直接傳送的格式", () => {
		const embed = BDB.ENewEmbed().ESetTitle("t");
		assert.deepEqual(embed.EToMessage(), { embeds: [embed] });
	});
});

//#endregion

//#region 音樂系統動作 Mu

describe("Mu - 音樂系統", () => {
	beforeEach(() => {
		global.connection = new Map();
		global.isPlaying = new Map();
	});

	it("MuIsVoicing 在使用者不在語音頻道時回傳 true", () => {
		const inVoice = { member: { voice: { channel: { id: "v-1" } } } };
		const notInVoice = { member: { voice: { channel: null } } };
		assert.equal(BDB.MuIsVoicing(inVoice), false);
		assert.equal(BDB.MuIsVoicing(notInVoice), true);
	});

	it("MuIsVoicingMySelf 依 global.connection 判斷 bot 在不在語音", () => {
		const msg = newFakeMessage({ guildId: "g-1" });
		assert.equal(BDB.MuIsVoicingMySelf(msg), false);
		global.connection.set("g-1", { fake: true });
		assert.equal(BDB.MuIsVoicingMySelf(msg), true);
	});

	it("MuIsPlaying / MuGetConnection 讀的是以 guildId 為 key 的 global", () => {
		const connection = { fake: true };
		global.connection.set("g-1", connection);
		global.isPlaying.set("g-1", true);
		assert.equal(BDB.MuGetConnection("g-1"), connection);
		assert.equal(BDB.MuIsPlaying("g-1"), true);
	});

	it("取得群組與頻道 id", () => {
		const msg = newFakeMessage({ guildId: "g-1", channelId: "c-1" });
		assert.equal(BDB.MuGetGuildId(msg), "g-1");
		assert.equal(BDB.MuGetChannelId(msg), "c-1");
	});

	it("MuGetAudioPlayerStatus 對應 @discordjs/voice 的狀態值", () => {
		assert.equal(BDB.MuGetAudioPlayerStatus(0), "idle");
		assert.equal(BDB.MuGetAudioPlayerStatus(1), "buffering");
		assert.equal(BDB.MuGetAudioPlayerStatus(2), "playing");
		assert.equal(BDB.MuGetAudioPlayerStatus(3), "autopaused");
		assert.equal(BDB.MuGetAudioPlayerStatus(4), "paused");
	});

	it("MuGetAudioPlay 產生的播放器初始狀態是 idle", () => {
		const audioPlay = BDB.MuGetAudioPlay();
		assert.equal(typeof audioPlay.play, "function");
		assert.equal(audioPlay.state.status, BDB.MuGetAudioPlayerStatus(0));
		audioPlay.stop();
	});

	it("MuMessageSend 依 type 決定走 message 還是 interaction", async () => {
		const msg = newFakeMessage();
		await BDB.MuMessageSend(msg, "訊息", 0);
		assert.deepEqual(msg.sent, ["訊息"]);

		const interaction = newFakeInteraction();
		await BDB.MuMessageSend(interaction, "訊息", 1);
		assert.deepEqual(interaction.called, ["reply"]);
	});
});

//#endregion

//#region 監聽

describe("On - 事件綁定", () => {
	/** 模擬 client，只記錄被綁定的 discord.js 事件名稱 */
	function newFakeClient() {
		const events = [];
		return { events, on: (name) => events.push(name) };
	}

	it("專案自訂的事件名對應到 discord.js 的事件名", () => {
		const cases = [
			["ready", "ready"],
			["message", "messageCreate"],
			["messageUpdate", "messageUpdate"],
			["slash", "interactionCreate"],
			["button", "interactionCreate"],
			["selectMenu", "interactionCreate"],
			["context", "interactionCreate"],
		];

		for (const [name, discordEvent] of cases) {
			const client = newFakeClient();
			BDB.On(client, name, () => {});
			assert.deepEqual(client.events, [discordEvent], `${name} 綁定錯誤`);
		}
	});

	it("未定義的事件名不會綁定任何東西", () => {
		const client = newFakeClient();
		BDB.On(client, "不存在的事件", () => {});
		assert.deepEqual(client.events, []);
	});
});

//#endregion

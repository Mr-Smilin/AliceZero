//#region import
// Discord
const {
	Events,
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	ButtonStyle,
	ActionRowBuilder,
	ButtonBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	EmbedBuilder,
} = require("discord.js");
const client = new Client({
	intents: [
		GatewayIntentBits?.Guilds && 1,
		GatewayIntentBits?.GuildMembers && 2,
		GatewayIntentBits?.GuildBans && 4,
		GatewayIntentBits?.GuildEmojisAndStickers && 8,
		GatewayIntentBits?.GuildIntegrations && 16,
		GatewayIntentBits?.GuildWebhooks && 32,
		GatewayIntentBits?.GuildInvites && 64,
		GatewayIntentBits?.GuildVoiceStates && 128,
		GatewayIntentBits?.GuildPresences && 256,
		GatewayIntentBits?.GuildMessages && 512,
		GatewayIntentBits?.GuildMessageReactions && 1024,
		GatewayIntentBits?.GuildMessageTyping && 2048,
		GatewayIntentBits?.DirectMessages && 4096,
		GatewayIntentBits?.DirectMessageReactions && 8192,
		GatewayIntentBits?.DirectMessageTyping && 16384,
		GatewayIntentBits?.MessageContent && 32768,
		GatewayIntentBits?.GuildScheduledEvents && 65536,
		GatewayIntentBits?.AutoModerationConfiguration && 1048576,
		GatewayIntentBits?.AutoModerationExecution && 2097152,
	],
	partials: [
		Partials?.User && "USER",
		Partials?.Message && "MESSAGE",
		Partials?.Channel && "CHANNEL",
		Partials?.Reaction && "REACTION",
		Partials?.GuildMember && "GUILDMEMBER",
		Partials?.GuildScheduledEvent && "GUILDSCHEDULEDEVENT",
		Partials?.ThreadMember && "THREADMEMBER",
	],
});
const { SlashCommandBuilder } = require("@discordjs/builders");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
// js
const CatchF = require("./CatchF.js");
// json
const buttonType = require("../manager/buttonManager/buttonType.json");
const { exceptions } = require("winston");
//#endregion

//#region 客戶端操作 C

/** 拿到 client
 * 
 * @returns 
 */
exports.CGetClient = () => {
	return client;
}

/** 創建 commands 屬性
 * 
 * @param {*} commandNumber 
 */
exports.CInitCommand = (commandNumber = 0) => {
	try {
		switch (commandNumber) {
			case 0:
				client.slashCommands = new Collection();
				break;
			case 1:
				client.selectMenuCommands = new Collection();
				break;
			case 2:
				client.buttonCommands = new Collection();
				break;
		}

	} catch (err) {
		CatchF.ErrorDo(err, "CInitCommand 方法異常!");
	}
}

/** 在 client 中注入 commands
 * 
 * @param {*} name 
 * @param {*} value 
 */
exports.CSetSlashCommand = (name, value) => {
	try {
		client.slashCommands.set(name, value);
	} catch (err) {
		CatchF.ErrorDo(err, "CSetSlashCommand 方法異常!");
	}
}

/** 在 client 中注入 commands
 * 
 * @param {*} name 
 * @param {*} value 
 */
exports.CSetSelectMenuCommand = (name, value) => {
	try {
		client.selectMenuCommands.set(name, value);
	} catch (err) {
		CatchF.ErrorDo(err, "CSetSelectMenuCommand 方法異常!");
	}
}

/** 在 client 中注入 commands
 * 
 * @param {*} name 
 * @param {*} value 
 */
exports.CSetButtonCommand = (name, value) => {
	try {
		client.buttonCommands.set(name, value);
	} catch (err) {
		CatchF.ErrorDo(err, "CSetButtonCommand 方法異常!");
	}
}

/** 從 client 拿到 command
 * 
 * @param {*} commandNumber 
 */
exports.CGetCommand = (commandNumber = 0) => {
	try {
		switch (commandNumber) {
			case 0:
				return client.slashCommands;
			case 1:
				return client.selectMenuCommands;
			case 2:
				return client.buttonCommands;
		}

	} catch (err) {
		CatchF.ErrorDo(err, "CGetCommand 方法異常!");
	}
}

//#endregion

//#region 訊息動作 M

/** 定義 Discord.js 各種類型的訊息傳送
 *
 * @param {*} discordObject Discord.Message
 * @param {string} message 訊息
 * @param {number} type 告知 discordObject 類型 0=Message,1=Channel,2=Guild 預設0
 * @param {string} channelId 頻道ID,當 type 大於等於 1 時為必填
 * @param {string} guildId 群組ID,當 type 大於等於 2 時為必填
 */
exports.MSend = async function (
	discordObject,
	message,
	type = 0,
	channelId = "",
	guildId = ""
) {
	if (!/^[0-9]*$/.test(type)) new exceptions("type Error");
	if (type >= 2 && channelId === "")
		new exceptions("channelId Error");
	if (type >= 3 && guildId === "")
		new exceptions("guildId Error");
	try {
		let guild;
		let channel;
		switch (type) {
			case 0:
				return await discordObject.channel.send(message);
			case 1:
				return await discordObject.reply(message);
			case 2:
				channel = await discordObject.channels.fetch(channelId);
				return await channel.send(message);
			case 3:
				guild = await discordObject.guilds.fetch(guildId);
				channel = await guild.channels.fetch(channelId);
				return await channel.send(message);
		}
	} catch (err) {
		CatchF.ErrorDo(err, "MSend 方法異常!");
	}
};

/** 回傳 Discord.Message 的訊息
 *
 * @param {*} discordMessage Discord.Message
 * @returns {string}
 */
exports.MContent = (discordMessage) => discordMessage?.content === undefined ? CatchF.ErrorDo("MContent 方法異常!") : discordMessage?.content;

exports.MGetChannelId = (discordMessage) => discordMessage?.channel?.id === undefined ? CatchF.ErrorDo("MGetChannelId 方法異常!") : discordMessage?.channel?.id;

class MessageBuilder {
	constructor(text) {
		this.text = text;
		this.ephemeral = false;
		this.embeds = [];
		this.components = [];
	}
	/** 修改文字訊息
	 * 
	 * @param {string} text 文字訊息 
	 */
	setText(text) {
		this.text = text;
		return this;
	}
	/** 設定他人是否可見
	 * 
	 * @param {boolean} ephemeral false = 他人可見 | true = 僅自己 
	 */
	setEphemeral(ephemeral) {
		this.ephemeral = ephemeral;
		return this;
	}
	/** 添加 embed
	 * 
	 * @param {*} embed 
	 */
	addEmbed(embed) {
		this.embeds.push(embed);
		return this;
	}
	/** 添加組件
	 * 
	 * @param {*} component 選單 or 按鈕
	 */
	addComponents(component) {
		this.components.push(component);
		return this;
	}
	/** 回傳 discord 訊息格式
	 * 
	 * @returns {object}
	 */
	toMessage() {
		return {
			content: this.text,
			embeds: this.embeds,
			ephemeral: this.ephemeral,
			components: this.components,
		}
	}
}

/** 回傳一個 MessageBuilder
 * 
 * @param {string} message 訊息 
 * @returns {MessageBuilder} 訊息格式產生器
 */
exports.MNewMessage = (message = "") => new MessageBuilder(message);

/** 獲得消息發送者的id
 * 
 * @param {*} discordMessage 
 * @returns 
 */
exports.MGetAuthorId = (discordMessage) => discordMessage?.author?.id === undefined ? CatchF.ErrorDo("MGetAuthorId 方法異常!") : discordMessage?.author?.id;

//#endregion

//#region 這些都是斜線還有它的附屬組件

//#region 斜線動作 S

/** 註冊斜線命令
 *
 * @param {*} rest
 * @param {*} body
 * @returns
 */
exports.SRestPutRoutes = async (body = []) => {
	try {
		// return await rest.put(Routes.applicationCommands(process.env.BOT_ID), {
		// 	body: body,
		// });
		return await client.application.commands.set(body);
	}
	catch (err) {
		CatchF.ErrorDo(err, "SRestPutRoutes 方法異常!");
	}
}

/** 回傳 interaction.commandName
 *
 * @param {*} interaction
 * @return {string}
 */
exports.SGetSlashName = (interaction) => interaction?.commandName === undefined ? CatchF.ErrorDo("SGetSlashName 方法異常!") : interaction?.commandName;

/** 回傳 斜線指令輸入值物件
 *
 * @param {string} name
 * @param {string} description
 * @returns {SlashCommandBuilder}
 */
exports.SNewSlashCommand = (name = "", description = "") => {
	try {
		return new SlashCommandBuilder().setName(name).setDescription(description);
	}
	catch (err) {
		CatchF.ErrorDo(err, "SNewSlashCommand 方法異常!");
	}
}

/** 新增選項物件
 *
 * @param {SlashCommandBuilder} slashCommandBuilder 輸入值物件
 * @param {string} type string | int | bool | user | channel | role | mention | number | attachment
 * @param {string} name 選項名稱
 * @param {string} description 選項介紹
 * @param {boolean} required 是否必填
 * @param {*} choices 預設選項陣列
 */
exports.SPushOption = (
	slashCommandBuilder,
	type = "string",
	name = "",
	description = "",
	required = false,
	choices = []
) => {
	try {
		switch (type) {
			case "string":
				slashCommandBuilder.addStringOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "int":
				slashCommandBuilder.addIntegerOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "bool":
				slashCommandBuilder.addBooleanOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "user":
				slashCommandBuilder.addUserOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "channel":
				slashCommandBuilder.addChannelOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "role":
				slashCommandBuilder.addRoleOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "mention":
				slashCommandBuilder.addMentionableOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "number":
				slashCommandBuilder.addNumberOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "attachment":
				slashCommandBuilder.addAttachmentOption((option) => {
					option.setName(name).setDescription(description).setRequired(required);
					choices?.map((choice) => option.addChoices(choice));
					return option;
				});
				break;
			case "subcommand":
				slashCommandBuilder.addSubcommand((subcommand) => {
					subcommand.setName(name).setDescription(description);
					for (option of choices) {
						this.SPushOption(subcommand, option?.type, option?.name, option?.description, option?.required, option?.choices);
					}
					return subcommand;
				});
				break;
		}
	}
	catch (err) {
		CatchF.ErrorDo(err, "SPushOption 方法異常!");
	}
};

/** 獲得子選項參數
 * 
 * @param {*} interaction 
 * @param {*} type 
 * @param {*} value 
 * @returns 
 */
exports.SGetOptionValue = (interaction, type = "string", name = "") => {
	try {
		switch (type) {
			case "string":
				return interaction?.options?.getString(name, false);
			case "int":
				return interaction?.options?.getInteger(name, false);
			case "bool":
				return interaction?.options?.getBoolean(name, false);
			case "user":
				return interaction?.options?.getUser(name, false);
			case "channel":
				return interaction?.options?.getChannel(name, false);
			case "role":
				return interaction?.options?.getRole(name, false);
			case "mention":
				return interaction?.options?.getMentionable(name, false);
			case "number":
				return interaction?.options?.getNumber(name, false);
			case "attachment":
				return interaction?.options?.getAttachment(name, false);
			case "subcommand":
				return interaction?.options?.getSubcommand(false);
		}
	}
	catch (err) {
		CatchF.ErrorDo(err, "SGetOptionValue 方法異常!");
	}
}

//#endregion

//#region 按鈕動作 B

class BButtonBuilder extends ButtonBuilder {
	BSetURL(url = "") {
		this.setURL(url);
		return this;
	}

	BSetCustomId(customId) {
		this.setCustomId(customId);
		return this;
	}

	BSetLabel(label) {
		this.setLabel(label);
		return this;
	}

	BSetStyle(style) {
		this.setStyle(style);
		return this;
	}

	BSetDisabled(disabled) {
		this.setDisabled(disabled);
		return this;
	}

	// 獲得按鈕類型(顏色)
	BGetButtonType(type) {
		try {
			switch (type) {
				case buttonType.blue:
					return ButtonStyle.Primary;
				case buttonType.gray:
					return ButtonStyle.Secondary;
				case buttonType.green:
					return ButtonStyle.Success;
				case buttonType.red:
					return ButtonStyle.Danger;
				case buttonType.link:
					return ButtonStyle.Link;
			}
		}
		catch (err) {
			CatchF.ErrorDo(err, "BGetButtonType 方法異常!")
		}
	}
}

/** 回傳一個 BButtonBuilder
 *
 * @param {string} customId 傳遞的id || 當 type 為 link 時，customId 傳遞 url
 * @param {string} label 按鈕顯示的文字
 * @param {string} type buttonType.json
 * @param {boolean} disabled ture = 按鈕禁用(不能按)，默認 false
 * @returns {BButtonBuilder}
 */
exports.BNewButton = (
	customId = "",
	label = "",
	type = buttonType.blue,
	disabled = false
) => {
	try {
		if (buttonType.link === type)
			return new BButtonBuilder()
				.BSetURL(customId)
				.BSetLabel(label)
				.BSetStyle(new BButtonBuilder().BGetButtonType(type))
				.BSetDisabled(disabled);
		return new BButtonBuilder()
			.BSetCustomId(customId)
			.BSetLabel(label)
			.BSetStyle(new BButtonBuilder().BGetButtonType(type))
			.BSetDisabled(disabled);
	}
	catch (err) {
		CatchF.ErrorDo(err, "BNewButton 方法異常!")
	}
};

/** 按鈕獲得所屬指令訊息的 name
 *
 * @param {*} interaction
 * @returns {string}
 */
exports.BGetSlashName = (interaction) =>
	interaction?.message?.interaction?.commandName === undefined ? CatchF.ErrorDo("BGetSlashName 方法異常!") : interaction?.message?.interaction?.commandName;

exports.BGetButtonId = (interaction) => interaction?.customId === undefined ? CatchF.ErrorDo("BGetButtonId 方法異常!") : interaction?.customId;

// 獲得原始訊息中的內嵌訊息中的 Author.name (mykirito模組使用)
exports.BGetMessageEmbedsAuthorName = (interaction) => interaction?.message?.embeds[0]?.data?.author?.name === undefined ? CatchF.ErrorDo("BGetMessageEmbedsAuthorName 方法異常!") : interaction?.message?.embeds[0]?.data?.author?.name;

//#endregion

//#region 菜單動作 SM

// 複寫菜單選項產生器
class SMStringSelectMenuOptionBuilder extends StringSelectMenuOptionBuilder {
	SMSetLabel(label) {
		this.setLabel(label);
		return this;
	}
	SMSetDescription(description) {
		this.setDescription(description);
		return this;
	}
	SMSetValue(value) {
		this.setValue(value);
		return this;
	}
}

/** 回傳一個選單產生器
 * 
 * @returns 
 */
exports.SMNewOption = () => new SMStringSelectMenuOptionBuilder();

/** 回傳一個 菜單
 *
 * @param {string} customId 菜單參數
 * @param {string} placeholder 默認值
 * @returns
 */
exports.SMNewSelectMenu = (customId = "", placeholder = "") => {
	try {
		return new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder);
	}
	catch (err) {
		CatchF.ErrorDo(err, "SMNewSelectMenu 方法異常!");
	}
}

/** 新增多個 選項
 *
 * @param {StringSelectMenuBuilder} selectMenuBuilder
 * @param {*} options
 * @returns
 */
exports.SMPushOptions = (selectMenuBuilder, options = []) => {
	try {
		return options.map((option) => selectMenuBuilder.addOptions(option));
	}
	catch (err) {
		CatchF.ErrorDo(err, "SMPushOptions 方法異常!");
	}
}

/** 獲得菜單的指令名稱
 *
 * @param {StringSelectMenuBuilder} selectMenuBuilder
 * @returns
 */
exports.SMGetSelectMenuName = (selectMenuBuilder) =>
	selectMenuBuilder?.customId === undefined ? CatchF.ErrorDo("SMGetSelectMenuName 方法異常!") : selectMenuBuilder?.customId;

/** 獲得菜單的選擇內容(陣列)
 *
 * @param {StringSelectMenuBuilder} selectMenuBuilder
 * @returns {[string]}
 */
exports.SMGetSelectValue = (selectMenuBuilder) => selectMenuBuilder?.values[0] === undefined ? CatchF.ErrorDo("SMGetSelectValue 方法異常!") : selectMenuBuilder?.values[0];

exports.SMGetSelectMenuId = (interaction) => interaction?.customId === undefined ? CatchF.ErrorDo("SMGetSelectMenuId 方法異常!") : interaction?.customId;

//#endregion

//#region 交互動作 I

/** 定義 interaction 的訊息傳送方法
 *
 * @param {*} interaction Discord.Interaction
 * @param {string} message 訊息
 * @param {number} replyType 0 = 一般回傳訊息 1 = 延遲傳送訊息(Ex: 程序 catch error 時)
 * @returns
 */
exports.ISend = async function (interaction, message, replyType = 0) {
	try {
		switch (replyType) {
			case 0:
				return await interaction.reply(message);
			case 1:
				if (interaction?.replied || interaction?.deferred)
					try {
						await interaction.deferReply();
						return await interaction.reply(message);
					}
					catch {
						return await interaction.followUp(message);
					}
				else
					return await interaction.reply(message);
			case 2:
				return await interaction.channel.send(message);
		}
	}
	catch (err) {
		CatchF.ErrorDo(err, "ISend 方法異常!");
		CatchF.LogDo(`Message: ${message},replyType: ${replyType}`);
	}
};

/** 定義 interaction 編輯訊息的方法
 * 0 = reply, 1 = 原始消息
 * @param {*} interaction
 * @param {*} message
 * @param {*} replyType
 * @returns
 */
exports.IEdit = async function (interaction, message, replyType = 0) {
	try {
		switch (replyType) {
			case 0:
				return await interaction.editReply(message);
			case 1:
				return await interaction.update(message);
		}
	}
	catch (err) {
		CatchF.ErrorDo(err, "IEdit 方法異常!");
	}
};

/** 回傳 interaction 是否為斜線物件
 *
 * @param {*} interaction
 * @return {boolean}
 */
exports.IIsSlash = (interaction) => interaction?.isChatInputCommand() === undefined ? CatchF.ErrorDo("IIsSlash 方法異常!") : interaction?.isChatInputCommand();

/** 回傳 interaction 是否為按鈕物件
 *
 * @param {*} interaction
 * @return {boolean}
 */
exports.IIsButton = (interaction) => interaction?.isButton() === undefined ? CatchF.ErrorDo("IIsButton 方法異常!") : interaction?.isButton();

/** 回傳 interaction 是否為菜單物件
 *
 * @param {*} interaction
 * @returns {boolean}
 */
exports.IIsSelectMenu = (interaction) => interaction?.isStringSelectMenu() === undefined ? CatchF.ErrorDo("IIsSelectMenu 方法異常!") : interaction?.isStringSelectMenu();

/** 回傳 interaction 是否為是bot發出
 *
 * @param {*} interaction
 * @return {boolean}
 */
exports.IIsBot = (interaction) => interaction?.user?.bot === undefined ? CatchF.ErrorDo("IIsBot 方法異常!") : interaction?.user?.bot;

/** 獲得 commandName */
exports.IGetCommandName = (interaction) => interaction?.commandName === undefined ? CatchF.ErrorDo("IGetCommandName 方法異常!") : interaction?.commandName;

//#endregion

//#region 組件動作

/** 回傳一個 ActionRowBuilder
 *
 * @returns {ActionRowBuilder}
 */
exports.NewActionRow = () => {
	try {
		return new ActionRowBuilder();
	}
	catch (err) {
		CatchF.ErrorDo(err, "NewActionRow 方法異常!")
	}
}

/** 新增一個組件到動作組件內
 *
 * @param {ActionRowBuilder} actionRowBuilder
 * @param {ButtonBuilder | StringSelectMenuBuilder} components
 * @returns {ActionRowBuilder}
 */
exports.ActionRowAddComponents = (actionRowBuilder, components) => {
	try {
		return actionRowBuilder.addComponents(components);
	}
	catch (err) {
		CatchF.ErrorDo(err, "ActionRowAddComponents 方法異常!");
	}
}

//#endregion

//#endregion

//#region 嵌入式訊息動作 E
class EmbedMessage extends EmbedBuilder {
	/** 設定側欄顏色
	 *
	 * @param {string} color Ex: #fbfbc9
	 * @returns {EmbedMessage}
	 */
	ESetColor(color) {
		this.setColor(color);
		return this;
	}
	/** 設定頭像(左上角迷你圖)
	 *
	 * @param {string} name 名字(顯示在圖片右側)
	 * @param {string} iconUrl 頭像網址(圖檔網址)
	 * @param {string} url 名字上的連結
	 * @returns {EmbedMessage}
	 */
	ESetAuthor(name, iconUrl, url) {
		this.setAuthor({ name: name, iconUrl: iconUrl, url: url });
		return this;
	}
	/** 設定標題，在頭像下方
	 *
	 * @param {string} title
	 * @returns {EmbedMessage}
	 */
	ESetTitle(title) {
		this.setTitle(title);
		return this;
	}
	/** 設定標題上的 url，需要先設定標題
	 *
	 * @param {string} url
	 * @returns {EmbedMessage}
	 */
	ESetUrl(url) {
		this.setUrl(url);
		return this;
	}
	/** 設定簡介，在標題下方
	 *
	 * @param {string} description
	 * @returns {EmbedMessage}
	 */
	ESetDescription(description) {
		this.setDescription(description);
		return this;
	}
	/** 設定縮略圖(右上角小圖)
	 *
	 * @param {string} thumbnail 圖檔網址
	 * @returns {EmbedMessage}
	 */
	ESetThumbnail(thumbnail) {
		this.setThumbnail(thumbnail);
		return this;
	}
	/** 添加訊息，嵌入訊息的主要行為
	 *
	 * @param {string} name 訊息標題，在上方，比較小
	 * @param {string} value 訊息內容，大一點
	 * @param {boolean} inline 是否換行，預設否
	 * @returns {EmbedMessage}
	 */
	EAddField(name, value, inline = false) {
		this.addFields({ name: name, value: value, inline: inline });
		return this;
	}
	/** 添加一個空訊息
	 *
	 * @param {boolean} inline 是否換行，預設否
	 * @returns {EmbedMessage}
	 */
	EAddEmptyField(inline = false) {
		this.EAddField("\u200b", "\u200b", inline);
		return this;
	}
	/** 設定圖片(下方大圖)
	 *
	 * @param {string} imageUrl 圖檔網址
	 * @returns {EmbedMessage}
	 */
	ESetImage(imageUrl) {
		this.setImage(imageUrl);
		return this;
	}
	/** 設定頁尾
	 *
	 * @param {string} text 頁尾文字，在頁尾圖片右邊
	 * @param {string} iconUrl 頁尾圖片，左下角，跟頭像一樣迷你
	 * @returns {EmbedMessage}
	 */
	ESetFooter(text, iconUrl) {
		this.setFooter({ text: text, iconURL: iconUrl });
		return this;
	}
	/** 設定訊息發送時間(在頁尾右邊)
	 *
	 * @returns {EmbedMessage}
	 */
	ESetTimestamp() {
		this.setTimestamp();
		return this;
	}

	/** 轉換成 discord.js 傳送訊息兼容的格式
	 * @returns {EmbedMessage}
	 */
	EToMessage() {
		return { embeds: [this] }
	}
}

/** 回傳一個 EmbedMessage
 *
 * @returns {EmbedMessage}
 */
exports.ENewEmbed = () => new EmbedMessage();
//#endregion

//#region 音樂系統動作 Mu

/** 判斷使用者是否在語音中
 * 
 * @param {*} discordObject
 * @param {*} type 0 = message 1 = interaction
 */
exports.MuIsVoicing = (discordObject, type = 0) => {
	if (discordObject?.member?.voice === undefined)
		CatchF.ErrorDo("MuIsVoicing 方法異常!");
	if (type === 0) {
		return discordObject?.member?.voice?.channel === null ? true : false;
	} else {
		return discordObject?.member?.voice?.channel === null ? true : false;
	}
}

/** 判斷 bot 在不在這個群組的語音頻道
 * 
 * @param {*} discordObject
 * @param {*} type 0 = message 1 = interaction
 */
exports.MuIsVoicingMySelf = (discordObject, type = 0) => {
	try {
		if (type === 0)
			return global.connection.has(discordObject?.guild?.id) && !(global.connection.get(discordObject?.guild?.id) === undefined);
		else
			// TODO
			return global.connection.has(discordObject?.guild?.id) && !(global.connection.get(discordObject?.guild?.id) === undefined);
	} catch (err) {
		CatchF.ErrorDo(err, "MuIsVoicingMySelf 方法異常!");
		return false;
	}
}

/** 加入使用者的語音頻道
 * 
 * @param {*} discordObject 
 * @param {} type 0 = message 1 = interaction
 */
exports.MuJoinVoiceChannel = (discordObject, type = 0) => {
	try {
		if (type === 0) {
			const connection = joinVoiceChannel({
				channelId: discordObject?.member?.voice?.channel?.id,
				guildId: discordObject?.guild?.id,
				adapterCreator: discordObject?.guild?.voiceAdapterCreator,
			});
			//#region 解決 bot 加入頻道一分鐘後停止播放任何音頻的問題
			// https://github.com/discordjs/discord.js/issues/9185#issuecomment-1452514375
			// const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
			// 	const newUdp = Reflect.get(newNetworkState, 'udp');
			// 	clearInterval(newUdp?.keepAliveInterval);
			// }
			// connection.on('stateChange', (oldState, newState) => {
			// 	const oldNetworking = Reflect.get(oldState, 'networking');
			// 	const newNetworking = Reflect.get(newState, 'networking');

			// 	oldNetworking?.off('stateChange', networkStateChangeHandler);
			// 	newNetworking?.on('stateChange', networkStateChangeHandler)
			// });
			//#endregion
			global.connection.set(discordObject?.guild?.id, connection);
			return connection;
		}
		else {
			// TODO
			const connection = joinVoiceChannel({
				channelId: discordObject?.member?.voice?.channel?.id,
				guildId: discordObject?.guild?.id,
				adapterCreator: discordObject?.guild?.voiceAdapterCreator,
			});
			global.connection.set(discordObject?.guild?.id, connection);
			return connection;
		}
	}
	catch (err) {
		CatchF.ErrorDo(err, "type = " + type + " MuJoinVoiceChannel 方法異常!");
	}
}

/** 獲得全域 connection
 * 
 * @param {*} guildId 
 * @returns 
 */
exports.MuGetConnection = (guildId) => {
	return global.connection.get(guildId);
}

/** 判斷是否正在播放歌曲
 * 
 * @param {*} guildId 
 * @returns 
 */
exports.MuIsPlaying = (guildId) => {
	return global.isPlaying.get(guildId);
}

/** 獲得群組ID
 * 
 * @param {} discordObject 
 * @param {} type 0 = message 1 = interaction
 */
exports.MuGetGuildId = (discordObject, type = 0) => {
	if (type === 0)
		return discordObject?.guild?.id === undefined ? CatchF.ErrorDo("MuGetGuildId 方法異常!") : discordObject?.guild?.id;
	else
		// TODO
		return discordObject?.guild?.id === undefined ? CatchF.ErrorDo("MuGetGuildId 方法異常!") : discordObject?.guild?.id;
}

/** 獲得頻道ID 沒用到
 * 
 * @param {*} discordObject 
 * @param {} type 0 = message 1 = interaction
 * @returns 
 */
exports.MuGetChannelId = (discordObject, type = 0) => {
	if (type === 0)
		return discordObject?.channel?.id === undefined ? CatchF.ErrorDo("MuGetChannelId 方法異常!") : discordObject?.channel?.id;
	else
		// TODO
		return discordObject?.channel?.id === undefined ? CatchF.ErrorDo("MuGetChannelId 方法異常!") : discordObject?.channel?.id;
}

/** 音樂系統用的訊息回傳方式
 * 
 * @param {*} discordObject 
 * @param {*} message 
 * @param {*} type 0 = message, 1 = slash
 */
exports.MuMessageSend = (discordObject, message, type = 0, replyType = 0) => {
	if (type === 0) {
		this.MSend(discordObject, message);
	} else if (type === 1) {
		this.ISend(discordObject, message, replyType);
	}
}

/** 創建音樂播放器(訂閱目標)
 * 
 * @returns 
 */
exports.MuGetAudioPlay = () => {
	try {
		return createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Play
			}
		});
	}
	catch (err) {
		CatchF.ErrorDo(err, "MuGetAudioPlay 方法異常!");
	}
}

exports.MuPlayMusic = (audioPlay, stream) => {
	try {
		const resource = createAudioResource(stream.stream, { inputType: stream.type });
		audioPlay.play(resource);
	}
	catch (err) {
		CatchF.ErrorDo(err, "MuPlayMusic 方法異常!");
	}
}

/** 獲得 audioPlayer 狀態
 * url: https://discordjs.guide/voice/audio-player.html#life-cycle
 * @param {*} status 
 * @returns 
 */
exports.MuGetAudioPlayerStatus = (status = 0) => {
	try {
		switch (status) {
			case 0:
				// the initial state of an audio player. The audio player will be in this state when there is no audio resource for it to play.
				return AudioPlayerStatus?.Idle === undefined ? new exceptions("State Idle Error") : AudioPlayerStatus?.Idle;
			case 1:
				// the state an audio player will be in while it is waiting for an audio resource to become playable.
				// The audio player may transition from this state to either the Playing state (success) or the Idle state (failure).
				return AudioPlayerStatus?.Buffering === undefined ? new exceptions("State Buffering Error") : AudioPlayerStatus?.Buffering;
			case 2:
				// the state a voice connection enters when it is actively playing an audio resource.
				// When the audio resource comes to an end, the audio player will transition to the Idle state.
				return AudioPlayerStatus?.Playing === undefined ? new exceptions("State Playing Error") : AudioPlayerStatus?.Playing;
			case 3:
				// the state a voice connection will enter when the player has paused itself because there are no active voice connections to play to.
				// This is only possible with the noSubscriber behavior set to Pause.
				// It will automatically transition back to Playing once at least one connection becomes available again.
				return AudioPlayerStatus?.AutoPaused === undefined ? new exceptions("State AutoPaused Error") : AudioPlayerStatus?.AutoPaused;
			case 4:
				// the state a voice connection enters when it is paused by the user.
				return AudioPlayerStatus?.Paused === undefined ? new exceptions("State Paused Error") : AudioPlayerStatus?.Paused;
		}
	}
	catch (err) {
		CatchF.ErrorDo(err, "MuGetAudioPlayerStatus 方法異常!");
	}
}

//#endregion

//#region 監聽

/** 監聽事件
 *
 * @param {Discord.Client} cl 如果沒有client，請先使用Login方法
 * @param {string} name
 * @param {*} doSomeThing
 */
exports.On = function (cl, name, doSomeThing) {
	try {
		switch (name) {
			case "ready":
				cl.on(Events?.ClientReady && "ready", doSomeThing);
				break;
			case "message":
				cl.on(Events?.MessageCreate && "messageCreate", doSomeThing);
				break;
			case "messageUpdate":
				cl.on(Events?.MessageUpdate && "messageUpdate", doSomeThing);
				break;
			case "slash":
				cl.on(Events?.InteractionCreate && "interactionCreate", doSomeThing);
				break;
			case "button":
				cl.on(Events?.InteractionCreate && "interactionCreate", doSomeThing);
				break;
			case "selectMenu":
				cl.on(Events?.InteractionCreate && "interactionCreate", doSomeThing);
				break;
		}
	} catch (err) {
		CatchF.ErrorDo(err, "on啟動失敗: ");
	}
};

//#endregion

//#region 初始行為

/** 登入bot的第一步
 *
 * @param {string} key Bot登入鑰(重要)
 */
exports.Login = async function (key) {
	try {
		client.login(key);
		return client;
	} catch (err) {
		CatchF.EmptyDo(err, "Login事件失敗!請確認key值:");
	}
};

exports.GetMe = function () {
	return client;
};

//#endregion

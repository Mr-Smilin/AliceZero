// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
const musicSourceC = require("./musicSourceC.js");
const CatchF = require("../../baseJS/CatchF.js");

//#region 主要方法

/** 歌單初始化 & 群組綁定
 *
 * @param {*} guildId
 */
exports.InitMusicValue = (guildId) => {
	try {
		global.isPlaying.set(guildId, false);
		global.songList.set(guildId, []);
		global.connection.set(guildId, undefined);
		global.dispatcher.set(guildId, undefined);
		return true;
	} catch (err) {
		CatchF.ErrorDo(err, "InitMusicValue 方法異常!");
		return false;
	}
};

/** 添加歌曲進入歌單
 *
 * @param {*} guildId
 * @param {*} musicUrl
 * @param {*} type 0 = 添加到最尾端 1 = 添加到最前面(插播)
 */
exports.AddSongList = async (guildId, musicUrl, type = 0) => {
	try {
		const listData = await musicSourceC.GetSong(musicUrl);
		if (type === 0) {
			global.songList.get(guildId).push(listData);
		} else if (type === 1) {
			global.songList.get(guildId).unshift(listData);
		} else {
			throw new Error("未知的 type 代號");
		}
		return true;
	} catch (err) {
		CatchF.ErrorDo(err, "歌單新增歌曲時發生異常!");
		return false;
	}
};

/** 添加yt歌單進入歌單
 *
 * @param {*} guildId
 * @param {*} musicUrl
 */
exports.AddSongLists = async (guildId, musicListUrl) => {
	try {
		const res = await musicSourceC.GetSongList(musicListUrl);
		const videoTitles = res.songs
			.map((song, i) => `[${i + 1}] ${song.name}`)
			.slice(0, 10)
			.join("\n");
		let returnStr =
			`**加入播放清單：${musicListUrl}**\n` +
			`ID 識別碼：[${res.id}]\n` +
			`==========================\n` +
			`${videoTitles}`;
		if (res.songs.length > 10)
			returnStr += `\n……以及其他 ${res.songs.length - 10} 首歌`;
		res.songs.forEach((song) => {
			global.songList.get(guildId).push(song);
		});
		return returnStr;
	} catch (err) {
		CatchF.ErrorDo(err, "歌單新增yt歌單時發生異常!");
		return false;
	}
};

/** 播歌
 *
 * @param {*} discordObject
 * @param {*} nowSong
 * @param {*} isReplied
 * @param {*} type 0 = message 1 = interaction
 */
exports.PlayMusic = async (discordObject, nowSong, isReplied, type = 0) => {
	const guildId = BDB.MuGetGuildId(discordObject, type);
	try {
		// 提示播放音樂
		if (!isReplied) {
			const content = `🎵　播放音樂：${nowSong?.name}`;
			await BDB.MuMessageSend(discordObject, content, type, 2);
		}

		// 讀取音訊串流
		const stream = await musicSourceC.GetStream(nowSong?.url);
		// 創建音樂器
		const audioPlay = BDB.MuGetAudioPlay();
		// 播放
		BDB.MuPlayMusic(audioPlay, stream);
		global.connection.get(guildId)?.subscribe(audioPlay);
		global.dispatcher.set(guildId, audioPlay);
		// 從歌單移除播放中的歌曲
		global.songList.get(guildId)?.shift();
		audioPlay.on("stateChange", (oldState, newState) => {
			if (
				newState?.status === BDB.MuGetAudioPlayerStatus(0) &&
				oldState?.status !== BDB.MuGetAudioPlayerStatus(0)
			) {
				this.PlayNextMusic(discordObject, type);
			}
		});
		// error 事件監聽，如果出現異常案例再啟用
		// audioPlay.on('error', err => {
		//   CatchF.ErrorDo(`${err.message} with track ${err.resource.metadata.title} from guild ${guildId}`, "播放器發生異常!");
		//   BDB.MuMessageSend(discordObject, "歌曲在播放途中發生問題了..小愛先播下一首試試喔><", type);
		//   this.PlayNextMusic(discordObject, type);
		// });
	} catch (err) {
		CatchF.ErrorDo(err, "musicC.PlayMusic 方法異常!");
		global.songList.get(guildId).shift();
		await BDB.MuMessageSend(
			discordObject,
			"歌曲在播放途中發生問題了..小愛先播下一首試試喔><",
			type
		);
		this.PlayNextMusic(discordObject, type);
	}
};

/** 從歌單獲得當前歌曲
 *
 * @param {*} guildId
 * @returns
 */
exports.GetNowSong = (guildId) => {
	try {
		return global.songList.get(guildId)[0];
	} catch (err) {
		CatchF.ErrorDo(err, "獲取歌單歌曲時異常!");
	}
};

// 判斷網址是否為播放清單
exports.IsPlayList = (url) => {
	if (url.indexOf("&list") > -1 && url.indexOf("music.youtube") < 0) {
		return true;
	}

	return false;
};

/** 獲得全域 connection
 *
 * @param {*} guildId
 * @returns
 */
exports.GetConnection = (guildId) => {
	return global.connection.get(guildId);
};

/** 判斷是否正在播放歌曲
 *
 * @param {*} guildId
 * @returns
 */
exports.IsPlaying = (guildId) => {
	return global.isPlaying.get(guildId);
};

/** 控制是否正在播放歌曲
 *
 * @param {*} guildId
 * @param {*} state
 */
exports.SetIsPlaying = (guildId, state = false) => {
	global.isPlaying.set(guildId, state);
};

exports.Pause = (guildId, discordObject, type) => {
	if (global.dispatcher.get(guildId)) {
		global.dispatcher.get(guildId).pause();
		BDB.MuMessageSend(discordObject, { content: "暫停播放！" }, type);
	} else {
		// 機器人目前未加入頻道
		BDB.MuMessageSend(discordObject, { content: "要先點歌喔:3..." }, type);
	}
};

/** 恢復播放
 *
 * @param {*} guildId
 * @param {*} discordObject
 * @param {*} type
 * @returns
 */
exports.Resume = (guildId, discordObject, type) => {
	if (global.dispatcher.get(guildId)) {
		global.dispatcher.get(guildId).unpause();
		BDB.MuMessageSend(discordObject, { content: "那就繼續囉~" }, type);
	} else {
		// 機器人目前未加入頻道
		BDB.MuMessageSend(discordObject, { content: "要先點歌喔:3..." }, type);
	}
};

/** 跳過歌曲
 *
 * @param {*} guildId
 * @param {*} discordObject
 * @param {*} type
 */
exports.Skip = (guildId, discordObject, type) => {
	if (global.dispatcher.get(guildId)) {
		global.dispatcher.get(guildId).stop();
		BDB.MuMessageSend(
			discordObject,
			{ content: "咖！的一聲\n跳過了一首歌！" },
			type
		);
	} else {
		// 機器人目前未加入頻道
		BDB.MuMessageSend(discordObject, { content: "要先點歌喔:3..." }, type);
	}
};

/** 顯示歌單
 *
 * @param {*} guildId
 * @param {*} discordObject
 * @param {*} type
 */
exports.NowQueue = (guildId, discordObject, type) => {
	// 如果隊列中有歌曲就顯示
	if (global.songList.get(guildId) && global.songList.get(guildId).length > 0) {
		let queueString = "";

		// 字串處理，將 Object 組成字串
		let queue = global.songList
			.get(guildId)
			.map((item, index) => `[${index + 1}] ${item.name}`);
		if (queue.length > 10) {
			queue = queue.slice(0, 10);
			queueString = `目前歌單：\n${queue.join("\n")}\n……與其他 ${
				global.songList.get(guildId).length - 10
			} 首歌`;
		} else {
			queueString = `目前歌單：\n${queue.join("\n")}`;
		}

		BDB.MuMessageSend(discordObject, { content: queueString }, type);
	} else {
		BDB.MuMessageSend(discordObject, { content: "要先點歌喔:3..." }, type);
	}
};

/** 顯示歌單
 *
 * @param {*} guildId
 * @param {*} discordObject
 * @param {*} type
 */
exports.Sleep = (guildId, discordObject, type) => {
	// 存在語音頻道與播放器就退出
	if (global.dispatcher.get(guildId) && global.connection.get(guildId)) {
		global.dispatcher.get(guildId).stop();
		global.connection.get(guildId).destroy();
		this.InitMusicValue(guildId);
		BDB.MuMessageSend(discordObject, { content: "晚安~" }, type);
	} else {
		BDB.MuMessageSend(discordObject, { content: "要先點歌喔:3..." }, type);
	}
};

exports.NowStatus = (guildId, discordObject, type) => {
	// 存在播放器就退出
	if (global.dispatcher.get(guildId)) {
		let statusString = "";
		statusString += global.dispatcher.get(guildId).checkPlayable();
		BDB.MuMessageSend(discordObject, { content: statusString }, type);
	} else {
		BDB.MuMessageSend(discordObject, { content: "要先點歌喔:3..." }, type);
	}
};

//#endregion

//#region 內部方法

/** 播放下一首歌曲
 *
 * @param {*} discordObject
 * @param {*} type 0 = message 1 = interaction
 */
exports.PlayNextMusic = async (discordObject, type) => {
	try {
		const guildId = BDB.MuGetGuildId(discordObject, type);

		// 如果歌單還有歌曲就播放
		if (global.songList.get(guildId)?.length > 0) {
			this.PlayMusic(
				discordObject,
				global.songList.get(guildId)[0],
				false,
				type
			);
		} else {
			global.isPlaying.set(guildId, false);
			await BDB.MuMessageSend(discordObject, "播放完畢", type, 2);
		}
	} catch (err) {
		CatchF.ErrorDo(err, "PlayNextMusic 方法異常!");
	}
};

//#endregion

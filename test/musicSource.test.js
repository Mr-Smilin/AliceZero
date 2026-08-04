/**
 * 音樂來源測試
 *
 * musicSourceC 是音樂系統唯一知道「歌曲資訊與音訊怎麼來」的地方(目前是 yt-dlp)。
 * youtube 三不五時就改規則，這裡盯的是換工具時不能跑掉的東西：
 * 轉出來的歌單格式、音訊格式的判斷，以及工具不存在時要講得清楚。
 */

//#region import
const { describe, it, before, after, mock } = require("node:test");
const assert = require("node:assert/strict");
//#endregion

// 指向一個不存在的執行檔，測試不會真的去呼叫 yt-dlp 或連外網
process.env.YTDLP_PATH = "yt-dlp-不存在-測試用";

const BDB = require("../baseJS/BaseDiscordBot.js");
const musicSourceC = require("../manager/musicManager/musicSourceC.js");
const musicC = require("../manager/musicManager/musicC.js");

const guildId = "guild-1";

/** 關掉 console，避免測試錯誤路徑時洗版 */
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

describe("musicSourceC - 資料轉換", () => {
	it("影片資訊轉成歌單格式", () => {
		const song = musicSourceC.ToSong({
			id: "dQw4w9WgXcQ",
			title: "Never Gonna Give You Up",
			webpage_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		});

		assert.deepEqual(song, {
			id: "dQw4w9WgXcQ",
			name: "Never Gonna Give You Up",
			url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		});
	});

	it("播放清單裡的歌曲只有 url 也拿得到網址", () => {
		// --flat-playlist 的 entries 不會有 webpage_url
		const song = musicSourceC.ToSong({
			id: "abc",
			title: "清單裡的歌",
			url: "https://www.youtube.com/watch?v=abc",
		});

		assert.equal(song.url, "https://www.youtube.com/watch?v=abc");
	});

	it("播放清單轉成清單資訊與底下的歌曲", () => {
		const songList = musicSourceC.ToSongList({
			id: "PL123",
			title: "測試清單",
			entries: [
				{ id: "a", title: "歌一", url: "https://youtu.be/a" },
				{ id: "b", title: "歌二", url: "https://youtu.be/b" },
			],
		});

		assert.equal(songList.id, "PL123");
		assert.equal(songList.name, "測試清單");
		assert.deepEqual(
			songList.songs.map((song) => song.name),
			["歌一", "歌二"]
		);
	});

	it("沒有歌曲的播放清單不會炸掉", () => {
		assert.deepEqual(musicSourceC.ToSongList({ id: "PL0" }).songs, []);
	});

	it("webm(opus) 直接播，其餘交給 ffmpeg 轉檔", () => {
		assert.equal(
			musicSourceC.ToStreamType("webm", "opus"),
			BDB.MuGetStreamType(0),
			"webm/opus 應該直接播"
		);
		assert.equal(
			musicSourceC.ToStreamType("m4a", "mp4a.40.2"),
			BDB.MuGetStreamType(3)
		);
		assert.equal(musicSourceC.ToStreamType(), BDB.MuGetStreamType(3));
	});
});

describe("musicSourceC - 找不到 yt-dlp", () => {
	it("錯誤訊息要指出是 yt-dlp 的問題", async () => {
		await assert.rejects(() => musicSourceC.GetSong("https://youtu.be/a"), {
			message: /找不到 yt-dlp/,
		});
	});

	it("播放清單與串流同樣會回報", async () => {
		await assert.rejects(() => musicSourceC.GetSongList("https://youtu.be/a"), {
			message: /找不到 yt-dlp/,
		});
		await assert.rejects(() => musicSourceC.GetStream("https://youtu.be/a"), {
			message: /找不到 yt-dlp/,
		});
	});
});

describe("musicC - 歌單操作", () => {
	before(() => {
		global.isPlaying = new Map();
		global.songList = new Map();
		global.connection = new Map();
		global.dispatcher = new Map();
		musicC.InitMusicValue(guildId);
	});

	after(() => mock.restoreAll());

	it("點歌會把歌加到歌單最後面，插播加到最前面", async () => {
		mock.method(musicSourceC, "GetSong", async (musicUrl) => ({
			id: musicUrl,
			name: `歌 ${musicUrl}`,
			url: musicUrl,
		}));

		assert.equal(await musicC.AddSongList(guildId, "a"), true);
		assert.equal(await musicC.AddSongList(guildId, "b"), true);
		assert.equal(await musicC.AddSongList(guildId, "c", 1), true);

		assert.deepEqual(
			global.songList.get(guildId).map((song) => song.id),
			["c", "a", "b"]
		);
		assert.equal(musicC.GetNowSong(guildId).name, "歌 c");
		mock.restoreAll();
	});

	it("來源出問題時回傳 false，不會讓 bot 掛掉", async () => {
		mock.method(musicSourceC, "GetSong", async () => {
			throw new Error("找不到 yt-dlp");
		});

		const result = await silence(() => musicC.AddSongList(guildId, "壞掉的網址"));
		assert.equal(result, false);
		mock.restoreAll();
	});

	it("加入播放清單會回報清單內容並把歌全部排進去", async () => {
		musicC.InitMusicValue(guildId);
		mock.method(musicSourceC, "GetSongList", async () => ({
			id: "PL123",
			name: "測試清單",
			songs: Array.from({ length: 12 }, (_, i) => ({
				id: `id${i}`,
				name: `歌${i}`,
				url: `https://youtu.be/id${i}`,
			})),
		}));

		const message = await musicC.AddSongLists(guildId, "https://list");

		assert.match(message, /ID 識別碼：\[PL123\]/);
		assert.match(message, /\[1\] 歌0/);
		assert.match(message, /以及其他 2 首歌/, "超過 10 首要提示還有幾首");
		assert.equal(global.songList.get(guildId).length, 12);
		mock.restoreAll();
	});

	it("判斷播放清單網址", () => {
		assert.equal(
			musicC.IsPlayList("https://www.youtube.com/watch?v=a&list=PL123"),
			true
		);
		assert.equal(musicC.IsPlayList("https://www.youtube.com/watch?v=a"), false);
		assert.equal(
			musicC.IsPlayList("https://music.youtube.com/watch?v=a&list=PL123"),
			false,
			"music.youtube 的 list 參數不算播放清單"
		);
	});
});

describe("musicM - 點歌流程", () => {
	const musicM = require("../manager/musicManager/musicM.js");

	/** 模擬使用者在語音頻道內發的訊息 */
	function newFakeMessage() {
		const sent = [];
		return {
			guild: { id: guildId },
			channel: { id: "c-1", send: async (message) => sent.push(message) },
			member: { voice: { channel: { id: "v-1" } } },
			sent,
		};
	}

	before(() => {
		global.isPlaying = new Map();
		global.songList = new Map();
		global.connection = new Map();
		global.dispatcher = new Map();
		musicC.InitMusicValue(guildId);
		// 讓 bot 看起來已經在語音頻道，跳過實際加入頻道的動作
		global.connection.set(guildId, { subscribe: () => {} });
	});

	after(() => mock.restoreAll());

	it("讀不到歌曲時回報使用者，不會開始播放", async () => {
		mock.method(musicC, "AddSongList", async () => false);
		mock.method(musicC, "PlayMusic", async () => {});
		const msg = newFakeMessage();

		await musicM.DoPlayMusic(msg, "https://youtu.be/壞掉的網址");

		assert.match(msg.sent[0], /讀不到/);
		assert.equal(musicC.PlayMusic.mock.callCount(), 0, "不該進到播放");
		assert.equal(musicC.IsPlaying(guildId), false);
		mock.restoreAll();
	});

	it("插播讀不到歌曲時同樣會回報", async () => {
		mock.method(musicC, "AddSongList", async () => false);
		mock.method(musicC, "PlayMusic", async () => {});
		const msg = newFakeMessage();

		await musicM.DoPlayMusicFirst(msg, "https://youtu.be/壞掉的網址");

		assert.match(msg.sent[0], /讀不到/);
		assert.equal(musicC.PlayMusic.mock.callCount(), 0);
		mock.restoreAll();
	});

	it("讀得到就會開始播放", async () => {
		mock.method(musicC, "AddSongList", async () => {
			global.songList.get(guildId).push({ id: "a", name: "歌 a", url: "a" });
			return true;
		});
		mock.method(musicC, "PlayMusic", async () => {});
		const msg = newFakeMessage();

		await musicM.DoPlayMusic(msg, "https://youtu.be/a");

		assert.match(msg.sent[0], /播放音樂：歌 a/);
		assert.equal(musicC.PlayMusic.mock.callCount(), 1);
		mock.restoreAll();
	});
});

describe("musicC - 離開語音頻道", () => {
	/** 模擬使用者訊息 */
	function newFakeMessage() {
		const sent = [];
		return {
			guild: { id: guildId },
			channel: { id: "c-1", send: async (message) => sent.push(message) },
			member: { voice: { channel: { id: "v-1" } } },
			sent,
		};
	}

	/** 讓 bot 看起來在語音頻道 */
	function joinVoice() {
		const destroyed = [];
		global.connection.set(guildId, { destroy: () => destroyed.push(true) });
		return destroyed;
	}

	before(() => {
		global.isPlaying = new Map();
		global.songList = new Map();
		global.connection = new Map();
		global.dispatcher = new Map();
	});

	it("歌單沒歌也照樣退出語音頻道", () => {
		musicC.InitMusicValue(guildId);
		const destroyed = joinVoice();
		const msg = newFakeMessage();

		musicC.Sleep(guildId, msg, 0);

		assert.deepEqual(destroyed, [true], "應該離開語音頻道");
		assert.deepEqual(msg.sent, [{ content: "晚安~" }]);
		assert.equal(global.connection.get(guildId), undefined, "狀態要被清乾淨");
	});

	it("正在播歌時會先停掉播放器再退出", () => {
		musicC.InitMusicValue(guildId);
		const destroyed = joinVoice();
		const stopped = [];
		global.dispatcher.set(guildId, { stop: () => stopped.push(true) });

		musicC.Sleep(guildId, newFakeMessage(), 0);

		assert.deepEqual(stopped, [true]);
		assert.deepEqual(destroyed, [true]);
	});

	it("本來就不在語音頻道時只回覆訊息", () => {
		musicC.InitMusicValue(guildId);
		const msg = newFakeMessage();

		musicC.Sleep(guildId, msg, 0);

		assert.match(msg.sent[0].content, /不在頻道/);
	});

	it("連線已經失效時不會讓 bot 掛掉，狀態一樣清乾淨", async () => {
		musicC.InitMusicValue(guildId);
		global.connection.set(guildId, {
			destroy: () => {
				throw new Error("已經斷線了");
			},
		});
		const msg = newFakeMessage();

		await silence(() => musicC.Sleep(guildId, msg, 0));

		assert.deepEqual(msg.sent, [{ content: "晚安~" }]);
		assert.equal(global.connection.get(guildId), undefined);
	});
});

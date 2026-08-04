//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const { spawn } = require("node:child_process"); // 用於呼叫 yt-dlp
const CatchF = require("../../baseJS/CatchF.js");
require("dotenv").config();
//#endregion

/** 音樂來源控制器
 *
 *  全專案只有這個檔案知道歌曲資訊與音訊是怎麼來的。
 *  youtube 每隔一段時間就會改規則，把相依集中在這裡，之後換工具只要改這一支。
 *  目前使用 yt-dlp(需要另外安裝，可用 .env 的 YTDLP_PATH 指定位置)。
 */

// yt-dlp 執行檔，沒設定就找 PATH 上的 yt-dlp
const ytdlpPath = process.env.YTDLP_PATH || "yt-dlp";
// 只要音訊，優先挑 discord 可以直接播的 webm(opus)，避免多一層轉檔
const audioFormat =
	"bestaudio[ext=webm][acodec=opus]/bestaudio[acodec=opus]/bestaudio";
// 每次呼叫都要帶的參數
const baseArgs = ["--no-warnings", "--ignore-config"];

//#region 內部方法

/** 執行 yt-dlp，回傳 stdout 的文字
 *
 * @param {string[]} args yt-dlp 參數
 * @returns {Promise<string>}
 */
const runYtdlp = (args) =>
	new Promise((resolve, reject) => {
		const ytdlp = spawn(ytdlpPath, [...baseArgs, ...args]);
		let stdout = "";
		let stderr = "";

		ytdlp.stdout.on("data", (data) => (stdout += data));
		ytdlp.stderr.on("data", (data) => (stderr += data));
		// 找不到執行檔會走這裡
		ytdlp.on("error", (err) =>
			reject(new Error(`找不到 yt-dlp (${ytdlpPath})，請先安裝: ${err.message}`))
		);
		ytdlp.on("close", (code) =>
			code === 0
				? resolve(stdout)
				: reject(new Error(`yt-dlp 結束代碼 ${code}: ${stderr.trim()}`))
		);
	});

//#endregion

//#region 資料轉換

/** 把 yt-dlp 的影片資訊轉成歌單格式
 *
 * @param {*} data yt-dlp --dump-single-json 的結果
 */
exports.ToSong = (data) => ({
	id: data?.id,
	name: data?.title,
	// 用 yt-dlp 給的網址，使用者貼的網址可能帶一堆參數
	url: data?.webpage_url ?? data?.url,
});

/** 把 yt-dlp 的播放清單資訊轉成歌單格式
 *
 * @param {*} data yt-dlp --flat-playlist --dump-single-json 的結果
 */
exports.ToSongList = (data) => ({
	id: data?.id,
	name: data?.title,
	songs: (data?.entries ?? []).map((entry) => this.ToSong(entry)),
});

/** 判斷音訊要用哪種格式播放
 *
 * @param {string} ext 副檔名
 * @param {string} acodec 音訊編碼
 */
exports.ToStreamType = (ext = "", acodec = "") =>
	ext === "webm" && acodec.startsWith("opus")
		? BDB.MuGetStreamType(0)
		: BDB.MuGetStreamType(3);

//#endregion

//#region 主要方法

/** 取得單一歌曲資訊
 *
 * @param {string} musicUrl
 * @returns {Promise<*>} 歌單格式的歌曲
 */
exports.GetSong = async (musicUrl) => {
	const data = await runYtdlp([
		"--dump-single-json",
		"--no-playlist",
		musicUrl,
	]);
	return this.ToSong(JSON.parse(data));
};

/** 取得播放清單資訊
 *
 * @param {string} musicListUrl
 * @returns {Promise<*>} 清單資訊與底下所有歌曲
 */
exports.GetSongList = async (musicListUrl) => {
	const data = await runYtdlp([
		"--dump-single-json",
		"--flat-playlist",
		musicListUrl,
	]);
	return this.ToSongList(JSON.parse(data));
};

/** 取得音訊串流
 *
 * @param {string} musicUrl
 * @returns {Promise<*>} BDB.MuPlayMusic 吃的 { stream, type }
 */
exports.GetStream = async (musicUrl) => {
	// 先問這次會挑到什麼格式，決定要不要讓 ffmpeg 轉檔
	const format = await runYtdlp([
		"--no-playlist",
		"-f",
		audioFormat,
		"--print",
		"%(ext)s|%(acodec)s",
		musicUrl,
	]);
	const [ext, acodec] = format.trim().split("|");

	// 音訊直接輸出到 stdout，邊下載邊播
	const ytdlp = spawn(ytdlpPath, [
		...baseArgs,
		"--no-playlist",
		"-f",
		audioFormat,
		"-o",
		"-",
		musicUrl,
	]);
	ytdlp.on("error", (err) => CatchF.ErrorDo(err, "yt-dlp 串流異常!"));
	// 跳過或播完時 discord 會關掉串流，順手把 yt-dlp 收掉，不然會留下殭屍程序
	ytdlp.stdout.once("close", () => ytdlp.kill());

	return {
		stream: ytdlp.stdout,
		type: this.ToStreamType(ext, acodec),
	};
};

//#endregion

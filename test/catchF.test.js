/**
 * 錯誤與日誌出口測試
 *
 * 線上出事時只看得到 console，所以這裡盯的是「訊息夠不夠用來定位問題」：
 * 錯在哪個檔案第幾行、是 Error 的話有沒有堆疊、什麼時候發生的。
 */

//#region import
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const CatchF = require("../baseJS/CatchF.js");
//#endregion

/** 攔下 console 輸出，回傳印出來的每一行 */
function catchConsole(doSomeThing) {
	const rawLog = console.log;
	const rawError = console.error;
	const lines = [];
	console.log = (data) => lines.push(`${data}`);
	console.error = (data) => lines.push(`${data}`);
	try {
		return { result: doSomeThing(), lines };
	} finally {
		console.log = rawLog;
		console.error = rawError;
	}
}

describe("CatchF - 錯誤訊息", () => {
	it("帶出呼叫位置的檔名與行數", () => {
		const { result, lines } = catchConsole(() =>
			CatchF.ErrorDo("MContent 方法異常!")
		);

		assert.match(result, /MContent 方法異常!/);
		assert.match(
			result,
			/catchF\.test\.js:\d+:\d+/,
			`看不出是哪一行呼叫的: ${result}`
		);
		assert.match(lines[0], /catchF\.test\.js:\d+:\d+/);
	});

	it("帶出發生時間", () => {
		const { result } = catchConsole(() => CatchF.ErrorDo("壞掉了"));
		assert.match(result, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
	});

	it("是 Error 物件時連呼叫堆疊一起印出來", () => {
		const { lines } = catchConsole(() => {
			try {
				undefined.substring(0, 4);
			} catch (err) {
				CatchF.ErrorDo(err, "DoMStart 方法異常!");
			}
		});

		const output = lines.join("\n");
		assert.match(output, /Cannot read properties of undefined/);
		assert.match(output, /DoMStart 方法異常!/);
		assert.match(output, /\n\s+at /, "應該要有呼叫堆疊");
	});

	it("字串錯誤不會印出多餘的堆疊", () => {
		const { lines } = catchConsole(() => CatchF.ErrorDo("只是訊息"));
		assert.equal(
			lines.some((line) => line.includes("\n    at ")),
			false
		);
	});

	it("回傳值仍然是印出來的訊息，讓取值失敗的介面可以直接回傳", () => {
		// BaseDiscordBot 的取值方法會把這個字串當成回傳值
		const { result } = catchConsole(() => CatchF.ErrorDo("MGetGuildId 方法異常!"));
		assert.equal(typeof result, "string");
		assert.match(result, /MGetGuildId 方法異常!/);
	});
});

describe("CatchF - 一般日誌", () => {
	it("帶時間但不帶堆疊", () => {
		const { result, lines } = catchConsole(() =>
			CatchF.LogDo("Logged in as Alice!")
		);

		assert.match(result, /Logged in as Alice!/);
		assert.match(result, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
		assert.equal(
			lines.some((line) => line.includes("\n    at ")),
			false
		);
	});
});

// 全專案的錯誤與日誌出口
// 錯誤一律帶上呼叫位置(檔名:行數)，是 Error 物件時再附上呼叫堆疊，方便回頭找問題

/** 取得現在時間，格式 2026-08-05 10:12:33 */
function getNowTime() {
    return new Date().toLocaleString("sv-SE");
}

/** 從呼叫堆疊取出呼叫者的位置
 *
 * @param {number} deep 往上第幾層 0 = 呼叫 getCallerPlace 的人
 * @returns {string} Ex: musicM.js:56:12
 */
function getCallerPlace(deep = 0) {
    try {
        // 0 = Error 本身 1 = getCallerPlace 2 = ErrorDo/LogDo 3 = 真正的呼叫者
        const stackLine = new Error().stack?.split("\n")[3 + deep] ?? "";
        // 取出 檔名:行數:欄數，路徑太長只留檔名
        const place = stackLine.match(/([^\\/(\s]+:\d+:\d+)\)?\s*$/);
        return place ? place[1] : "";
    } catch (err) {
        return "";
    }
}

/** 記錄錯誤
 *
 * @param {*} data 錯誤內容，可以是 Error 物件或字串
 * @param {string} name 這是哪裡出的錯
 * @returns {string} 印出來的訊息
 */
exports.ErrorDo = function (data, name = "Error") {
    const errorDoData = ` | ${data} | ${name} | ${getCallerPlace()} | ${getNowTime()}`;
    console.error(errorDoData);
    // Error 物件才有堆疊，印出來才知道是從哪一層炸的
    if (data instanceof Error && data.stack) console.error(data.stack);
    console.log("==========");
    return errorDoData;
}

/** 記錄訊息
 *
 * @param {*} data 訊息內容
 * @param {string} name 補充說明
 * @returns {string} 印出來的訊息
 */
exports.LogDo = function (data, name = "") {
    const logDoData = ` | ${data} | ${name} | ${getNowTime()}`;
    console.log(logDoData);
    console.log("==========");
    return logDoData;
}

exports.EmptyDo = function (data = "") { }

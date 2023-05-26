//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const fs = require("node:fs"); // 用於讀寫檔案
const path = require("node:path"); // 用於處理路徑
const axios = require("axios");
const CatchF = require("../../baseJS/CatchF.js");
require('dotenv').config();
// json
//#endregion

const selectMethod = async (url, method, body = {}) => {
  switch (method) {
    case "GET":
      return await axios.get(url);
    case "POST":
      return await axios.post(url, body);
  }
}

const getData = async (url, method = "GET", callback = async () => { }) => {
  try {
    const response = await selectMethod(url, method);
    const data = response.data;
    await callback(data);
    return data;
  } catch (err) {
    CatchF.ErrorDo(err, "下載檔案時發生異常");
    throw new Error(err);
  }
}

exports.CheckData = () => {
  try {
    return !!process.env.GASURL_LEVELS
      && !!process.env.GASURL_SKILLS
      && !!process.env.GASURL_BOSSES
  }
  catch (err) {
    CatchF.ErrorDo(err, "檢查 mykirito .env 資料時發生異常!");
    return false;
  }
}

exports.DownloadData = async () => {
  try {
    CatchF.LogDo("Started Dowload myKirito Data");
    // 讀取 commands 資料夾下的 js 檔案
    const requestsPath = path.join(__dirname, "requests");
    const requestFiles = fs.readdirSync(requestsPath).filter((file) => file.endsWith(".js"));

    // 將指令加入 Collection
    for (const file of requestFiles) {
      const filePath = path.join(requestsPath, file);
      const request = require(filePath);

      // 在 Collection 中以指令名稱作為 key，指令模組作為 value 加入
      if ("url" in request && "method" in request) {
        await getData(request.url, request.method, request?.callback);
      } else {
        CatchF.LogDo(`[警告] ${filePath} 中的指令缺少必要的 "url" 或 "method" 屬性。`);
      }
    }
    global.isMykirito = true;
    CatchF.LogDo("Successfully Dowload myKirito Data");
  } catch (err) {
    CatchF.ErrorDo(err, "myKirito 資料下載失敗!");
  }
}

exports.IsOk = () => {
  return global.isMykirito;
}

exports.Start = async (msg, cmd, args) => {
  // 讀取 commands 資料夾下的 js 檔案
  const requestsPath = path.join(__dirname, "requests");
  const requestFiles = fs.readdirSync(requestsPath).filter((file) => file.endsWith(".js"));

  for (const file of requestFiles) {
    const filePath = path.join(requestsPath, file);
    const request = require(filePath);

    if (request.data.name === cmd) {
      await request.execute(msg, cmd, args);
      break;
    }
  }
}
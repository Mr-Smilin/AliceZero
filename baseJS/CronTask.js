// 載入env變量
require('dotenv').config();
const CatchF = require("./CatchF.js");
const schedule = require('node-schedule')
const axios = require("axios");

// 定時呼叫自己，防止睡眠
exports.cronCallMysell = function () {
  schedule.scheduleJob('*/5 * * * *', async () => {
    try {
      const response = await getData(process.env.HOME_PAGE, "GET", configs);
      CatchF.LogDo(response, "自我呼叫 response");
    }
    catch (err) {
      CatchF.ErrorDo(err, "自我呼叫異常!");
    }
  })
};

const configs = {
  headers: {
    "Content-Type": "application/json",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
  },
}

const selectMethod = async (url, method, config) => {
  switch (method) {
    case "GET":
      return await axios.get(url, config);
    case "POST":
      return await axios.post(url, config);
  }
}

const getData = async (url, method = "GET", config = {}, callback = async () => { }) => {
  try {
    const response = await selectMethod(url, method, config);
    const data = response.data;
    await callback(data);
    return data;
  } catch (err) {
    CatchF.ErrorDo(err, "下載檔案時發生異常");
    throw new Error(err);
  }
}
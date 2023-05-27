// 載入env變量
require('dotenv').config();
const CatchF = require("./CatchF.js");
const schedule = require('node-schedule')
const axios = require("axios");

// 定時呼叫自己，防止睡眠
exports.cronCallMysell = function () {
  schedule.scheduleJob('*/5 * * * *', async () => {
    try {
      await getData(process.env.HOME_PAGE);
    }
    catch (err) {
      CatchF.ErrorDo(err, "自我呼叫異常!");
    }
  })
};

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
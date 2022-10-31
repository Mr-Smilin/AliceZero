// 載入env變量
require('dotenv').config();
const schedule = require('node-schedule')
const request = require('request');

// 定時呼叫自己，防止睡眠
exports.cronCallMysell = function () {
  schedule.scheduleJob('*/10 * * * *', () => {
    const myPage = {
      'method': 'GET',
      'url': process.env.HOME_PAGE,
      'headers': {}
    };

    request(myPage, () => { });
  })
};
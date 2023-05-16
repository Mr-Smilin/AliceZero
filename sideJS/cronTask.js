const schedule = require('node-schedule')
const request = require('request');
require('dotenv').config();

// 定時呼叫自己，防止睡眠
exports.cronCallMysell = function () {
  const myPage = {
    'method': 'GET',
    'url': process.env.HOME_PAGE,
    'headers': {}
  };
  request(myPage, () => { });
  schedule.scheduleJob('*/10 * * * *', () => {
    request(myPage, () => { });
  })
};
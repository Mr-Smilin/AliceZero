const axios = require('axios');

//獲取botMessage的全部資料
exports.getDataFormBotMessage = function (callback) {
  const config = {
    method: 'post',
    url: process.env.MYDATABASE_GETDATAFORMBOTMESSAGE,
    headers: {}
  };

  axios(config)
    .then(function (response) {
      //callback(JSON.stringify(response.data));
      callback(JSON.parse(JSON.stringify(response.data)));
    })
    .catch(function (error) {
      console.log('ERROR#MyDataBase#01');
      callback(undefined);
    });
}

//獲取userMessage的全部資料
exports.getDataFormUserMessage = function (callback) {
  const config = {
    method: 'post',
    url: process.env.MYDATABASE_GETDATAFORMUSERMESSAGE,
    headers: {}
  };

  axios(config)
    .then(function (response) {
      //callback(JSON.stringify(response.data));
      callback(JSON.parse(JSON.stringify(response.data)));
    })
    .catch(function (error) {
      console.log('ERROR#MyDataBase#02');
      callback(undefined);
    });
}
var request = require('request');

// 使用簡易查詢，撈推特資料
exports.getTweet = function(searchText, callback) {
    const search = {
        'method': 'GET',
        'url': process.env.TWITTER_SEARCH+searchText,
        'headers': {
            'Authorization': process.env.TWITTER_TOKEN
        }
    };
    const backValue = new Array;
    request(search, function(error, response) {
        if (error) {
            callback(error,'error');
        } else {
            let data = JSON.parse(response.body);
            let lLength = data?.data?.length > 5 ? 5 : data?.data?.length;
            for(let i = 0;i<lLength;i++){
                if(data?.data[i]?.text === "") continue;
                if(data?.data[i]?.text?.indexOf("https:") === -1) continue;
                let tempData = data?.data[i]?.text?.split("https:");
                backValue.push(tempData[0]);
                backValue.push("https:"+tempData[1]);
            }
            callback(backValue,'ok');
        }
    });
};
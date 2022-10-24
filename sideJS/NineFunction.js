//愛麗絲頻掃地方法
var request = require('request');
// const auth = require('../jsonHome/auth.json');

const nineGet = {
    'method': 'GET',
    'url': process.env.NINEFUNCTION_GET,
    'headers': {}
};

exports.GetNineData = function(callback) {
    let backValue = new Array;
    request(nineGet, function(error, response) {
        try {
            if (error) {
                console.log('getNineDataError1', error);
                callback(false);
            } else {
                const data = JSON.parse(response.body); //接收回傳(response)的body
                let num = 0;
                for (i in data) {
                    num = data[i].num;
                    if (num == '') num = 1;
                    for (j = 0; j < num; j++) {
                        backValue.push(data[i]);
                    }
                }
                callback(RandomNineData(backValue, (backValue) => { return backValue }));
            }
        } catch (err) {
            console.log(err, ' getNineDataError');
        }
    })
}

exports.randomNineData = RandomNineData;

function RandomNineData(data, callback) {
    const randomArray = data.sort(function() {
        return .5 - Math.random();
    });
    return callback(randomArray);
}
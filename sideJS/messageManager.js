const { indexOf } = require("ffmpeg-static");

const color = '#fbfbc9';
const title = 'A.L.I.C.E.';
const Author = 'アリス・ツーベルク';
const Author2 = 'https://i.imgur.com/crrk7I2.png';
const Author3 = 'https://home.gamer.com.tw/homeindex.php';
const Description = '人工高適應性知性自律存在';
const Thumbnail = 'https://i.imgur.com/5ffD6du.png';
const Field = '小愛#0143';
const Field2 = '主人您好，請問有何吩咐?';
//07群的都是變態484
//Season生日快樂٩(｡・ω・｡)﻿و
const footerText = 'DeasonDio生日快樂٩(｡・ω・｡)﻿و';
const footerPicture = 'https://i.imgur.com/crrk7I2.png';

//help romID:0
exports.HelpMessage = function(RichEmbed, callback) {
    const embed = new RichEmbed()
        .setColor(color)
        .setTitle(title)
        //.setURL('https://i.imgur.com/UV6lgWg.jpg')
        .setAuthor(Author, Author2, Author3)
        .setDescription(Description)
        .setThumbnail(Thumbnail)
        .addField(Field, Field2)
        .addField('\u200B', '\u200B', false)
        .addField('系統命令', '神聖術語 ~')
        .addField('help', '幫助指令', true)
        .addField('s {貼圖編號}', '根據編號反饋貼圖(如果小愛有的話)', true)
        .addField('dice [範圍] [標題]', '小愛扔骰子', true)
        .addField('貓', '貓咪', true)
        .addField('食物', '請務必在晚上使用', true)
        .addField('\u200B', '\u200B', true)
        .addField('\u200B', '\u200B', false)
        .addField('如果要查詢其他指令的話...', '記得神聖術語都有空格喔!')
        .addField('請小愛播放歌曲', '~ help !')
        .addField('查詢攻略組們努力製作的表單', '~ help 攻略組')
        .addField('找小愛一起玩遊戲', '~ help T')
        .addField('\u200B', '\u200B', false)
        .addField('以上是目前小愛開放的指令', '除此以外..')
        .addField('回答', '有時會在大家聊天時回應大家的話', true)
        .addField('紀錄', '小愛會記下誰偷偷刪除訊息', true)
        .addField('情報', '無限期支持myShino計畫~', true)
        //.setImage('https://i.imgur.com/wSTFkRM.png')
        .setTimestamp()
        .setFooter(footerText, footerPicture);
    callback(embed);
}

//播歌
exports.HelpMessage2 = function(RichEmbed, callback) {
    const embed = new RichEmbed()
        .setColor(color)
        .setTitle('System call generate music function..')
        .setAuthor(Author, Author2, Author3)
        .setDescription('音樂指令')
        .setThumbnail(Thumbnail)
        .addField('\u200B', '\u200B', false)
        .addField('請小愛播放歌曲', '神聖術語 !')
        .addField('Alice', '小愛的遙控器', true)
        .addField('{網址}', '將歌曲放入播放隊列', true)
        .addField('\u200B', '\u200B', true)
        .addField('休息', '小愛就會去休息', true)
        .addField('先播這個 {網址}', '可以請小愛插播歌曲', true)
        .addField('\u200B', '\u200B', true)
        .setTimestamp()
        .setFooter(footerText, footerPicture);
    callback(embed);
}

//攻略組
exports.HelpMessage3 = function(RichEmbed, callback) {
    const embed = new RichEmbed()
        .setColor(color)
        .setTitle('system call generate MBC function...')
        .setAuthor(Author, Author2, Author3)
        .setDescription('攻略組指令')
        .setThumbnail(Thumbnail)
        .addField('\u200B', '\u200B', false)
        .addField('查詢攻略組們努力製作的表單', '神聖術語 攻略組')
        .addField('轉生點 {等級} [範圍]', '查詢各等級的轉生點', true)
        .addField('情報 {角色名稱}', '查詢各角色的技能&資訊', true)
        .addField('\u200B', '\u200B', true)
        .addField('成就', '可以查成就表了!', true)
        .addField('樓層', '查詢樓層Boss資訊', true)
        .setTimestamp()
        .setFooter(footerText, footerPicture);
    callback(embed);
}

//TRpg
exports.HelpMessage4 = function(RichEmbed, callback) {
    const embed = new RichEmbed()
        .setColor(color)
        .setTitle('system call generate TRpg function...')
        .setAuthor(Author, Author2, Author3)
        .setDescription('遊戲輔助指令')
        .setThumbnail(Thumbnail)
        .addField('\u200B', '\u200B', false)
        .addField('找小愛一起玩遊戲', '神聖術語 T')
        .addField('dice [次數A] [次數B]', '請小愛擲骰子', true)
        .addField('[次數A]', '預設1次，可接受如 2D12 & 3B12>6 等格式', true)
        .addField('[次數B]', '預設1次，指定整個行為的次數', true)
        .addField('排序 [內容]*n', '請小愛幫忙打亂排序', true)
        .setTimestamp()
        .setFooter(footerText, footerPicture);
    callback(embed);
}

//EditRomValue romID:2
exports.EditRomValueMessage = function(RichEmbed, channel, romValue, callback) {
    let embed = new RichEmbed()
        .setColor('#6A6AFF')
        .setTitle('觸發詞修改')
        .setAuthor('サチ', 'https://i.imgur.com/UV6lgWg.jpg', 'https://home.gamer.com.tw/homeindex.php')
        .setDescription('可修改內容如下')
        .setTimestamp()
        .setFooter('07群的都是變態484', 'https://i.imgur.com/crrk7I2.png');

    //固定資料
    for (let i = 0; i <= romValue.length - 1; i++) {
        if (romValue[i].canEdit) {
            let
                id = romValue[i].id,
                name = romValue[i].name,
                value = romValue[i].value;

            embed = embed.addField(id, name + ' ' + value);
        }
    }

    callback(embed);
}

exports.TwitterEmbed = function(RichEmbed,data,callback){
    const embed = new RichEmbed()
        .setColor(color)
        .setTitle('system call generate Twitter function...')
        .setAuthor(Author, Author2, Author3)
        .setDescription('搜尋結果如下')
        .setThumbnail(Thumbnail)
        .setTimestamp()
        .setFooter('似乎從世界盡頭帶回了一些不堪入目的東西...', footerPicture);
    for(let i = 0;i<data?.length;i=i+2){
        embed.addField(data[i],data[i+1]);
    }
    callback(embed);
}


//RichEmbed演示
// new RichEmbed()
//   .setColor('#0099ff')
//   .setTitle('Some title')
//   .setURL('https://discord.js.org/')
//   .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
//   .setDescription('Some description here')
//   .setThumbnail('https://i.imgur.com/wSTFkRM.png')
//   .addField('Regular field title', 'Some value here')
//   .addField('\u200B', '\u200B')
//   .addField('Inline field title', 'Some value here', true)
//   .addField('Inline field title', 'Some value here', true)
//   .addField('Inline field title', 'Some value here', true)
//   .setImage('https://i.imgur.com/wSTFkRM.png')
//   .setTimestamp()
//   .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
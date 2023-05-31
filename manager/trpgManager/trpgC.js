//#region import
// Discord
const BDB = require("../../baseJS/BaseDiscordBot.js");
// js
const CatchF = require("../../baseJS/CatchF.js");
// json
//#endregion

//TRpg骰
exports.getTRpgDice = (msg, args) => {
  try {
    const regex = [
      /^[0-9]*$/,
      /^[0-9]*[Bb][0-9]*>[0-9]*$/,
      /^[0-9]*[Bb][0-9]*$/,
      /^[0-9]*[Dd][0-9]*>[0-9]*$/,
      /^[0-9]*[Dd][0-9]*$/
    ];

    regex.forEach(async element => {
      if (element.test(args[0])) {
        if (args[1] != undefined) {
          if (parseFloat(args[1]) > 5) args[1] = 5;
          const forEnd = args[1];
          for (j = 0; j < forEnd; j++) await getTRpgDice2(msg, args, regex.indexOf(element));
        } else {
          await getTRpgDice2(msg, args, regex.indexOf(element));
        }
        return true;
      }
    })
  } catch (err) {
    CatchF.ErrorDo(err, 'getTRpgDice 方法異常!');
  }
}

async function getTRpgDice2(msg, args, typeED) {
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
    await BDB.MSend(msg, mStr, 1);
  } catch (err) {
    CatchF.ErrorDo(err, 'getTRpgDice2 方法異常!');
  }
}
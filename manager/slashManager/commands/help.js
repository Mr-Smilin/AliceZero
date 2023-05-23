//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const componentM = require("../../componentManager/componentM.js");
//#endregion

module.exports = {
  data: BDB.SNewSlashCommand("help", "查詢指令"),
  async execute(interaction) {
    // 使用者輸入指令後程式要做的事
    BDB.ISend(interaction, componentM.GetHelpMessage(this));
  },
  selectMenu: {
    data: [
      {
        label: "🎧 音樂系統",
        description: "想要聽音樂的靠過來!",
        value: "music"
      }, {
        label: "You can select me too",
        description: "This is also a description",
        value: "second_option",
      },
    ],
    music: {
      async execute(interaction) {
        BDB.ISend(interaction, "music");
      }
    },
    second_option: {
      async execute(interaction) {
        BDB.ISend(interaction, "music", 1);
      }
    },
  }
};
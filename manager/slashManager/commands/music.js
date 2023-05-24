//#region import
// discord
const BDB = require("../../../baseJS/BaseDiscordBot.js");
// js
const componentM = require("../../componentManager/componentM.js");
//#endregion

const subcommandPlay = () => {
  return {
    name: "play",
    description: "播放",
    options: [{
      name: "url",
      description: "網址",
      required: true,
      type: "string"
    }]
  };
}

const musicSlash = () => {
  const command = BDB.SNewSlashCommand("music", "音樂指令");
  BDB.SPushOption(
    command,
    "subcommand",
    subcommandPlay().name,
    subcommandPlay().description,
    false,
    subcommandPlay().options
  );
  return command;
};

module.exports = {
  data: musicSlash(),
  async execute(interaction) {
    // 使用者輸入指令後程式要做的事
    BDB.ISend(interaction, componentM.GetMusicMessage());
  },
  subcommand: {
    play: {
      data: subcommandPlay(),
      async execute(interaction) {
        BDB.ISend(interaction, "yooo");
      }
    }
  }
};
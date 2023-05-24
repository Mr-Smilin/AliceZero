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

const subcommandInsert = () => {
  return {
    name: "insert",
    description: "插播",
    options: [{
      name: "url",
      description: "網址",
      required: true,
      type: "string"
    }]
  };
}

const subcommandPause = () => {
  return {
    name: "pause",
    description: "暫停",
  };
}

const subcommandResume = () => {
  return {
    name: "resume",
    description: "恢復",
  };
}

const subcommandSkip = () => {
  return {
    name: "skip",
    description: "跳過",
  };
}

const subcommandNowQueue = () => {
  return {
    name: "nowqueue",
    description: "歌單",
  };
}

const subcommandSleep = () => {
  return {
    name: "sleep",
    description: "休息",
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
  BDB.SPushOption(
    command,
    "subcommand",
    subcommandInsert().name,
    subcommandInsert().description,
    false,
    subcommandInsert().options
  );
  BDB.SPushOption(
    command,
    "subcommand",
    subcommandPause().name,
    subcommandPause().description,
    false
  );
  BDB.SPushOption(
    command,
    "subcommand",
    subcommandResume().name,
    subcommandResume().description,
    false
  );
  BDB.SPushOption(
    command,
    "subcommand",
    subcommandSkip().name,
    subcommandSkip().description,
    false
  );
  BDB.SPushOption(
    command,
    "subcommand",
    subcommandNowQueue().name,
    subcommandNowQueue().description,
    false
  );
  BDB.SPushOption(
    command,
    "subcommand",
    subcommandSleep().name,
    subcommandSleep().description,
    false
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
    },
    insert: {
      data: subcommandInsert(),
      async execute(interaction) {
        BDB.ISend(interaction, "yooo");
      }
    },
    pause: {
      data: subcommandPause(),
      async execute(interaction) {
        BDB.ISend(interaction, "yooo");
      }
    },
    resume: {
      data: subcommandResume(),
      async execute(interaction) {
        BDB.ISend(interaction, "yooo");
      }
    },
    skip: {
      data: subcommandSkip(),
      async execute(interaction) {
        BDB.ISend(interaction, "yooo");
      }
    },
    nowqueue: {
      data: subcommandNowQueue(),
      async execute(interaction) {
        BDB.ISend(interaction, "yooo");
      }
    },
    sleep: {
      data: subcommandSleep(),
      async execute(interaction) {
        BDB.ISend(interaction, "yooo");
      }
    },
  }
};
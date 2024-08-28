const config = require("../config.js");
const { ActivityType } = require("discord.js");

module.exports = async (client) => {
  const { REST } = require("@discordjs/rest");
  const { Routes } = require("discord-api-types/v10");
  const rest = new REST({ version: "10" }).setToken(config.bot_token || process.env.bot_token);

  console.log('\x1b[32m%s\x1b[0m', `|  🌼 Start Completed, run on ${client.user.username}`);
  const serverCount = client.guilds.cache.size;

  setInterval(() => client.user.setActivity({ 
    name: `Code By Creative - A King Bot Discord Coder`, 
    type: ActivityType.Listening 
  }), 10000);

  process.on('uncaughtException', (err) => {
    console.error('Có lỗi không bắt được:', err);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Lỗi:', promise, 'Lý do:', reason);
  });
};
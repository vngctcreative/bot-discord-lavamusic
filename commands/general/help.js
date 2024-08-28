const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function getCommands(dir) {
  let commands = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      commands = commands.concat(getCommands(filePath));
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      commands.push({
        name: command.name,
        description: command.description
      });
    }
  }
  return commands;
}

module.exports = {
  name: "help",
  description: "📜 Hiển thị các lệnh hỗ trợ của BOT",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      const commandDir = path.join(__dirname, '..');
      const commands = getCommands(commandDir);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('💎 Bot Quản lý Server')
        .setDescription('Dưới đây là 1 số lệnh thực hiện với BOT');

      commands.forEach(cmd => {
        embed.addFields({ name: `/${cmd.name}`, value: `${cmd.description}`, inline: true });
      });

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Lỗi')
        .setDescription('Đã xảy ra lỗi khi xử lý yêu cầu của bạn.');
      
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "invite_bot",
  description: "📨 Tạo một liên kết để mời bot vào máy chủ của bạn",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {

    try {
      const clientId = client.user.id;
      const permissions = 8; // Quyền admin
      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;

      const embed = new EmbedBuilder()
        .setColor(`#6190ff`)
        .setTitle(`📨 Mời bot vào máy chủ của bạn`)
        .setDescription(`Nhấn vào [đây](${inviteUrl}) để mời bot vào máy chủ của bạn.`);

      return interaction.reply({ embeds: [embed] }).catch(e => {
        console.error(e);
      });

    } catch (e) {
      console.error(e);
    }
  },
};
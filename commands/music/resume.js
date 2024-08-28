const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "resume",
  description: "▶️ Tiếp tục phát nhạc hiện tại",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      const player = client.riffy.players.get(interaction.guild.id);

      if (!player || player.playing) {
        return interaction.reply("Không có nhạc bị tạm dừng để tiếp tục.");
      }

      player.pause(false);

      const embed = new EmbedBuilder()
        .setColor('#6190ff')
        .setTitle('▶️ Nhạc đã tiếp tục')
        .setDescription('Nhạc hiện tại đã được tiếp tục phát.');

      return interaction.reply({ embeds: [embed] }).catch(e => { console.error(e); });

    } catch (e) {
      console.error(e);
      interaction.reply("Đã xảy ra lỗi khi cố gắng tiếp tục phát nhạc.");
    }
  },
};
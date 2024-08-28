const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "pause",
  description: "⏸ Tạm dừng nhạc hiện tại",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      const player = client.riffy.players.get(interaction.guild.id);

      if (!player || !player.playing) {
        return interaction.reply("Không có nhạc đang phát để tạm dừng.");
      }

      player.pause(true);

      const embed = new EmbedBuilder()
        .setColor('#6190ff')
        .setTitle('⏸ Nhạc đã tạm dừng')
        .setDescription('Nhạc hiện tại đã được tạm dừng.');

      return interaction.reply({ embeds: [embed] }).catch(e => { console.error(e); });

    } catch (e) {
      console.error(e);
      interaction.reply("Đã xảy ra lỗi khi cố gắng tạm dừng nhạc.");
    }
  },
};
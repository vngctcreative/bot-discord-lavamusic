const { EmbedBuilder } = require('discord.js');
const config = require("../../config.js");

module.exports = {
  name: "report",
  description: "📢 Gửi báo cáo lỗi đến kênh hỗ trợ.",
  permissions: "0x0000000000000800",
  options: [{
    name: 'message',
    description: 'Nhập thông tin lỗi cần báo cáo.',
    type: 3, // ApplicationCommandOptionType.String
    required: true
  }],
  run: async (client, interaction) => {
    try {
      const errorChannelId = config.errorLog;
      const errorChannel = await client.channels.fetch(errorChannelId);

      if (!errorChannel) {
        return interaction.reply({ content: '📭 Không tìm thấy kênh báo cáo lỗi.', ephemeral: true });
      }

      const reportMessage = interaction.options.getString('message');
      const guild = interaction.guild;
      const user = interaction.user;

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔴 Báo cáo Lỗi')
        .addFields(
          { name: '👤 Tên Người Gửi', value: user.username, inline: true },
          { name: '🏷️ Người Gửi', value: user.toString(), inline: true }, // Changed to mention
          { name: '🆔 ID Server', value: guild.id, inline: true },
          { name: '🏷️ Tên Server', value: guild.name, inline: true },
          { name: '✉️ Nội Dung', value: reportMessage }
        )
        .setTimestamp();

      await errorChannel.send({ embeds: [embed] });

      return interaction.reply({ content: '✅ Đã gửi báo cáo lỗi của bạn đến kênh hỗ trợ.', ephemeral: true });

    } catch (error) {
      console.error('Error processing /report command:', error);
      return interaction.reply({ content: '❌ Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.', ephemeral: true });
    }
  },
};

const { EmbedBuilder } = require('discord.js');
const { ownerID } = require('../../config'); // Đường dẫn đến tệp config

module.exports = {
  name: "clear_all",
  description: "🗑️ Xoá toàn bộ các kênh trong server",
  run: async (client, interaction) => {
    try {
      // Kiểm tra xem người thực hiện lệnh có phải là chủ sở hữu bot không
      if (!ownerID.includes(interaction.user.id)) {
        return interaction.reply({ content: '❌ Bạn không có quyền thực hiện lệnh này.', ephemeral: true });
      }

      await interaction.deferReply(); // Đợi phản hồi

      const guild = interaction.guild;

      // Lưu trữ các lỗi không thể xóa
      let errorMessages = [];

      // Xoá tất cả các kênh trong server
      await Promise.all(guild.channels.cache.map(async (channel) => {
        try {
          await channel.delete();
          // console.log(`Đã xoá kênh: ${channel.name}`);
        } catch (error) {
          // Xử lý lỗi
          let errorMessage;
          if (error.code === 50074) {
            errorMessage = `🚫 Không thể xoá kênh ${channel.name}, lý do là kênh này là tính năng cộng đồng của Discord !!!`;
          } else {
            errorMessage = `❗ Lỗi không xác định: ${error.message}`;
          }
          errorMessages.push(errorMessage); // Thêm lỗi vào danh sách
        }
      }));

      // Gửi thông báo hoàn tất
      const embed = new EmbedBuilder()
        .setColor('#4caf50')
        .setTitle('🗑️ Xoá Kênh Thành Công')
        .setDescription('✅ Đã xoá toàn bộ các kênh trong server.');

      // Thêm thông báo lỗi nếu có
      if (errorMessages.length > 0) {
        embed.addFields({ name: '🚨 Các lỗi gặp phải', value: errorMessages.join('\n') });
      }

      await interaction.editReply({ embeds: [embed], ephemeral: false });

    } catch (e) {
      // console.error(e);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ Đã xảy ra lỗi khi thực hiện lệnh.', ephemeral: true });
      } else {
        interaction.reply({ content: '❌ Đã xảy ra lỗi khi thực hiện lệnh.', ephemeral: true });
      }
    }
  },
};
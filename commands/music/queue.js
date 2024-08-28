const { EmbedBuilder } = require('discord.js');
const { queueNames } = require('./play.js'); // Sửa đường dẫn phù hợp với tệp play.js

module.exports = {
  name: "queue",
  description: "📜 Kiểm tra danh sách nhạc hiện tại",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {
      // Kiểm tra danh sách nhạc hiện tại
      const pageSize = 10;
      const queueMessage = queueNames.length > 0 
        ? queueNames.map((song, index) => `${index + 1}. ${song}`).join('\n') 
        : "Hàng đợi đang trống.";

      const pages = [];
      for (let i = 0; i < queueNames.length; i += pageSize) {
        const page = queueNames.slice(i, i + pageSize);
        pages.push(page);
      }

      for (let i = 0; i < pages.length; i++) {
        const numberedSongs = pages[i].map((song, index) => `${index + 1}. ${song}`).join('\n');

        const queueEmbed = new EmbedBuilder()
          .setColor('#6190ff') // Màu sắc cho Embed
          .setTitle(`Hàng Đợi Hiện Tại (Trang ${i + 1}/${pages.length})`)
          .setDescription(numberedSongs);

        // Gửi thông báo cho người dùng với thông tin hàng đợi
        await interaction.reply({ embeds: [queueEmbed] });
      }

    } catch (e) {
      console.error(e);
      // Thông báo lỗi nếu có
      await interaction.reply({ content: "Đã xảy ra lỗi khi kiểm tra hàng đợi.", ephemeral: true });
    }
  },
};

const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  name: "clear_category",
  description: "📁 Xoá tất cả các kênh và danh mục trong một danh mục",
  options: [
    {
      name: 'danh_mục_id',
      description: 'ID của danh mục cần xoá',
      type: 3, // String
      required: true
    }
  ],
  run: async (client, interaction) => {
    try {
      // Kiểm tra quyền quản trị
      if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({ content: '❌ Bạn cần có quyền quản trị để thực hiện lệnh này.', ephemeral: true });
      }

      const categoryId = interaction.options.getString('danh_mục_id');
      // console.log(`Tìm danh mục với ID: ${categoryId}`);

      // Tìm danh mục trong tất cả các kênh của server
      let category = interaction.guild.channels.cache.get(categoryId);
      if (!category) {
        try {
          category = await interaction.guild.channels.fetch(categoryId);
          // console.log(`Danh mục tìm thấy: ${category.name}`);
        } catch (error) {
          // console.error('Lỗi khi tìm danh mục:', error);
          return interaction.reply({ content: '❌ Không tìm thấy danh mục với ID cung cấp trong server này.', ephemeral: true });
        }
      }

      if (!category || category.type !== ChannelType.GuildCategory) {
        return interaction.reply({ content: '❌ ID danh mục không hợp lệ hoặc danh mục không tồn tại.', ephemeral: true });
      }

      // console.log(`Danh mục ${category.name} đã được tìm thấy và sẵn sàng xóa`);

      // Xoá tất cả các kênh trong danh mục
      if (category.children && category.children.size > 0) {
        category.children.forEach(async (channel) => { // Sử dụng .forEach() của Collection
          try {
            await channel.delete();
            // console.log(`Đã xoá kênh: ${channel.name}`);
          } catch (error) {
            // console.error('Lỗi khi xoá kênh:', error);
          }
        });
      }

      // Xoá danh mục
      try {
        await category.delete();
        // console.log(`Đã xoá danh mục: ${category.name}`);
      } catch (error) {
        // console.error('Lỗi khi xoá danh mục:', error);
        return interaction.reply({ content: '❌ Không thể xoá danh mục.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#4caf50')
        .setTitle('📁 Xoá Danh Mục Thành Công')
        .setDescription(`Đã xoá tất cả các kênh và danh mục ${category.name}. ✅`);
      const replyMessage = await interaction.reply({ embeds: [embed], ephemeral: false });

      // Thực hiện delay 5 giây và sau đó xóa tin nhắn phản hồi
      setTimeout(() => {
        replyMessage.delete().catch(console.error);
      }, 5000);

    } catch (e) {
      console.error(e);
      const errorMessage = await interaction.reply({ content: '❌ Đã xảy ra lỗi khi thực hiện lệnh.', ephemeral: true });

      // Thực hiện delay 5 giây và sau đó xóa tin nhắn lỗi
      setTimeout(() => {
        errorMessage.delete().catch(console.error);
      }, 5000);
    }
  },
};
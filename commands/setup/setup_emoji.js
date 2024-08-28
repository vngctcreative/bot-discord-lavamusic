const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "setup_emoji",
  description: "🎟️ Tạo emoji mới cho server",
  permissions: "0x0000000000000800", // Admin permissions
  options: [
    {
      type: 3, // STRING
      name: "name",
      description: "Tên của emoji mới",
      required: true,
    },
    {
      type: 11, // ATTACHMENT
      name: "image",
      description: "Hình ảnh hoặc GIF của emoji mới",
      required: true,
    },
  ],
  run: async (client, interaction) => {
    try {
      const emojiName = interaction.options.getString('name');
      const image = interaction.options.getAttachment('image');

      // Check if the attachment is an image or GIF
      if (!image || !['image/jpeg', 'image/png', 'image/gif'].includes(image.contentType)) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Lỗi')
          .setDescription('Vui lòng tải lên tệp tin ảnh hoặc GIF hợp lệ.');
        return interaction.reply({ embeds: [embed] });
      }

      // Dynamic import of node-fetch
      const { default: fetch } = await import('node-fetch');

      // Fetch the image from URL
      const response = await fetch(image.url);
      if (!response.ok) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Lỗi')
          .setDescription('Không thể tải tệp tin từ URL.');
        return interaction.reply({ embeds: [embed] });
      }

      const buffer = await response.buffer();

      // Create the emoji
      const guild = interaction.guild;
      if (guild) {
        guild.emojis.create({ attachment: buffer, name: emojiName })
          .then(emoji => {
            const embed = new EmbedBuilder()
              .setColor('#00ff00')
              .setTitle('🎉 Tạo Emoji Thành Công')
              .setDescription(`**Tên Emoji:** ${emoji.name}\n**ID Emoji:** ${emoji.id}`)
              .setThumbnail(emoji.url); // Display the emoji image in the thumbnail

            return interaction.reply({ embeds: [embed] });
          })
          .catch(err => {
            console.error(err);
            const embed = new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ Lỗi')
              .setDescription('Đã xảy ra lỗi khi tạo emoji.');
            return interaction.reply({ embeds: [embed] });
          });
      } else {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Lỗi')
          .setDescription('Không thể tìm thấy server.');
        return interaction.reply({ embeds: [embed] });
      }
    } catch (e) {
      console.error(e);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Lỗi')
        .setDescription('Đã xảy ra lỗi trong khi xử lý yêu cầu.');
      return interaction.reply({ embeds: [embed] });
    }
  },
};
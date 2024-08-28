const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'steal_emoji',
  description: '🕵 Cướp emoji từ server khác về server của bạn dựa trên link emoji được cung cấp',
  permissions: '0x0000000000000800', // Quyền kiểm soát emoji
  options: [
    {
      name: 'name',
      description: 'Tên của emoji mới',
      type: 3, // String
      required: true,
    },
    {
      name: 'url',
      description: 'Liên kết đến emoji bạn muốn sao chép',
      type: 3, // String
      required: true,
    },
  ],
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has('MANAGE_EMOJIS_AND_STICKERS')) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Không Có Quyền')
        .setDescription('Bạn không có quyền kiểm soát emoji.');
      return interaction.reply({ embeds: [embed] });
    }

    const emojiName = interaction.options.getString('name');
    let emojiUrl = interaction.options.getString('url');

    // Thay đổi kích thước của emoji xuống 48
    if (emojiUrl.includes('?size=')) {
      emojiUrl = emojiUrl.replace(/size=\d+/, 'size=48');
    } else {
      emojiUrl += '?size=48';
    }

    try {
      // Sử dụng dynamic import() để nhập node-fetch
      const { default: fetch } = await import('node-fetch');

      const response = await fetch(emojiUrl);
      if (!response.ok) throw new Error('Lỗi tải emoji.');

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Kiểm tra kích thước buffer
      if (buffer.length === 0) {
        throw new Error('Buffer không hợp lệ.');
      }

      const emoji = await interaction.guild.emojis.create({
        attachment: buffer,
        name: emojiName,
      });

      const embed = new EmbedBuilder()
        .setColor('#6190ff')
        .setTitle('✅ Đã Cướp Emoji Thành Công !!!')
        .setDescription(`
          **Emoji link đã cướp:** ${emojiUrl}
          **Tên emoji:** ${emoji.name}
          **ID emoji:** ${emoji.id}
        `)
        .setThumbnail(emojiUrl);
        
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi tạo emoji:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Lỗi')
        .setDescription('Có lỗi xảy ra khi cướp emoji. Đảm bảo rằng kích thước của emoji là 48x48 hoặc nhỏ hơn.');
      
      return interaction.reply({ embeds: [embed] });
    }
  },
};
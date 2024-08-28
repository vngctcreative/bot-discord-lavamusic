const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "clear_chat",
  description: "🧹 Xoá tin nhắn trong kênh hiện tại",
  options: [
    {
      name: 'số_lượng',
      description: 'Số lượng tin nhắn cần xoá',
      type: 4, // Integer
      required: true
    }
  ],
  run: async (client, interaction) => {
    try {
      let amount = interaction.options.getInteger('số_lượng');

      if (amount < 1) {
        return interaction.reply({ content: '❌ Số lượng tin nhắn cần xoá phải lớn hơn 0.', ephemeral: true })
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      }

      let deletedMessagesCount = 0;
      const messages = await interaction.channel.messages.fetch({ limit: amount });

      for (const [messageId, message] of messages) {
        try {
          await message.delete();
          deletedMessagesCount++;
        } catch (error) {
          console.error(`Failed to delete message with ID ${messageId}:`, error);
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#4caf50')
        .setTitle('🗑️ Xoá Tin Nhắn Thành Công')
        .setDescription(`Đã xoá ${deletedMessagesCount} tin nhắn trong kênh này. ✅`);
      interaction.reply({ embeds: [embed], ephemeral: false })
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    } catch (e) {
      console.error(e);
      interaction.reply({ content: '❌ Đã xảy ra lỗi khi thực hiện lệnh.', ephemeral: true })
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  },
};

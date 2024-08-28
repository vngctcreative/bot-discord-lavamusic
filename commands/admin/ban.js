const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "ban",
  description: "🚫 Cấm một người dùng khỏi server",
  permissions: "0x0000000000000004", // BAN_MEMBERS
  options: [
    {
      name: 'user',
      description: 'Người dùng mà bạn muốn cấm',
      type: 6, // USER
      required: true
    },
    {
      name: 'reason',
      description: 'Lý do cấm',
      type: 3, // STRING
      required: false
    }
  ],
  run: async (client, interaction) => {
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Không có lý do được cung cấp';
      
      if (!interaction.member.permissions.has('BAN_MEMBERS')) {
        return interaction.reply({ content: 'Bạn không có quyền cấm người dùng.', ephemeral: true });
      }

      const member = interaction.guild.members.cache.get(user.id);
      if (!member) {
        return interaction.reply({ content: 'Không tìm thấy người dùng này trong server.', ephemeral: true });
      }

      await member.ban({ reason }).catch(err => {
        console.error(err);
        return interaction.reply({ content: 'Đã xảy ra lỗi khi cấm người dùng.', ephemeral: true });
      });

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🚫 Đã Ban Thành Công !!!')
        .setDescription(`**ID User:** ${user.id}\n**Tag Discord:** ${user}\n**Thời gian tham gia nhóm:** ${member.joinedAt ? member.joinedAt.toDateString() : 'Không thể lấy thời gian tham gia nhóm'}`)
        .addFields(
          { name: '👮‍♂️ Người thực hiện lệnh ban:', value: interaction.user.tag, inline: true },
          { name: '📄 Lý do:', value: reason, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] }).catch(err => console.error(err));
      
    } catch (e) {
      console.error(e);
      await interaction.reply({ content: 'Đã xảy ra lỗi khi thực hiện lệnh này.', ephemeral: true }).catch(e => console.error(e));
    }
  },
};
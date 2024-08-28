const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "unban",
  description: "🔓 Bỏ cấm một người dùng khỏi server",
  permissions: "0x0000000000000004", // BAN_MEMBERS
  options: [
    {
      name: 'user_id',
      description: 'ID của người dùng mà bạn muốn bỏ cấm',
      type: 3, // STRING
      required: true
    },
    {
      name: 'reason',
      description: 'Lý do bỏ cấm',
      type: 3, // STRING
      required: false
    }
  ],
  run: async (client, interaction) => {
    try {
      const userId = interaction.options.getString('user_id');
      const reason = interaction.options.getString('reason') || 'Không có lý do';

      if (!interaction.member.permissions.has('BAN_MEMBERS')) {
        return interaction.reply({ content: 'Bạn không có quyền bỏ cấm người dùng.', ephemeral: true });
      }

      const user = await client.users.fetch(userId);
      if (!user) {
        return interaction.reply({ content: 'Không tìm thấy người dùng này.', ephemeral: true });
      }

      await interaction.guild.members.unban(user.id, reason).catch(err => {
        console.error(err);
        return interaction.reply({ content: 'Đã xảy ra lỗi khi bỏ cấm người dùng.', ephemeral: true });
      });

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🔓 Người dùng đã được bỏ cấm')
        .setDescription(`**${user.tag}** đã được bỏ cấm khỏi server.`)
        .addFields(
          { name: '👮‍♂️ Người Bỏ Ban:', value: interaction.user.tag, inline: true },
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
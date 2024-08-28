const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "avatar",
  description: "📸 Lấy avatar của người dùng",
  permissions: "0x0000000000000800",
  options: [
    {
      name: 'user',
      description: 'Người dùng mà bạn muốn lấy avatar',
      type: 6, // 6 là type cho USER
      required: false
    }
  ],
  run: async (client, interaction) => {
    try {
      const user = interaction.options.getUser('user') || interaction.user;
      const isGif = user.avatar?.startsWith('a_');
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

      let description = '';

      if (isGif) {
        const gifURL = user.displayAvatarURL({ format: 'gif', size: 4096 });
        description = `**Các định dạng hỗ trợ:** 
        🖼️ [GIF](${gifURL})
        `;
      } else {
        const pngURL = user.displayAvatarURL({ format: 'png', size: 4096 });
        const webpURL = user.displayAvatarURL({ format: 'webp', size: 4096 });
        const jpgURL = user.displayAvatarURL({ format: 'jpg', size: 4096 });
        description = `
          **Các định dạng hỗ trợ:**
          🖼️ [PNG](${pngURL}) | 🖼️ [WEBP](${webpURL}) | 🖼️ [JPG](${jpgURL})
        `;
      }

      const embed = new EmbedBuilder()
        .setColor('#6190ff')
        .setTitle(`Avatar của ${user.tag} 📸`)
        .setDescription(description)
        .setImage(avatarURL)
        .setFooter({ text: `Yêu cầu bởi ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

      await interaction.reply({ embeds: [embed] }).catch(e => console.error(e));
      
    } catch (e) {
      console.error(e);
      await interaction.reply({ content: 'Đã xảy ra lỗi khi thực hiện lệnh này.', ephemeral: true }).catch(e => console.error(e));
    }
  },
};
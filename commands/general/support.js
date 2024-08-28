const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "support",
  description: "💬 Nhận liên kết đến máy chủ hỗ trợ",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {
    try {

      const supportServerLink = "https://discord.gg/4Sbc2hVvNT";
      const githubLink = "https://github.com/vngctcreative";
      const youtubeLink = "https://www.youtube.com/@creative1896";
        const embed = new EmbedBuilder()
            .setColor('#b300ff')
            .setAuthor({
              name: 'Máy chủ Hỗ trợ',
              iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1230824519220985896/6280-2.gif?ex=6638ae28&is=66375ca8&hm=13e4a1b91a95b2934a39de1876e66c11711c7b30ac1a91c2a158f2f2ed1c2fc6&', 
              url: 'https://discord.gg/4Sbc2hVvNT'
          })
            .setDescription(`➡️ **Tham gia máy chủ Discord của chúng tôi để được hỗ trợ và cập nhật:**\n- Discord - ${supportServerLink}\n\n➡️ **Theo dõi chúng tôi trên:**\n- GitHub - ${githubLink}\n- YouTube - ${youtubeLink}`)
            .setImage('https://cdn.discordapp.com/attachments/1209084745498230856/1247110131758403584/banner-discord-developer-server.jpg?ex=66ae9811&is=66ad4691&hm=0bcb50a157eacd78c376f3fa3f97ad8f0a303cf297d00f5e26f749ab5e608ebe&')
            .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e); 
    }
  },
};
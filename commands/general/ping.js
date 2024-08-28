const { EmbedBuilder } = require('discord.js')

module.exports = {
  name: "ping",
  description: "🏓 Kiểm tra độ trễ của bot",
  permissions: "0x0000000000000800",
  options: [],
  run: async (client, interaction) => {

    try {
      const start = Date.now();
      interaction.reply("🏓 Đang kiểm tra độ trễ....").then(msg => {
        const end = Date.now();
        const embed = new EmbedBuilder()
          .setColor(`#6190ff`)
          .setTitle(`📶 Độ Trễ của Bot`)
          .setDescription(`**🏓 Pong** : ${end - start}ms`)
        return interaction.editReply({ embeds: [embed] }).catch(e => { });
      }).catch(err => { })

    } catch (e) {
      console.error(e); 
    }
  },
};
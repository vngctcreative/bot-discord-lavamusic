const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

async function join(client, interaction) {
    try {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Lỗi')
                .setDescription('Bạn cần vào một kênh thoại để sử dụng lệnh này.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const player = client.riffy.createConnection({
            guildId: interaction.guildId,
            voiceChannel: interaction.member.voice.channelId,
            textChannel: interaction.channelId,
            deaf: true
        });

        const joinEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Tham gia Kênh Thoại')
            .setDescription(`Đã tham gia thành công kênh thoại ${voiceChannel.name}`);

        await interaction.reply({ embeds: [joinEmbed] });

    } catch (error) {
        console.error('Lỗi khi xử lý lệnh join:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Lỗi')
            .setDescription('Đã xảy ra lỗi khi xử lý yêu cầu của bạn.');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "join",
    description: "➡️ Tham gia kênh thoại",
    permissions: "0x0000000000000800",
    options: [],
    run: join
};
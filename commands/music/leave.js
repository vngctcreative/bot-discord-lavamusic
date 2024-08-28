const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

async function leave(client, interaction) {
    try {
        const player = client.riffy.players.get(interaction.guildId);

        if (!player) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Lỗi')
                .setDescription('Tôi không ở trong kênh thoại nào.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        // Xóa tin nhắn phát nhạc nếu bot đang chơi
        const musicMessage = player.musicMessage; // Giả sử bạn lưu trữ tin nhắn phát nhạc trong thuộc tính player.musicMessage
        if (musicMessage) {
            try {
                await musicMessage.delete();
            } catch (deleteError) {
                console.error('Lỗi khi xóa tin nhắn phát nhạc:', deleteError);
            }
        }

        player.destroy();

        const leaveEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Rời Kênh Thoại')
            .setDescription('Đã rời khỏi kênh thoại thành công.');

        await interaction.reply({ embeds: [leaveEmbed] });

    } catch (error) {
        console.error('Lỗi khi xử lý lệnh leave:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Lỗi')
            .setDescription('Đã xảy ra lỗi khi xử lý yêu cầu của bạn.');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "leave",
    description: "⬅️ Rời kênh thoại",
    permissions: "0x0000000000000800",
    options: [],
    run: leave
};
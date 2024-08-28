const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const config = require("../../config.js");

const queueNames = [];
const requesters = new Map(); 

async function play(client, interaction) {
    try {
        const query = interaction.options.getString('name');
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

        await interaction.deferReply();
        
        const resolve = await client.riffy.resolve({ query: query, requester: interaction.user.username });

        if (!resolve || typeof resolve !== 'object') {
            throw new TypeError('Phản hồi không phải là một đối tượng');
        }

        const { loadType, tracks, playlistInfo } = resolve;

        if (!Array.isArray(tracks)) {
            throw new TypeError('Dự kiến tracks sẽ là một mảng');
        }

        if (loadType === 'PLAYLIST_LOADED') {
            for (const track of tracks) {
                track.info.requester = interaction.user.username; 
                player.queue.add(track);
                queueNames.push(track.info.title);
                requesters.set(track.info.uri, interaction.user.username); 
            }

            if (!player.playing && !player.paused) player.play();

        } else if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
            const track = tracks.shift();
            track.info.requester = interaction.user.username; 

            player.queue.add(track);
            queueNames.push(track.info.title);
            requesters.set(track.info.uri, interaction.user.username); 

            if (!player.playing && !player.paused) player.play();
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('❌ Lỗi')
                .setDescription('Không tìm thấy kết quả nào.');

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        // Ghi log đơn giản về bài hát đang phát
        console.log(`Đang phát bài hát: ${queueNames[queueNames.length - 1]}`);

        await new Promise(resolve => setTimeout(resolve, 500));

        const embeds = [
            new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({
                    name: 'Cập nhật yêu cầu!',
                    iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1236794583732457473/7828-verify-ak.gif',
                    url: 'https://discord.gg/4Sbc2hVvNT'
                })
                .setDescription('➡️ **Yêu cầu của bạn đã được xử lý thành công.**\n➡️** Vui lòng sử dụng các nút để điều khiển hàng đợi**'),

            new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({
                    name: 'Cập nhật yêu cầu!',
                    iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1236802032938127470/4104-verify-yellow.gif',
                    url: 'https://discord.gg/4Sbc2hVvNT'
                })
                .setDescription('➡️ **Yêu cầu của bạn đã được xử lý thành công.**\n➡️** Vui lòng sử dụng các nút để điều khiển hàng đợi**'),

            new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({
                    name: 'Cập nhật yêu cầu!',
                    iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1236802049190920202/4104-verify-red.gif',
                    url: 'https://discord.gg/4Sbc2hVvNT'
                })
                .setDescription('➡️ **Yêu cầu của bạn đã được xử lý thành công.**\n➡️** Vui lòng sử dụng các nút để điều khiển hàng đợi**')
        ];

        const randomIndex = Math.floor(Math.random() * embeds.length);
        await interaction.followUp({ embeds: [embeds[randomIndex]] });

    } catch (error) {
        console.error('Lỗi khi xử lý lệnh play:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Lỗi')
            .setDescription('Đã xảy ra lỗi khi xử lý yêu cầu của bạn.');

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

module.exports = {
    name: "play",
    description: "⏯️ Phát bài hát dựa theo tên, link, danh sách từ người dùng cung cấp",
    permissions: "0x0000000000000800",
    options: [{
        name: 'name',
        description: 'Nhập tên, link, danh sách nhạc mà bạn muốn phát',
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    run: play,
    queueNames: queueNames,
    requesters: requesters 
};
const { Riffy } = require("riffy");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const { queueNames, requesters } = require("./commands/music/play.js");
const { mewcard } = require("mewcard");
const config = require("./config.js");

// lưu ý phần lavalink nếu sử dụng phiên bản v3 thì phải cấu hình chuẩn để không bị lỗi
function initializePlayer(client) {
    const nodes = [
        {
            host: "lava-v3.ajieblogs.eu.org",
            port: 443,
            password: "https://dsc.gg/ajidevserver",
            secure: true,
            restVersion: "v3"
        },
        // {
        //     host: "ssl.lavalink.rocks",
        //     port: 443,
        //     password: "horizxon.tech",
        //     secure: true,
        //     restVersion: "v4"
        // }
    ];

    client.riffy = new Riffy(client, nodes, {
        send: (payload) => {
            const guildId = payload.d.guild_id;
            if (!guildId) return;

            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        defaultSearchPlatform: "ytmsearch",
        restVersion: "v3" // thay đổi phiên bản v3 nếu chạy lavalink v3, còn nếu lavalink v4 thì thay phiên bản thành v4
    });

    client.riffy.on("nodeConnect", node => {
        console.log('\x1b[32m%s\x1b[0m', '|  🌐 Host Lavalink "' + node.name + '" đã kết nối thành công !!!');
    });

    client.riffy.on("nodeError", (node, error) => {
        console.error(`Host Lavalink "${node.name}" gặp lỗi khi cố gắng kết nối: ${error.message}.`);
    });

    client.riffy.on("trackStart", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);
        const trackUri = track.info.uri;
        const requester = requesters.get(trackUri);
        const streamProvider = track.info.sourceName.charAt(0).toUpperCase() + track.info.sourceName.slice(1);

        const card = new mewcard()
            .setName(track.info.title)
            .setAuthor(track.info.author)
            .setTheme(config.musicardTheme)
            .setBrightness(50)
            .setThumbnail(track.info.thumbnail)
            .setRequester(`${requester}`);

        const buffer = await card.build();
        const attachment = new AttachmentBuilder(buffer, { name: `musicard.png` });

        const queueLoopButton = new ButtonBuilder()
            .setCustomId("loopQueue")
            .setLabel("Lặp Hàng Đợi")
            .setStyle(ButtonStyle.Primary);

        const disableLoopButton = new ButtonBuilder()
            .setCustomId("disableLoop")
            .setLabel("Tắt Lặp")
            .setStyle(ButtonStyle.Primary);

        const skipButton = new ButtonBuilder()
            .setCustomId("skipTrack")
            .setLabel("Chuyển bài tiếp theo")
            .setStyle(ButtonStyle.Success);

        const showQueueButton = new ButtonBuilder()
            .setCustomId("showQueue")
            .setLabel("Hiển Thị Hàng Đợi")
            .setStyle(ButtonStyle.Primary);

        const clearQueueButton = new ButtonBuilder()
            .setCustomId("clearQueue")
            .setLabel("Xóa Hàng Đợi")
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder()
            .addComponents(queueLoopButton, disableLoopButton, showQueueButton, clearQueueButton, skipButton);
        const message = await channel.send({ files: [attachment], components: [actionRow] });
        const filter = i => i.customId === 'loopQueue' || i.customId === 'skipTrack' || i.customId === 'disableLoop' || i.customId === 'showQueue' || i.customId === 'clearQueue';
        const collector = message.createMessageComponentCollector({ filter, time: 180000 });
        setTimeout(() => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    queueLoopButton.setDisabled(true),
                    disableLoopButton.setDisabled(true),
                    skipButton.setDisabled(true),
                    showQueueButton.setDisabled(true),
                    clearQueueButton.setDisabled(true)
                );

            message.edit({ components: [disabledRow] })
                .catch(console.error);
        }, 180000);
        collector.on('collect', async i => {
            await i.deferUpdate();
            if (i.customId === 'loopQueue') {
                setLoop(player, 'queue');
                const loopEmbed = new EmbedBuilder()
                    .setAuthor({
                        name: 'Lặp Hàng Đợi!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157318080670728283/7905-repeat.gif',
                        url: 'https://discord.gg/4Sbc2hVvNT'
                    })
                    .setColor(config.embedColor)
                    .setTitle("**Lặp Hàng Đợi Đã Được Kích Hoạt!**");

                await channel.send({ embeds: [loopEmbed] });
            } else if (i.customId === 'skipTrack') {
                player.stop();
                const skipEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setAuthor({
                        name: 'Bỏ Qua Bài Hát',
                        iconURL: 'https://cdn.discordapp.com/attachments/1156866389819281418/1157269773118357604/giphy.gif',
                        url: 'https://discord.gg/4Sbc2hVvNT'
                    })
                    .setTitle("**Player sẽ phát bài hát tiếp theo!**")
                    .setTimestamp();

                await channel.send({ embeds: [skipEmbed] });
            } else if (i.customId === 'disableLoop') {
                setLoop(player, 'none');
                const loopEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setAuthor({
                        name: 'Tắt Lặp',
                        iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1230836684774576168/7762-verified-blue.gif',
                        url: 'https://discord.gg/4Sbc2hVvNT'
                    })
                    .setDescription('**Lặp đã được tắt cho hàng đợi và bài hát đơn!**');

                await channel.send({ embeds: [loopEmbed] });
            } else if (i.customId === 'showQueue') {

                const pageSize = 10;

                const queueMessage = queueNames.length > 0 ?
                    queueNames.map((song, index) => `${index + 1}. ${song}`).join('\n') :
                    "Hàng đợi đang trống.";

                const pages = [];
                for (let i = 0; i < queueNames.length; i += pageSize) {
                    const page = queueNames.slice(i, i + pageSize);
                    pages.push(page);
                }

                for (let i = 0; i < pages.length; i++) {
                    const numberedSongs = pages[i].map((song, index) => `${index + 1}. ${song}`).join('\n');

                    const queueEmbed = new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setTitle(`Hàng Đợi Hiện Tại (Trang ${i + 1}/${pages.length})`)
                        .setDescription(numberedSongs);

                    await channel.send({ embeds: [queueEmbed] });
                }

            } else if (i.customId === 'clearQueue') {
                clearQueue(player);
                const queueEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setAuthor({
                        name: 'Hàng Đợi Đã Được Xóa',
                        iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1230836684774576168/7762-verified-blue.gif',
                        url: 'https://discord.gg/4Sbc2hVvNT'
                    })
                    .setDescription('**Các bài hát trong hàng đợi đã được xóa thành công!**');

                await channel.send({ embeds: [queueEmbed] });
            }
        });

        collector.on('end', collected => {
            // console.log(`Đã thu thập ${collected.size} tương tác.`);
        });
    });

    client.riffy.on("queueEnd", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);
        const autoplay = false;

        if (autoplay) {
            player.autoplay(player);
        } else {
            player.destroy();
            const queueEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setDescription('**Đã Hết Nhạc Trên Hàng Đợi \nNgắt Kết Nối Bot Khỏi Kênh Voice !!!**');

            await channel.send({ embeds: [queueEmbed] });
        }
    });

    function setLoop(player, loopType) {
        if (loopType === "queue") {
            player.setLoop("queue");
        } else {
            player.setLoop("none");
        }
    }

    function clearQueue(player) {
        player.queue.clear();
        queueNames.length = 0;
    }

    function showQueue(channel, queue) {
        const queueList = queue.map((track, index) => `${index + 1}. ${track.info.title}`).join('\n');
        const queueEmbed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle("Hàng Đợi")
            .setDescription(queueList);
        channel.send({ embeds: [queueEmbed] });
    }

    module.exports = { initializePlayer, setLoop, clearQueue, showQueue };
}

module.exports = { initializePlayer };
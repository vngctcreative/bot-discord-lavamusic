const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "setup_ticket",
    description: "📩 Thiết lập hệ thống ticket",
    permissions: "0x0000000000000800",
    options: [
        {
            name: 'category_name',
            description: 'Tên danh mục cho hệ thống ticket',
            type: 3, // String type
            required: true
        },
        {
            name: 'channel_name',
            description: 'Tên kênh để gửi tin nhắn tạo ticket',
            type: 3, // String type
            required: true
        },
        {
            name: 'title',
            description: 'Tiêu đề của tin nhắn',
            type: 3, // String type
            required: false
        },
        {
            name: 'description',
            description: 'Nội dung của tin nhắn',
            type: 3, // String type
            required: false
        },
        {
            name: 'image',
            description: 'URL hình ảnh của tin nhắn',
            type: 3, // String type
            required: false
        },
        {
            name: 'footer',
            description: 'Footer của tin nhắn',
            type: 3, // String type
            required: false
        }
    ],

    run: async (client, interaction) => {
        try {
            const categoryName = interaction.options.getString('category_name');
            const channelName = interaction.options.getString('channel_name');
            const title = interaction.options.getString('title') || '🎫 Hệ Thống Ticket';
            const description = interaction.options.getString('description') || 'Bạn cần hỗ trợ? Hãy bấm vào nút phía dưới để được các support và admin server hỗ trợ !!!';
            const image = interaction.options.getString('image') || null;
            const footer = interaction.options.getString('footer') || null;

            // Tạo danh mục mới
            const category = await interaction.guild.channels.create({
                name: categoryName,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    }
                ]
            });

            // Tạo kênh chat mới trong danh mục vừa tạo
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ]
            });

            // Lưu ID của danh mục và kênh vào file ticket_db.json
            const dbPath = path.join(__dirname, '../../data/ticket_db.json');
            const ticketData = {
                category_id: category.id,
                channel_id: channel.id
            };

            fs.writeFileSync(dbPath, JSON.stringify(ticketData, null, 2));

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(title)
                .setDescription(description);

            if (image) embed.setImage(image);
            if (footer) embed.setFooter({ text: footer });

            const button = new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('🎫 Tạo Ticket')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder()
                .addComponents(button);

            // Sử dụng deferReply để trì hoãn phản hồi
            await interaction.deferReply();
            
            await channel.send({ embeds: [embed], components: [row] });

            await interaction.editReply({ content: `Hệ thống ticket đã được thiết lập thành công! ${channel}` });

            client.on('interactionCreate', async (buttonInteraction) => {
                if (!buttonInteraction.isButton()) return;

                if (buttonInteraction.customId === 'create_ticket') {
                    const ticketChannelName = `${buttonInteraction.user.username}-${Math.floor(Math.random() * 999999)}`;
                    const ticketChannel = await interaction.guild.channels.create({
                        name: ticketChannelName,
                        type: ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: buttonInteraction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                            }
                        ]
                    });

                    const ticketEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('🎫 Ticket của bạn đã được tạo thành công!')
                        .setDescription('Hãy nêu vấn đề bạn đang gặp phải!');

                    const closeButton = new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('🔒 Đóng Ticket')
                        .setStyle(ButtonStyle.Danger);

                    const closeRow = new ActionRowBuilder()
                        .addComponents(closeButton);

                    await ticketChannel.send({ 
                        content: `<@${buttonInteraction.user.id}>`, // Mention người dùng
                        embeds: [ticketEmbed], 
                        components: [closeRow] 
                    });

                    await buttonInteraction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#00ff00')
                            .setTitle('🎫 Ticket hỗ trợ của bạn đã được tạo thành công !!!')
                            .setDescription(`Tên ticket: ${ticketChannel}`)
                        ],
                        ephemeral: true
                    });

                    client.on('interactionCreate', async (closeInteraction) => {
                        if (!closeInteraction.isButton()) return;

                        if (closeInteraction.customId === 'close_ticket' && closeInteraction.channelId === ticketChannel.id) {
                            try {
                                // Tạo tin nhắn xác nhận đóng ticket
                                const confirmationEmbed = new EmbedBuilder()
                                    .setColor('#ffcc00')
                                    .setTitle('🔒 Xác nhận đóng ticket')
                                    .setDescription('Bạn có chắc chắn muốn đóng ticket này?')
                                    .addFields(
                                        { name: 'Tùy chọn', value: 'Nhấn **Đồng Ý** để đóng ticket hoặc **Hủy** để giữ lại.' }
                                    );

                                const confirmButton = new ButtonBuilder()
                                    .setCustomId('confirm_close')
                                    .setLabel('Đồng Ý')
                                    .setStyle(ButtonStyle.Primary);

                                const cancelButton = new ButtonBuilder()
                                    .setCustomId('cancel_close')
                                    .setLabel('Hủy')
                                    .setStyle(ButtonStyle.Secondary);

                                const confirmRow = new ActionRowBuilder()
                                    .addComponents(confirmButton, cancelButton);

                                const confirmationMessage = await closeInteraction.reply({
                                    embeds: [confirmationEmbed],
                                    components: [confirmRow],
                                    fetchReply: true
                                });

                                // Xóa tin nhắn xác nhận sau 60 giây nếu không tương tác
                                const filter = (i) => i.customId === 'confirm_close' || i.customId === 'cancel_close';
                                const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 60000 });

                                collector.on('collect', async (interaction) => {
                                    if (interaction.customId === 'cancel_close') {
                                        // Hủy bỏ và giữ lại ticket
                                        await interaction.update({
                                            content: 'Đã hủy đóng ticket.',
                                            components: [],
                                        });
                                        return;
                                    }

                                    if (interaction.customId === 'confirm_close') {
                                        // Cập nhật tin nhắn đếm ngược
                                        await interaction.update({
                                            content: 'Đang đóng ticket trong 5 giây...',
                                            components: [],
                                        });

                                        let countdown = 5;
                                        const countdownInterval = setInterval(async () => {
                                            if (countdown <= 0) {
                                                clearInterval(countdownInterval);
                                                try {
                                                    // Xóa kênh ticket
                                                    await ticketChannel.delete();
                                                    await interaction.editReply({
                                                        content: 'Ticket đã được đóng.',
                                                        components: [],
                                                    });
                                                } catch (error) {
                                                    console.error('Lỗi khi xóa kênh ticket:', error);
                                                }
                                                return;
                                            }

                                            await interaction.editReply({
                                                content: `Đang đóng ticket trong ${countdown--} giây...`,
                                                components: [],
                                            });
                                        }, 1000);
                                    }
                                });

                                collector.on('end', async (collected, reason) => {
                                    if (reason === 'time') {
                                        // Xóa tin nhắn xác nhận nếu hết thời gian
                                        try {
                                            await confirmationMessage.delete();
                                        } catch (error) {
                                            console.error('Lỗi khi xóa tin nhắn xác nhận:', error);
                                        }
                                    }
                                });

                            } catch (error) {
                                console.error('Lỗi khi đóng ticket:', error);
                                await closeInteraction.reply({ content: 'Đã xảy ra lỗi khi đóng ticket.', ephemeral: true });
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Lỗi khi thiết lập hệ thống ticket:', error);
            await interaction.editReply({ content: 'Đã xảy ra lỗi khi thiết lập hệ thống ticket.', ephemeral: true });
        }
    },
};
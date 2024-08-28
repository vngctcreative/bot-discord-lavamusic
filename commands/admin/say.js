const { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require("../../config.js");

async function say(client, interaction) {
    try {
        // Kiểm tra quyền của người dùng
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Lỗi Quyền')
                .setDescription('Bạn không có quyền thực hiện lệnh này.');

            await interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
            return;
        }

        const message = interaction.options.getString('message');
        const format = interaction.options.getString('format') || 'plaintext';

        if (format === 'embed') {
            const title = interaction.options.getString('title') || null;
            const description = interaction.options.getString('description') || null;
            const imageUrl = interaction.options.getString('image') || null;
            const footer = interaction.options.getString('footer') || null;
            const color = interaction.options.getString('color') || '#ffffff';

            // Kiểm tra màu sắc
            if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
                const colorErrorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Lỗi Màu')
                    .setDescription('Màu embed không hợp lệ. Đảm bảo màu sắc là mã hex hợp lệ.');

                await interaction.reply({ embeds: [colorErrorEmbed], ephemeral: true });
                return;
            }

            // Gửi phản hồi ẩn để không lộ thông tin người dùng
            await interaction.reply({ content: 'Tin nhắn đang được gửi...', ephemeral: true });

            // Tạo embed
            const embed = new EmbedBuilder()
                .setColor(color); // Sử dụng giá trị màu sắc trực tiếp

            if (title) embed.setTitle(title);
            if (description) embed.setDescription(description);
            if (imageUrl) embed.setImage(imageUrl);
            if (footer) embed.setFooter({ text: footer });

            // Gửi tin nhắn embed từ bot
            await interaction.channel.send({ embeds: [embed] });

            // Cập nhật phản hồi ẩn sau khi gửi tin nhắn công khai
            await interaction.editReply({ content: 'Tin nhắn embed đã được gửi thành công!', ephemeral: true });

        } else {
            if (!message) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Lỗi')
                    .setDescription('Vui lòng cung cấp một tin nhắn.');

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            // Gửi phản hồi ẩn để không lộ thông tin người dùng
            await interaction.reply({ content: 'Tin nhắn đang được gửi...', ephemeral: true });

            // Gửi tin nhắn công khai từ bot
            await interaction.channel.send(message);

            // Cập nhật phản hồi ẩn sau khi gửi tin nhắn công khai
            await interaction.editReply({ content: 'Tin nhắn đã được gửi thành công!', ephemeral: true });
        }

    } catch (error) {
        console.error('Lỗi khi xử lý lệnh say:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Lỗi')
            .setDescription('Đã xảy ra lỗi khi xử lý yêu cầu của bạn.');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "say",
    description: "📣 Bot sẽ gửi tin nhắn do bạn nhập vào",
    permissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: 'format',
            description: 'Chọn định dạng tin nhắn: plaintext hoặc embed',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Plaintext', value: 'plaintext' },
                { name: 'Embed', value: 'embed' }
            ]
        },
        {
            name: 'message',
            description: '📝 Tin nhắn bạn muốn bot gửi (dành cho dạng plaintext)',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'title',
            description: '📜 Tiêu đề của embed (dành cho dạng embed)',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'description',
            description: '📝 Nội dung của embed (dành cho dạng embed)',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'image',
            description: '🖼️ URL hình ảnh của embed (dành cho dạng embed)',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'footer',
            description: '🔖 Footer của embed (dành cho dạng embed)',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'color',
            description: '🎨 Màu sắc của embed (dành cho dạng embed, mã hex ví dụ: #ff0000)',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    run: say,
};
const { ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Danh sách mã ngân hàng với SWIFT/BIC code và tên ngân hàng
const bankData = {
    'VIB': { name: 'Ngân hàng Quốc Tế (VIB)', swift: 'VNIBVNVX' },
    'VCB': { name: 'Ngân hàng Ngoại Thương Việt Nam (VCB)', swift: 'BFTVVNVX' },
    'TCB': { name: 'Ngân hàng Kỹ Thương Việt Nam (Techcombank)', swift: 'VTCBVNVX' },
    'VIT': { name: 'Ngân hàng Công Thương Việt Nam (VietinBank)', swift: 'ICBVVNVX' },
    'MBK': { name: 'Ngân hàng Quân đội (MB Bank)', swift: 'MSCBVNVX' },
    'CAKE': { name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank', swift: 'VPBKVNVX' },
    'BID': { name: 'Ngân hàng Đầu tư và Phát triển Việt Nam (BIDV)', swift: 'BIDVVNVX' }
};

// Loại bỏ ký tự đặc biệt và cắt ngắn nếu cần
function sanitizeDescription(description) {
    return description.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);
}

// Loại bỏ dấu tiếng Việt
// function removeAccents(str) {
//     return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// }

// Random nội dung chuyển khoản
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Loại bỏ dấu tiếng Việt
function removeAccents(str) {
    // Chuyển đổi các ký tự có dấu thành ký tự không dấu
    const map = {
        'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd',
        'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D'
    };
    
    return str.split('').map(char => map[char] || char).join('');
}

module.exports = {
    name: "thanhtoan_bank",
    description: "Thanh toán qua số tài khoản hoặc mã QR",
    permissions: "0x0000000000000800",
    options: [
        {
            name: "bank_code",
            description: "Mã ngân hàng (ví dụ: VIB)",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: Object.keys(bankData).map(code => ({ name: bankData[code].name, value: code }))
        },
        {
            name: "account_number",
            description: "Số tài khoản",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "account_name",
            description: "Tên chủ tài khoản",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "amount",
            description: "Số tiền cần chuyển",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "note",
            description: "Nội dung chuyển khoản (VUI LÒNG VIẾT KHÔNG DẤU)",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "method",
            description: "Chọn phương thức thanh toán",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "QR", value: "qr" },
                { name: "Số tài khoản", value: "number" },
            ]
        },
        {
            name: "format",
            description: "Định dạng mã QR (compact, compact2, qr_only, print)",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "1. Bao gồm : QR kèm logo VietQR, Napas, ngân hàng", value: "compact" },
                { name: "2. Bao gồm : Mã QR, các logo , thông tin chuyển khoản", value: "compact2" },
                { name: "3. Bao gồm : Trả về ảnh QR đơn giản, chỉ bao gồm QR", value: "qr_only" },
                { name: "4. Bao gồm : Mã QR, các logo và đầy đủ thông tin chuyển khoản", value: "print" }
            ]
        }
    ],
    run: async (client, interaction) => {
        try {
            const method = interaction.options.getString("method") || "qr";
            const bankCode = interaction.options.getString("bank_code");
            const accountNumber = interaction.options.getString("account_number");
            const accountName = interaction.options.getString("account_name");
            const amount = interaction.options.getString("amount");
            const note = interaction.options.getString("note") || `Discord-Payment-${generateRandomString(10)}`;
            const format = interaction.options.getString("format") || "print";

            const bank = bankData[bankCode];
            if (!bank) {
                await interaction.reply({ content: 'Mã ngân hàng không hợp lệ.', ephemeral: true });
                return;
            }

            if (method === "number") {
                let description = `
                    **Số tài khoản:** ${accountNumber}
                    **Ngân hàng:** ${bank.name}
                    **Tên chủ tài khoản:** ${removeAccents(accountName)}
                `;

                if (amount) {
                    description += `\n**Số tiền:** ${amount}`;
                }
                
                if (note) {
                    description += `\n**Nội dung chuyển khoản:** ${removeAccents(note)}`;
                }

                const embed = new EmbedBuilder()
                    .setColor('#6190ff')
                    .setTitle('THÔNG TIN CHUYỂN KHOẢN')
                    .setDescription(description);

                await interaction.reply({ embeds: [embed] });
            } else if (method === "qr") {
                const sanitizedNote = sanitizeDescription(note || '');
                const sanitizedAccountName = removeAccents(accountName);
                let vietQRUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${format}.png?amount=${amount || 0}&addInfo=${encodeURIComponent(sanitizedNote)}&accountName=${encodeURIComponent(sanitizedAccountName)}`;

                const response = await fetch(vietQRUrl);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const attachment = new AttachmentBuilder(buffer, { name: 'qr-code.png' });

                const embed = new EmbedBuilder()
                    .setColor('#6190ff')
                    .setTitle('Mã QR Thanh Toán')
                    .setDescription(`
                        **Tên chủ tài khoản:** ${sanitizedAccountName}
                        **Số tài khoản:** ${accountNumber}
                        **Ngân hàng:** ${bank.name}
                        **Số tiền thanh toán:** ${amount || 'Không có'}
                        **Nội dung chuyển khoản:** ${sanitizedNote}
                        \nQuét mã QR phía dưới để thanh toán.\nThời gian thanh toán: 5:00
                    `)
                    .setImage('attachment://qr-code.png');
                
                const msg = await interaction.reply({ embeds: [embed], files: [attachment], fetchReply: true });
                
                // Đếm ngược thời gian
                let timeLeft = 5 * 60 * 1000; // 5 phút
                const interval = setInterval(async () => {
                    const minutes = Math.floor(timeLeft / 60000);
                    const seconds = Math.floor((timeLeft % 60000) / 1000);
                    const timeDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                    
                    await msg.edit({
                        embeds: [new EmbedBuilder()
                            .setColor('#6190ff')
                            .setTitle('Mã QR Thanh Toán')
                            .setDescription(`
                                **Tên chủ tài khoản:** ${sanitizedAccountName}
                                **Số tài khoản:** ${accountNumber}
                                **Ngân hàng:** ${bank.name}
                                **Số tiền thanh toán:** ${amount || 'Không có'}
                                **Nội dung chuyển khoản:** ${sanitizedNote}
                                \nQuét mã QR phía dưới để thanh toán.\nThời gian thanh toán: ${timeDisplay}
                            `)
                            .setImage('attachment://qr-code.png')]
                    });

                    timeLeft -= 1000;

                    if (timeLeft <= 0) {
                        clearInterval(interval);
                        await msg.delete();
                    }
                }, 1000);
            } else {
                await interaction.reply({ content: 'Phương thức thanh toán không hợp lệ.', ephemeral: true });
            }
        } catch (error) {
            console.error('Lỗi khi xử lý lệnh thanhtoan:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Lỗi')
                .setDescription('Đã xảy ra lỗi khi xử lý yêu cầu của bạn.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
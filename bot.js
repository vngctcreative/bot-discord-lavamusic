const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config.js');
const fs = require('fs');
const path = require('path');
const { printLogCMD } = require('./util/startlog.js');
const { initializePlayer } = require('./player');

// Khởi tạo client Discord với các quyền cần thiết
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageTyping, // Cần thiết để nhận thông báo gõ tin nhắn
        GatewayIntentBits.GuildMembers // Cần thiết để quản lý thành viên và các sự kiện liên quan
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] // Cần thiết nếu bạn muốn xử lý tin nhắn và phản ứng đã bị rút ngắn
});

client.config = config;
initializePlayer(client);

// Khi bot sẵn sàng
client.once('ready', async () => {
    // console.log('|  BOT Server Running ...');
    client.riffy.init(client.user.id);
    await registerCommands(); // Đăng ký lệnh khi bot sẵn sàng
});

// Đọc và đăng ký các sự kiện từ thư mục ./events
fs.readdir(path.join(__dirname, 'events'), (err, files) => {
    if (err) return console.error('Không thể đọc thư mục events:', err);

    files.forEach(file => {
        if (file.endsWith('.js')) {
            const event = require(path.join(__dirname, 'events', file));
            const eventName = file.split('.')[0];
            client.on(eventName, event.bind(null, client));
        }
    });
});

// Đọc và đăng ký các lệnh từ thư mục ./commands
client.commands = new Map();

async function loadCommands(dir) {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isDirectory()) {
            // Đọc thư mục con
            await loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                if (!command.name || !command.description) {
                    console.error(`Lệnh không hợp lệ tại ${filePath}: thiếu 'name' hoặc 'description'`);
                    continue;
                }
                client.commands.set(command.name, command);
                // console.log(`Đã tải lệnh: ${command.name}`);
            } catch (err) {
                console.error(`Lỗi khi tải lệnh từ ${filePath}: ${err}`);
            }
        }
    }
}

async function registerCommands() {
    await loadCommands(path.join(__dirname, 'commands'));

    const commands = Array.from(client.commands.values()).map(command => ({
        name: command.name,
        description: command.description,
        options: command.options || [],
    }));

    const rest = new REST({ version: '10' }).setToken(config.bot_token || process.env.bot_token);

    try {
        // console.log('Đang đăng ký các lệnh sau:', JSON.stringify(commands, null, 2));
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('\x1b[32m%s\x1b[0m', '|  🚀 Lệnh đã được tải thành công!');
    } catch (error) {
        console.error('\x1b[36m%s\x1b[0m', '|  ❌ Lệnh tải thất bại:', error);
        console.error('Request body:', JSON.stringify(commands, null, 2));
    }
}

// Xử lý sự kiện raw cho trạng thái voice
client.on('raw', (d) => {
    const { GatewayDispatchEvents } = require('discord.js');
    if ([GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) {
        client.riffy.updateVoiceState(d);
    }
});

// Đăng nhập bot
client.login(config.bot_token || process.env.bot_token).catch((e) => {
    console.error('LỖI bot_token:', e);
});

// Tạo server Express để cung cấp thông tin trạng thái
const express = require('express');
const app = express();
const port = 3000;

// Cung cấp tệp HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Cung cấp thông tin trạng thái của bot
app.get('/status', (req, res) => {
    if (!client.user) {
        return res.json({ status: 'Bot đang khởi động ...', guilds: [] });
    }
    res.json({
        status: `BOT 🟢, Login Bằng ${client.user.tag}`,
        guilds: client.guilds.cache.map(guild => guild.name)
    });
});

// Khởi chạy server Express
app.listen(port, () => {
    console.log('\x1b[32m%s\x1b[0m', `|  🔗 Website đã online: http://localhost:${port}`);
});

// In log CMD
printLogCMD();
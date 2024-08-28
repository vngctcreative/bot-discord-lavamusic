const { EmbedBuilder } = require('discord.js');
const os = require('os');
const si = require('systeminformation');
const axios = require('axios');
const config = require('../../config.js');

module.exports = {
  name: 'about',
  description: '📕 Hiển thị thông tin về bot',
  permissions: '0x0000000000000800',
  options: [],
  run: async (client, interaction) => {
    try {
      // Đầu tiên, trì hoãn phản hồi
      await interaction.deferReply();

      // Tính toán thời gian chạy của bot
      const botCreationDate = `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`;
      const botUptime = `<t:${Math.floor((Date.now() - process.uptime() * 1000) / 1000)}:R>`;

      // Thông tin hệ thống
      const cpuData = await si.cpu();
      const gpuData = await si.graphics();
      const ramData = await si.memLayout();
      const mainboardData = await si.baseboard();

      // Lấy địa chỉ IP công cộng
      const response = await axios.get('https://api.ipify.org?format=json');
      const ipAddress = response.data.ip;

      // Thông tin sử dụng
      const cpuUsage = process.cpuUsage();
      const totalCpuTime = cpuUsage.user + cpuUsage.system;
      const cpuPercent = ((totalCpuTime / 1000000) / os.cpus().length).toFixed(2);
      const memoryUsage = process.memoryUsage().rss;
      const totalMemory = os.totalmem();
      const memoryPercent = ((memoryUsage / totalMemory) * 100).toFixed(2);

      // Phiên bản bot từ config
      const botVersion = config.versionbot;

      // Tạo thông tin về bot
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('ℹ️ Thông tin về Bot')
        .setDescription('Dưới đây là thông tin chi tiết về bot:')
        .addFields(
          { name: '🤖 Tên Bot', value: client.user.username, inline: true },
          { name: '🏷️ Tag Bot', value: `<@${client.user.id}>`, inline: true },
          { name: '🆔 ID Bot', value: client.user.id, inline: true },
          { name: '📅 Ngày Tạo Bot', value: botCreationDate, inline: true },
          { name: '⏱️ Thời Gian Khởi Động', value: botUptime, inline: true },
          { name: '🛠️ Node.js Version', value: process.version, inline: true },
          { name: '🔧 Discord.js Version', value: require('discord.js').version, inline: true },
          { name: '🌐 Địa Chỉ IP', value: ipAddress, inline: true },
          { name: '🖥️ Sử dụng CPU', value: `${cpuPercent}%`, inline: true },
          { name: '🎮 Sử dụng GPU', value: `${gpuData.controllers[0]?.utilizationGpu || 'Không xác định'}%`, inline: true },
          { name: '💾 Sử dụng RAM', value: `${memoryPercent}%`, inline: true },
          { name: '🧠 Chip CPU', value: `${cpuData.brand} (${cpuData.cores} cores, ${cpuData.threads} threads)`, inline: false },
          { name: '🎮 GPU', value: `${gpuData.controllers[0]?.model || 'Không xác định'} (${gpuData.controllers[0]?.bus || 'Không xác định'}, ${gpuData.controllers[0]?.vram || 'Không xác định'} MB)`, inline: false },
          { name: '💾 RAM', value: `${ramData[0]?.manufacturer || 'Không xác định'} ${ramData[0]?.type || 'Không xác định'} (${(ramData[0]?.size / (1024 ** 3)).toFixed(2)} GB, ${ramData[0]?.clockSpeed || 'Không xác định'} MHz)`, inline: false },
          { name: '🔧 Mainboard', value: `${mainboardData.manufacturer} ${mainboardData.model}`, inline: false },
          { name: '📦 Phiên Bản Bot', value: botVersion, inline: true } // Thêm thông tin phiên bản bot
        )
        .setFooter({ 
          text: `${config.footerEmbed} - Version: ${botVersion}`, // Hiển thị phiên bản bot trong footer
          iconURL: config.footerIcon || client.user.displayAvatarURL() 
        });

      // Phản hồi tương tác
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      // Nếu có lỗi, phản hồi với một thông điệp lỗi
      await interaction.editReply({ content: 'Đã xảy ra lỗi khi thực hiện lệnh này.', ephemeral: true });
    }
  },
};
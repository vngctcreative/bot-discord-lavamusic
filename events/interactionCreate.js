const config = require("../config.js");
const { InteractionType } = require('discord.js');
const fs = require("fs");
const path = require("path");

module.exports = async (client, interaction) => {
  try {
    if (!interaction?.guild) {
      return interaction?.reply({ content: "🚫 Lệnh này chỉ có thể được sử dụng trong máy chủ.", ephemeral: true });
    } else {
      function cmd_loader() {
        if (interaction?.type === InteractionType.ApplicationCommand) {
          // Đọc tất cả các tệp lệnh từ thư mục commands
          const readCommands = (dir) => {
            fs.readdirSync(dir).forEach(file => {
              const filePath = path.join(dir, file);
              if (fs.lstatSync(filePath).isDirectory()) {
                // Nếu là thư mục, gọi lại hàm để duyệt thư mục con
                readCommands(filePath);
              } else if (file.endsWith(".js")) {
                let props = require(filePath);
                if (interaction.commandName === props.name) {
                  try {
                    if (interaction?.member?.permissions?.has(props?.permissions || "0x0000000000000800")) {
                      return props.run(client, interaction);
                    } else {
                      return interaction?.reply({ content: "🔒 Bạn không có quyền sử dụng lệnh này.", ephemeral: true });
                    }
                  } catch (e) {
                    return interaction?.reply({ content: `❌ Lỗi: ${e.message}`, ephemeral: true });
                  }
                }
              }
            });
          };

          readCommands(path.resolve(config.commandsDir));
        }
      }

      cmd_loader();
    }
  } catch (e) {
    console.error(e);
  }
};

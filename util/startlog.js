const status = "Creative";
const botName = "Server Management Bot";
const Text = "Developer Creative Server";
const version = "Latest@ v1.0"; 
const startTime = Date.now();

function printLogCMD() {
  const uptimeInSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\x1b[1m\x1b[36m╔════════════════════════════════════════════════════╗`);
  console.log(`\x1b[1m\x1b[36m║                                                    ║`);
  console.log(`\x1b[1m\x1b[36m║       ${botName}                        ║`);              
  console.log(`\x1b[1m\x1b[36m║       👑 Chủ sở hữu: ${status}                      ║`);
  console.log(`\x1b[1m\x1b[36m║       💡 Phiên Bản: ${version}                   ║`);
  console.log(`\x1b[1m\x1b[36m║       📅 Uptime: ${uptimeInSeconds}s                             ║`);
  console.log(`\x1b[1m\x1b[36m║       🚀 Powered by ${Text}      ║`);
  console.log(`\x1b[1m\x1b[36m║                                                    ║`);
  console.log(`\x1b[1m\x1b[36m╚════════════════════════════════════════════════════╝\x1b[0m`);
}
module.exports = {
  printLogCMD,
};
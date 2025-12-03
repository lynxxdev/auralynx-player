const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.TOKEN;
const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX || ".";
const MONGODB_URI = process.env.MONGODB_URI;

const { handleReadyBot } = require("../handlers/readyBot");
const { handleNewInteraction } = require("../handlers/interaction");
const { initFiles } = require("../util/initFiles");

const client = new Client({
  restTimeOffset: 10,
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.User, Partials.ThreadMember, Partials.Message]
});

client.login(TOKEN);
client.commands = new Collection();
client.prefix = DEFAULT_PREFIX;
client.logger = new (require("../util/logger"))();

initFiles(client);

// Conecta no MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Mongoose conectado."))
  .catch(err => console.error("Erro ao conectar no MongoDB:", err));

// Função recursiva para pegar todos os arquivos JS de comandos em subpastas
function getCommandFiles(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getCommandFiles(fullPath));
    } else if (file.endsWith(".js")) {
      files.push(fullPath);
    }
  });
  return files;
}

// Registrar comandos
client.once("ready", async () => {
  console.log(`${client.user.tag} está online!`);

  const commandFiles = getCommandFiles(path.join(__dirname, "../commands"));
  const commands = [];

  for (const file of commandFiles) {
    const command = require(file);
    if (!command.name) continue;
    client.commands.set(command.name, command);

    if (command.description) {
      commands.push({
        name: command.name,
        description: command.description,
        options: command.options || []
      });
    }
  }

  // Registrar slash commands globais
  await client.application.commands.set(commands);
  console.log(`Comandos registrados: ${commands.map(c => c.name).join(", ")}`);
});

// Shoukaku + Queue
client.manager = new (require("../../structures/Shoukaku"))(client);
client.manager.queue = new (require("../../structures/Queue"))(client);

// Eventos principais
client
  .on("warn", console.warn)
  .on("error", console.error)
  .on("ready", async () => await handleReadyBot(client))
  .on("interactionCreate", async (interaction) => await handleNewInteraction(interaction));

// Captura erros
process
  .on("uncaughtException", (err) => console.error("Uncaught Exception:", err))
  .on("uncaughtExceptionMonitor", (err) => console.error("Monitor Exception:", err))
  .on("unhandledRejection", (err) => console.error("Unhandled Rejection:", err));
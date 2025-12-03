const TOKEN = process.env.TOKEN;
const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX || ".";
const MONGODB_URI = process.env.MONGODB_URI;
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require("discord.js");

const mongoose = require("mongoose");
const {
  handleReadyBot
} = require("../handlers/readyBot");
const {
  handleNewInteraction
} = require("../handlers/interaction");
const {
  initFiles
} = require("../util/initFiles");

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

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(res => console.log("Mongoose Conectado."));

const fs = require("fs");
const path = require("path");

client.once("ready", async () => {
    console.log(`${client.user.tag} está online!`);

    // Limpa comandos antigos (opcional)
    const registered = await client.application.commands.fetch();
    for (const cmd of registered.values()) {
        if (!client.commands.has(cmd.name)) {
            await client.application.commands.delete(cmd.id);
            console.log(`Comando antigo removido: ${cmd.name}`);
        }
    }

    // Registrar todos os comandos do bot
    const commands = [];
    const commandFiles = fs.readdirSync("./src/commands").filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(path.join(__dirname, "../commands", file));
        client.commands.set(command.name, command);

        // Se tiver descrição (para slash commands)
        if (command.description) {
            commands.push({
                name: command.name,
                description: command.description,
                options: command.options || []
            });
        }
    }

    // Registra no Discord (globais)
    await client.application.commands.set(commands);
    console.log(`Todos os comandos foram registrados: ${commands.map(c => c.name).join(", ")}`);
});

  
client.manager = new (require("../../structures/Shoukaku"))(client);
client.manager.queue = new (require("../../structures/Queue"))(client);
client
  .on("warn", console.error)
  .on("error", console.error)
  .on("ready", async () => await handleReadyBot(client))
  .on("guildCreate", async (guild) => await handleGuildCreate(guild, client, api))
  .on("guildDelete", async (guild) => await handleGuildDelete(guild, client, api))
  .on("interactionCreate", async (interaction) => await handleNewInteraction(interaction))

process
  .on("uncaughtException", (err) => { })
  .on("uncaughtExceptionMonitor", (err) => { })
  .on("unhandledRejection", (err) => { });
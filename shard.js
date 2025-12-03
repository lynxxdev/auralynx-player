const { ShardingManager } = require("discord.js");

// Lê token das Environment Variables
const TOKEN = process.env.TOKEN;

const shards = new ShardingManager("./src/bot/bot.js", {
  token: TOKEN,
  totalShards: "auto",
});

shards.on("shardCreate", (shard) => {
  console.log(
    `[${new Date().toString().split(" ", 5).join(" ")}] Shard ${shard.id} iniciado.`
  );
});

shards.spawn({ timeout: 360000, delay: 1000 });
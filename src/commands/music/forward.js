const { canModifyQueue } = require("../../util/queueModify");
const embedMessage = require("../../util/embedContent");

module.exports = {
    name: "forward",
    async execute(message) {
        if (!(await canModifyQueue(message))) return;

        const player = message.client.manager.queue.get(message.guild.id);
        if (player.current.info.isStream) return message.reply({ embeds: [embedMessage("Não consigo procurar transmissões ao vivo.")], ephemeral: true });

        const songtime = player.current.info.length / 1000;
        let seektime = player.player.position / 1000 + Number(message.options.get("seconds").value);

        if (songtime < seektime) return message.reply({ embeds: [embedMessage("Opa! Insira um ponto de busca válido em segundos.")], ephemeral: true });

        await player.player.seekTo(seektime * 1000);
        return message.reply({ embeds: [embedMessage(`O <@${message.author.id}> **avançou para a próxima faixa.**`)] })
    },
};

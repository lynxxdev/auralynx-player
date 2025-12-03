const { canModifyQueue } = require("../../util/queueModify");
const embedMessage = require("../../util/embedContent");

module.exports = {
    name: "jump",
    async execute(message, args) {
        if (!(await canModifyQueue(message))) return;
        if (message.options.get("position").value < 1) return message.reply({ embeds: [embedMessage(`Maninho (a), insira uma posição válida da fila.`)], ephemeral: true });

        const player = message.client.manager.queue.get(message.guild.id);
        if (message.options.get("position").value > player.length) return message.reply({ embeds: [embedMessage(`${message.member.user} Opa! A fila contém apenas **${player.queue.length}** faixas.`)], ephemeral: true });

        const songNum = message.options.get("position").value - 1;

        let popped = player.queue.splice(songNum, 1);
        await player.queue.unshift(...popped);

        await player.skip();
        return message.reply({ embeds: [embedMessage(`${message.member.user} Pulou para a faixa **${message.options.get("position").value}**.`)] });
    },
};

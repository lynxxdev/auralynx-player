const embedMessage = require("../../util/embedContent");
const { canModifyQueue } = require("../../util/queueModify");

module.exports = {
    name: "loop",
    async execute(message, type) {
        if (!(await canModifyQueue(message))) return;
        const player = await message.client.manager.queue.get(message.guild.id);

        if (message.options?.get("type")?.value == "track" || type == "track") {
            player.repeat = player.repeat == 1 ? 0 : 1;
            return message.reply({ embeds: [embedMessage(`${message.member.user} A Repetição de faixa agora está **${player.repeat ? "ativada" : "desativada"}**.`)] });
        }
        player.repeat = player.repeat == 2 ? 0 : 2;
        return message.reply({ embeds: [embedMessage(`${message.member.user} A repetição da fila agora está **${player.repeat == 2 ? "ativada" : "desativada"}**.`)] });
    },
};

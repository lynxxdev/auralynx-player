const { canModifyQueue } = require("../../util/queueModify");
const embedMessage = require("../../util/embedContent");

module.exports = {
    name: "removeduplicates",
    async execute(message) {
        try {
            if (!(await canModifyQueue(message))) return;
            const player = message.client.manager.queue.get(message.guild.id);

            let count = 0, a = [];;
            for (let i = 0; i < player.queue.length; i++) {
                if (a.includes(player.queue[i]?.info.uri)) {
                    player.queue.splice(i--, 1);
                    count++;
                }
            }

            return message.reply({ embeds: [embedMessage(`${message.member.user} Removidas **${count}** faixas duplicadas da fila``)] });
        } catch (err) {
            return message.reply({ embeds: [embedMessage("Opa! Ocorreu um erro ao remover os duplicados, por favor tente novamente.")] });
        }
    },
};

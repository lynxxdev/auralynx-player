const { Shoukaku, Connectors } = require("shoukaku");
const chalk = require("chalk");
const config = require('../config/config.json');

class ShoukakuHandler extends Shoukaku {
    constructor(client) {
        super(new Connectors.DiscordJS(client), config.LAVALINK_SERVERS, {
            moveOnDisconnect: true,
            resumable: true,
            resumableTimeout: 3600,
            reconnectTries: 100,
            restTimeout: 10000,
            reconnectInterval: 10000,
            alwaysSendResumeKey: true,
            resumeKey: "a key"
        });

        this.on('ready', (name, resumed) =>
            client.logger.log(`LAVALINK => [STATUS] ${name} conectada com sucesso.`, ` ${resumed ? 'Retomada.' : 'Nova'} conexão.`)
        );

        this.on('error', (name, error) => {
            if (!error.toLowerCase().includes("econnrefused")) client.logger.error(chalk.red(`LAVALINK => ${name}: Erro detectado.`, error))
        });

        this.on('close', (name, code, reason) =>
            client.logger.log(chalk.redBright(`LAVALINK => ${name}: Fechado, Código ${code}`, `Motivo ${reason || 'Nenhum motivo'}.`))
        );

        this.on('disconnect', (name, players, moved) =>
            client.logger.log(chalk.yellowBright(`LAVALINK => ${name}: Desconectado`, moved ? 'jogadores foram movidos' : 'jogadores foram desconectados'))
        );
    }
}

module.exports = ShoukakuHandler;

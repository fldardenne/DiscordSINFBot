const { SlashCommandBuilder } = require('@discordjs/builders');
const https = require('https');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('obofact')
        .setDescription('Returns a Obo fact'),

    async execute(client, interaction) {

        const options = {
            hostname: 'api.chucknorris.io',
            path: '/jokes/random',
            method: 'GET'
        };

        const req = https.request(options, res => {

            let data = "";
            if (res.statusCode === 200) {
                res.on('data', d => {
                    data += d;
                });

                res.on('end', () => {
                    const fact = JSON.parse(data);
                    let sent = fact.value;
                    sent = sent.replaceAll('Chuck Norris', 'Obo');
                    console.log(sent);
                    return interaction.reply(sent);
                });
            }
        });

        req.on('error', error => {
            return interaction.reply("Error while trying to get Obo fact");
        });

        req.end();

    },
};
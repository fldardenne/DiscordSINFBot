const { SlashCommandBuilder } = require('@discordjs/builders');
const https = require('https');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('pokémon')
		.setDescription('Retourne l\'image du pokémon avec l\'id donnée')
        .addIntegerOption(option => option.setName('id').setDescription("Id du pokémon")),

	async execute(interaction) {
        const id = interaction.options.getInteger('id');

        const options = {
            hostname: 'pokeapi.co',
            path: `/api/v2/pokemon/${id}/`,
            method: 'GET'
        };

        const req = https.request(options, res => {
            
            let data = "";
            if (res.statusCode === 200) {
                res.on('data', d => {
                    data += d;
                });

                res.on('end', () => {
                    const pokemon = JSON.parse(data);
                    const { sprites } = pokemon;
                    const imageLink = sprites["front_default"];
                    return interaction.reply(imageLink);
                });
            }

            else if (res.statusCode === 404) {
                return interaction.reply(`${id} pas trouvé!`);
            }

            else {
                return interaction.reply(`Erreur lors de la recherche du pokémon`);
            }
        });

        req.on('error', error => {
            return interaction.reply("Il y a eu une erreur lors de la recherche.");
        });

        req.end();

	},
};
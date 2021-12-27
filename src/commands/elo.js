const { SlashCommandBuilder } = require('@discordjs/builders');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('elo')
		.setDescription('Get elo with the user specified on chess.com')
		.addStringOption(option => option.setName('username').setDescription('Username of the user on chess.com')),
        
	async execute(interaction) {
		const username = interaction.options.getString('username');

        const options = {
            hostname: 'api.chess.com',
            path: `/pub/player/${username}/stats`,
            method: 'GET'
        };

        const getRating = (categoryInformation) => categoryInformation["last"]["rating"]; 

        const req = https.request(options, res => {
            
            let data = "";
            if (res.statusCode === 200) {
                res.on('data', d => {
                    data += d;
                });

                res.on('end', () => {
                    const player = JSON.parse(data);
                    const { chess_bullet, chess_blitz, chess_rapid } = player;

                    return interaction.reply(`${username} est ${getRating(chess_bullet)} en bullet, ${getRating(chess_blitz)} en blitz et ${getRating(chess_rapid)} en rapide`);
                });
            }

            else if (res.statusCode === 404) {
                return interaction.reply(`${username} pas trouvé sur chess.com`);
            }

            else {
                return interaction.reply(`Erreur lors de la recherche des ratings`);
            }
        });

        req.on('error', error => {
            return interaction.reply("Il y a eu une erreur lors de la recherche.");
        });

        req.end();
	},
};

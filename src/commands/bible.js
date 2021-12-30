const { SlashCommandBuilder } = require('@discordjs/builders');
const https = require('https');

const toReplace = {
    "God": "Obo",
    "Jesus": "JMH"
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bible')
        .setDescription('Returns a passage from the bible')
        .addStringOption(option => option
            .setName('book_name')
            .setDescription('Book name')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('chapter')
            .setDescription("Chapter")
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('verse')
            .setDescription("Verse")
            .setRequired(true)),

    async execute(client, interaction) {
        const book_name = interaction.options.getString('book_name');
        const chapter = interaction.options.getInteger('chapter');
        const verse = interaction.options.getInteger('verse');

        const options = {
            hostname: 'bible-api.com',
            path: `/${book_name}+${chapter}:${verse}`,
            method: 'GET'
        };

        const req = https.request(options, res => {

            let data = "";
            if (res.statusCode === 200) {
                res.on('data', d => {
                    data += d;
                });

                res.on('end', () => {
                    const row = JSON.parse(data);
                    let text = row.text;
                    Object.keys(toReplace).forEach((k) => {text=text.replaceAll(k, toReplace[k])})
                    return interaction.reply(text);
                });
            } else {
                return interaction.reply("The text was not found.");
            }
        });

        req.on('error', error => {
            return interaction.reply("Error while trying to get the Bible");
        });

        req.end();

    },
};
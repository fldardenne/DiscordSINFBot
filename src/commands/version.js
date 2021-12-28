const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('version')
		.setDescription('Return the commit hash on which the bot run'),
	async execute(client, interaction) {
        revision = require('child_process')
        .execSync('git rev-parse HEAD')
        .toString().trim()
		return interaction.reply("Running on the commit " + revision);
	},
};
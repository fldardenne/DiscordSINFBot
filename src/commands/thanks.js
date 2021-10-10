const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('thanks')
		.setDescription('Return the list of my contributor'),
	async execute(interaction) {
        contributor = require('child_process')
        .execSync("git log --pretty='%cn' | sort | uniq | sed '/GitHub/d'")
        .toString().trim()
		return interaction.reply(contributor);
	},
};
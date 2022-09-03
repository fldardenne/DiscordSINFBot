const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('crash')
		.setDescription('Crashes the bot. Used for debugging purposes.'),

	async execute(client, interaction) {
		throw "Crash!"
		return interaction.reply("The bot should have crashed!")
	},
}

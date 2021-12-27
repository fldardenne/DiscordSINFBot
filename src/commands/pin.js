const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pin")
		.setDescription("Allows non-administrators to pin messages")
		.addStringOption(option => option
			.setName("id")
			.setDescription("ID of the message you want to pin")),

	async execute(interaction) {
		const id = interaction.options.getString("id");

		if (!id) {
			return interaction.reply({ content: "You must provide a message ID", ephemeral: true });
		}
	}
}
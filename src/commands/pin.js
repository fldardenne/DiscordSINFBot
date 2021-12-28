const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pin")
		.setDescription("Allows non-administrators to pin messages")
		.addStringOption(option => option
			.setName("id")
			.setDescription("ID of the message you want to pin")
			.setRequired(true)),

	async execute(client, interaction) {
		const id = interaction.options.getString("id");
		const channel = await client.channels.fetch(interaction.channelId);

		const message = await channel.messages.fetch(id)
			.catch(() => undefined);

		if (!message) {
			return interaction.reply({ content: "Message could not be found! Are you sure you're passing a valid message ID?", ephemeral: true });
		}

		await message.pin();

		return interaction.reply({ content: "Message has been pinned!", ephemeral: true });
	}
}
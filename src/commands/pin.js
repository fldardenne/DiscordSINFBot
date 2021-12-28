const { SlashCommandBuilder } = require("@discordjs/builders");

const ROLE_NAME = "Pineur";
// const VOTE_SECONDS = 5 * 60; // 5 min
const VOTE_SECONDS = 2; // 5 min
const VOTE_THRESHOLD = 5;

const IN_FAVOUR_REACTION = "✅";
const AGAINST_REACTION = "❌";

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

		// if we have the special role that allows us to pin, pin instantly

		const member = interaction.member;

		if (member.roles.cache.some(role => role.name === ROLE_NAME)) {
			await message.pin();
			return interaction.reply({ content: "Message has been pinned!", ephemeral: true });
		}

		// otherwise, setup a vote

		message.react(IN_FAVOUR_REACTION);
		message.react(AGAINST_REACTION);

		const filter = (reaction, _) => {
			return reaction.emoji.name in [IN_FAVOUR_REACTION, AGAINST_REACTION];
		};

		message.awaitReactions({ filter, max: 1, time: 1000 * VOTE_SECONDS })

		setTimeout(() => {
			// refresh the cache
			
			message.react(IN_FAVOUR_REACTION);
			message.react(AGAINST_REACTION);

			const in_favour = message.reactions.cache.get(IN_FAVOUR_REACTION)?.count;
			const against = message.reactions.cache.get(AGAINST_REACTION)?.count;

			console.log(in_favour, against);

			if (!in_favour || !against) {
				console.log("[pin vote] someone removed one or more of the reactions");
				return;
			}

			// account for the bot's reaction

			in_favour--;
			against--;

			if (in_favour < VOTE_THRESHOLD) {
				console.log(`[pin vote] only ${in_favour} people voted in favour of pinning this message (threshold is ${VOTE_THRESHOLD})`);
				return;
			}

			if (against >= in_favour) {
				console.log(`[pin vote] more or the same number of people voted against the pin as in favour of the pin (${against} vs ${in_favour})`);
				return;
			}

			// finally, pin the message

			message.pin();
		}, 1000 * VOTE_SECONDS);

		return interaction.reply({ content: "Insufficient privileges to pin this message. We will now proceed to a vote! After 5 minutes, if there are at least 5 votes in favour of this pin and there are more people in favour than against it, your message will be pinned!", ephemeral: true });
	}
}
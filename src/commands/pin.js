const { SlashCommandBuilder } = require("@discordjs/builders");

const ROLE_NAME = "Pineur";
// const VOTE_SECONDS = 5 * 60; // 5 min
const VOTE_SECONDS = 3; // 5 min
const VOTE_THRESHOLD = 5;
const VOTE_EXCLUDE_AUTHOR = false; // true

const IN_FAVOUR_REACTION = "✅";
const AGAINST_REACTION = "❌";

function log(str) {
	console.log(str);
}

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

		const filter = (reaction, user) => {
			if (user.id === client.user.id) {
				return false; // reject reactions from bot
			}

			if (![IN_FAVOUR_REACTION, AGAINST_REACTION].includes(reaction.emoji.name)) {
				return false; // reject other reactions
			}

			if (VOTE_EXCLUDE_AUTHOR && user.id === message.author.id) {
				return false; // reject reactions from original poster if VOTE_EXCLUDE_AUTHOR is set
			}

			return true;
		};
		
		const collector = message.createReactionCollector({ filter, time: VOTE_SECONDS * 1000 });
		
		collector.on('collect', (reaction, user) => {
			log(`${user.tag} reacted with ${reaction.emoji.name}`);
		});
		
		collector.on('end', collected => {
			// count votes

			let in_favour = 0;
			let against = 0;

			for (let reaction of collected) {
				log(reaction[0]);
				
				const name = reaction[0];

				in_favour += name === IN_FAVOUR_REACTION;
				against += name === AGAINST_REACTION;
			}

			log(`[pin vote] ${in_favour} people voted in favour, ${against} people voted against`);

			// decide whether or not to pin

			if (in_favour < VOTE_THRESHOLD) {
				log(`[pin vote] only ${in_favour} people voted in favour of pinning this message (threshold is ${VOTE_THRESHOLD})`);
				return;
			}

			if (against >= in_favour) {
				log(`[pin vote] more or the same number of people voted against the pin as in favour of the pin (${against} vs ${in_favour})`);
				return;
			}

			// finally, pin the message

			message.pin();
		});

		return interaction.reply({ content: "Insufficient privileges to pin this message. We will now proceed to a vote! After 5 minutes, if there are at least 5 votes in favour of this pin and there are more people in favour than against it, your message will be pinned!", ephemeral: true });
	}
}
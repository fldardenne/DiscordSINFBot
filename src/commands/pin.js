const { SlashCommandBuilder } = require("@discordjs/builders");

const ROLE_NAME = "Pineur";
// const VOTE_SECONDS = 5 * 60; // 5 min
const VOTE_SECONDS = 3; // 5 min
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

		// message.react(IN_FAVOUR_REACTION);
		// message.react(AGAINST_REACTION);

		const filter = (reaction, user) => {
			return reaction.emoji.name === '👍' && user.id === message.author.id;
		};
		
		const collector = message.createReactionCollector({ filter, time: 15000 });
		
		collector.on('collect', (reaction, user) => {
			console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
		});
		
		collector.on('end', collected => {
			console.log(`Collected ${collected.size} items`);
		});
		

		// const filter = (reaction, _) => {
		// 	return true;//[IN_FAVOUR_REACTION, AGAINST_REACTION].includes(reaction.emoji.name);
		// };

		// const collector = message.createReactionCollector(filter, { time: 1000 * VOTE_SECONDS });

		// let in_favour = 0;
		// let against = 0;

		// collector.on("collect", (reaction, _) => {
		// 	console.log(reaction.count, reaction.emoji.name)

		// 	in_favour += reaction.count * (reaction.emoji.name === IN_FAVOUR_REACTION);
		// 	against += reaction.count * (reaction.emoji.name === AGAINST_REACTION);
		// });

		// collector.on("end", collected => {
		// 	console.log(collected.size, in_favour, against)
		// });

		// interaction.reply({ content: "Insufficient privileges to pin this message. We will now proceed to a vote! After 5 minutes, if there are at least 5 votes in favour of this pin and there are more people in favour than against it, your message will be pinned!", ephemeral: true })
		// 	.then(() => {})

		// message.awaitReactions({ filter, max: 1, time: 1000 * VOTE_SECONDS, errors: ["time"] })
		// 	.then(collected => {
		// 		const reaction = collected.first();

		// 		in_favour += reaction.count * (reaction.emoji.name === IN_FAVOUR_REACTION);
		// 		against += reaction.count * (reaction.emoji.name === AGAINST_REACTION);
		// 	})
		// 	.catch(collected => {
		// 		message.reply("Someone removed one or more of the reactions necessary for a pin vote!")
		// 	});

		// // account for the bot's reaction

		// in_favour--;
		// against--;

		// if (in_favour < VOTE_THRESHOLD) {
		// 	console.log(`[pin vote] only ${in_favour} people voted in favour of pinning this message (threshold is ${VOTE_THRESHOLD})`);
		// 	return;
		// }

		// if (against >= in_favour) {
		// 	console.log(`[pin vote] more or the same number of people voted against the pin as in favour of the pin (${against} vs ${in_favour})`);
		// 	return;
		// }

		// // finally, pin the message

		// message.pin();

		// return null;
	}
}
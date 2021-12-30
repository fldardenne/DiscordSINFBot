const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const ROLE_NAME = "Pineur";
const VOTE_MINUTES = 5;
const VOTE_THRESHOLD = 5;
const VOTE_EXCLUDE_AUTHOR = false;

const IN_FAVOUR_REACTION = "✅";
const AGAINST_REACTION = "❌";

const ICONS = {
	sadge:  "https://cdn.discordapp.com/emojis/852922249098952764.png?size=96",
	salute: "https://cdn.discordapp.com/emojis/852922249442230292.png?size=96",
	waah:   "https://cdn.discordapp.com/emojis/852922249065660476.png?size=96",
	angry:  "https://cdn.discordapp.com/emojis/852922248997896192.png?size=96",
	silly:  "https://cdn.discordapp.com/emojis/852922249353756732.png?size=96",
	uncool: "https://cdn.discordapp.com/emojis/852922249223995412.png?size=96",
};

function gen_rich(content, icon, colour) {
	const embed = new MessageEmbed()
		.setTitle("Pin vote")
		.setDescription(content)
		.setThumbnail(ICONS[icon])
		.setColor(colour);

	return embed;
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
		
		const collector = message.createReactionCollector({ filter, time: VOTE_MINUTES * 60 * 1000 });
		
		collector.on('collect', (reaction, user) => {
			// console.log(`${user.tag} reacted with ${reaction.emoji.name}`);
		});
		
		collector.on('end', collected => {
			// count votes

			let in_favour = 0;
			let against = 0;

			for (let reaction of collected) {
				const name = reaction[0];
				
				in_favour += name === IN_FAVOUR_REACTION;
				against += name === AGAINST_REACTION;
			}

			// log(`[pin vote] ${in_favour} people voted in favour, ${against} people voted against`);

			// decide whether or not to pin

			if (in_favour < VOTE_THRESHOLD) {
				let rich;
				
				if (in_favour == 0) {
					rich = gen_rich(`No one voted in favour of pinning this message (threshold is ${VOTE_THRESHOLD}). Message will not be pinned.`, "silly", "#ff7777");
				}

				else if (in_favour == 1) {
					rich = gen_rich(`Only one person voted in favour of pinning this message (threshold is ${VOTE_THRESHOLD}). Message will not be pinned.`, "sadge", "#ff7777");
				}

				else {
					rich = gen_rich(`Only ${in_favour} people voted in favour of pinning this message (threshold is ${VOTE_THRESHOLD}). Message will not be pinned.`, "uncool", "#ff7777");
				}

				message.reply({ embeds: [rich] });
				return;
			}

			if (against >= in_favour) {
				const rich = gen_rich(`More or the same number of people voted against the pin as in favour of the pin (${against} vs ${in_favour}). Message will not be pinned.`, "waah", "#ff7777");

				message.reply({ embeds: [rich] });
				return;
			}

			// finally, pin the message

			const rich = gen_rich("Vote was successful! Message will now be pinned!", "salute", "#77ff77");
			message.reply({ embeds: [rich] });

			message.pin();
		});

		const rich = gen_rich(`${interaction.user.tag} has insufficient privileges to pin this message! We will now proceed to a vote! After ${VOTE_MINUTES} minutes, if there are at least ${VOTE_THRESHOLD} votes in favour of this pin and there are more people in favour than against it, your message will be pinned!`, "angry", "#ff7733");
		message.reply({ embeds: [rich] });

		return interaction.reply({ content: "Insufficient privileges to pin this message!", ephemeral: true });
	}
}
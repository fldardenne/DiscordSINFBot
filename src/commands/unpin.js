// TODO combine common functions between this & pin.js (and perhaps also the voting system from confess.js)

const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const ROLE_NAME = "Pineur";
const VOTE_MINUTES = 20;
const VOTE_THRESHOLD = 2;
const VOTE_EXCLUDE_PINNER = true;

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
		.setTitle("Unpin vote")
		.setDescription(content)
		.setThumbnail(ICONS[icon])
		.setColor(colour);

	return embed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unpin')
		.setDescription('Allows non-administrators to unpin messages')
		.addStringOption(option => option
			.setName('id')
			.setDescription('ID of the message you want to unpin')
			.setRequired(true),
    	),

	async execute(client, interaction) {
		const id = interaction.options.getString('id');
		const channel = await client.channels.fetch(interaction.channelId);

		const message = await channel.messages.fetch(id).catch(() => undefined);

		if (!message) {
			return interaction.reply({ content: "Message could not be found! Are you sure you're passing a valid message ID?", ephemeral: true });
		}

		// make sure the message is actually pinned

		let is_pinned = false;

		await channel.messages.fetchPinned() // javascript moment
			.then((pinned_messages) => {
				pinned_messages.each((pinned) => {
					is_pinned |= pinned.id === message.id;
				})
			});

		if (!is_pinned) {
			return interaction.reply({ content: `Message wasn't yet pinned!`, ephemeral: true });
		}

		// if we have the special role that allows us to unpin, unpin instantly

		const member = interaction.member;

		if (member.roles.cache.some(role => role.name === ROLE_NAME)) {
			await message.unpin();
			return interaction.reply({ content: "Message has been unpinned!", ephemeral: true });
		}

		// otherwise, setup a vote

		let rv = interaction.reply({ content: "Insufficient privileges to unpin this message!", ephemeral: true });

		const rich = gen_rich(`${interaction.user.tag} has insufficient privileges to unpin this message! We will now proceed to a vote! After ${VOTE_MINUTES} minutes, if there are at least ${VOTE_THRESHOLD} votes in favour of this unpin and there are more people in favour than against it, your message will be unpinned!`, "angry", "#ff7733");
		let vote = await message.reply({ embeds: [rich] });

		vote.react(IN_FAVOUR_REACTION);
		vote.react(AGAINST_REACTION);

		const filter = (reaction, user) => {
			if (user.id === client.user.id) {
				return false; // reject reactions from bot
			}

			if (![IN_FAVOUR_REACTION, AGAINST_REACTION].includes(reaction.emoji.name)) {
				return false; // reject other reactions
			}

			if (VOTE_EXCLUDE_PINNER && user.id === interaction.user.id) {
				return false; // reject reactions from original poster if VOTE_EXCLUDE_PINNER is set
			}

			return true;
		};
    
		const collector = vote.createReactionCollector({ filter, time: VOTE_MINUTES * 60 * 1000 });

		// count votes

		let in_favour = 0;
		let against = 0;

		collector.on('collect', (reaction, user) => {
			const name = reaction.emoji.name;
			
			in_favour += name === IN_FAVOUR_REACTION;
			against += name === AGAINST_REACTION;
		});
		
		// once time is up, decide whether or not to unpin

		collector.on('end', collected => {
			// console.log(`[unpin vote] ${in_favour} people voted in favour, ${against} people voted against`);

			if (in_favour < VOTE_THRESHOLD) {
				let rich;
				
				if (in_favour == 0) {
					rich = gen_rich(`No one voted in favour of unpinning this message (threshold is ${VOTE_THRESHOLD}). Message will not be unpinned.`, "silly", "#ff7777");
				}

				else if (in_favour == 1) {
					rich = gen_rich(`Only one person voted in favour of unpinning this message (threshold is ${VOTE_THRESHOLD}). Message will not be unpinned.`, "sadge", "#ff7777");
				}

				else {
					rich = gen_rich(`Only ${in_favour} people voted in favour of unpinning this message (threshold is ${VOTE_THRESHOLD}). Message will not be unpinned.`, "uncool", "#ff7777");
				}

				vote.reply({ embeds: [rich] });
				return;
			}

			if (against >= in_favour) {
				const rich = gen_rich(`More or the same number of people voted against the unpin as in favour of the unpin (${against} vs ${in_favour}). Message will not be unpinned.`, "waah", "#ff7777");

				vote.reply({ embeds: [rich] });
				return;
			}

			// finally, unpin the message

			const rich = gen_rich("Vote was successful! Message will now be unpinned!", "salute", "#77ff77");
			vote.reply({ embeds: [rich] });

			message.unpin();
		});

		return rv;
	}
}

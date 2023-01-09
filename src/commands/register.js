// the Discord API doesn't really allow for easily making serial forms like this, so it's not the most readable code ever
// but, as Karl Marx once said, "Das ist das dritte mal diese Woche, dass einer der Patienten spontane Selbstenzündung erlitt."

const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageButton } = require("discord.js")
const { MessageSelectMenu } = require("discord.js")
const { MessageActionRow } = require("discord.js")
const { MessageEmbed } = require("discord.js")
const { readFileSync } = require("fs")

const TIMEOUT_MINUTES = 15

async function join_channels(interaction, channels) {
	let str = ""
	const count = channels.length

	for (const [ i, ent ] of channels.entries()) {
		const channel = interaction.guild.channels.cache.get(ent.value)

		if (!channel) {
			continue
		}

		channel.permissionOverwrites.create(interaction.user, { SEND_MESSAGES: true, VIEW_CHANNEL: true })
		str += `${channel}` // interpolate to call .toString on GuildChannel instance

		if (i <= count - 2) {
			str += ", "
		}

		if (i == count - 2) {
			str += "and "
		}
	}

	let space_Oof_comma_that_apostrophe_s_a_lot_exclamation_mark = ""

	if (count > 10) {
		space_Oof_comma_that_apostrophe_s_a_lot_exclamation_mark = " Oof, that's a lot!"
	}

	return [ str, space_Oof_comma_that_apostrophe_s_a_lot_exclamation_mark ]
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Allows non-administrators to join certain channels'),

	async execute(client, interaction) {
		// read the database of channels
		// not super super ideal to read this each time, but we're using node anyway, it's not like this is using up comparatively many resources ;)

		const channels = JSON.parse(readFileSync("channels.json"))

		// first part of the form thing is a dropdown for the different categories the user can choose from

		const category_embed = new MessageEmbed()
			.setTitle("Category selection")
			.setDescription("Which category is the channel you wanna join in? You can cancel now by dismissing this message.")
			.setColor("BLURPLE")

		const category_row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId("category")
					.setPlaceholder("Select channel category")
					.setOptions(channels.categories)

					// user can't select multiple categories at a time

					.setMinValues(1)
					.setMaxValues(1)
			)

		// then, we ask how specific the user would like to be
		// i.e., do they want to join all channels of a category, or only a few?

		const specificity_embed = new MessageEmbed()
			.setTitle("Choose specificity")
			.setColor("BLURPLE")

		const specificity_row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId("granular")
					.setLabel("Only specific channels")
					.setStyle("SECONDARY"),

				new MessageButton()
					.setCustomId("all")
					.setLabel("All channels")
					.setStyle("PRIMARY")
			)

		// if they asked for granular control over which channels they join, slap them with another dropdown

		const granular_embed = new MessageEmbed()
			.setTitle("Select channels")
			.setColor("BLURPLE")

		// finally, we tell the user they're done, and invite them to idk do something

		const done_embed = new MessageEmbed()
			.setTitle("All done!")
			.setColor("BLURPLE")

		// actually send the message
		// this message will be edited each step of the way

		await interaction.reply({
			embeds: [ category_embed ],
			components: [ category_row ],
			ephemeral: true,
		})

		const reply = await interaction.fetchReply()

		// create collector for component interactions
		// we wanna filter out all interactions not made on the message we replied

		const filter = component => reply.id === component.message.id
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: TIMEOUT_MINUTES * 60 * 1000 })

		let selected_category

		collector.on('collect', async component => {
			// category selection

			if (component.customId === "category") {
				let name = "Unknown"

				for (const category of channels.categories) {
					if (category.value !== component.values[0]) {
						continue
					}

					selected_category = category
					name = category.label
				}

				specificity_embed.setDescription(`Would you like to join all channels of your selected category (${name}) or only a few? You can still cancel now by dismissing this message.`)

				await component.update({
					embeds: [ specificity_embed ],
					components: [ specificity_row ],
				})
			}

			// specificity selection

			if (component.customId === "all") {
				const [ channels_str, space_Oof_comma_that_apostrophe_s_a_lot_exclamation_mark ] = await join_channels(interaction, selected_category.channels)
				const channel_count = selected_category.channels.length

				done_embed.setDescription(`You have been registered to all ${channel_count} of the channels of ${selected_category.label} (${channels_str})!${space_Oof_comma_that_apostrophe_s_a_lot_exclamation_mark}`)

				await component.update({
					embeds: [ done_embed ],
					components: [],
				})

				collector.stop()
			}

			if (component.customId === "granular") {
				granular_embed.setDescription(`You asked to join only specific channels from the ${selected_category.label} category, and we delivered. Which channels would you like to join? You can select multiple (scrolling may be necessary to see all of them on desktop). You can *still* still cancel now by dismissing this message.`)

				const granular_row = new MessageActionRow()
					.addComponents(
						new MessageSelectMenu()
							.setCustomId("channels")
							.setPlaceholder("Select channels")
							.setOptions(selected_category.channels)

							// user can select as many categories as they want

							.setMinValues(1)
							.setMaxValues(selected_category.channels.length)
					)

				await component.update({
					embeds: [ granular_embed ],
					components: [ granular_row ]
				})
			}

			// channel selection (only if user selected granular specificity)

			if (component.customId === "channels") {
				let channels = []

				for (const channel of selected_category.channels) {
					if (!component.values.includes(channel.value)) {
						continue
					}

					channels.push(channel)
				}

				const [ channels_str, space_Oof_comma_that_apostrophe_s_a_lot_exclamation_mark ] = await join_channels(interaction, channels)

				done_embed.setDescription(`You have been registered to ${channels_str}!${space_Oof_comma_that_apostrophe_s_a_lot_exclamation_mark}`)

				await component.update({
					embeds: [ done_embed ],
					components: [],
				})

				collector.stop()
			}
		})
	}
}

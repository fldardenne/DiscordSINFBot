// the Discord API doesn't really allow for easily making serial forms like this, so it's not the most readable code ever
// but, as Karl Marx once said, "Das ist das dritte mal diese Woche, dass einer der Patienten spontane Selbstenzündung erlitt."

const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageButton } = require("discord.js");
const { MessageSelectMenu } = require("discord.js");
const { MessageActionRow } = require("discord.js");
const { MessageEmbed } = require("discord.js");

const TIMEOUT_MINUTES = 15

const CATEGORIES = [
	{ label: "BAC1", value: "bac1", description: "1st year students", courses: [
		{ label: "LINFO1111 (Analyse)",                         value: "linfo1111-analyse" },
		{ label: "LINFO1101 (Introduction à la programmation)", value: "linfo1101-introduction-programmation" },
		{ label: "LINFO1115b (Économie politique)",             value: "linfo1115b-economie-politique" },
		{ label: "LINFO1001 (Projets en informatique 1)",       value: "linfo1001-projets-informatique-1" },
		{ label: "LESPO1113d (Sociologie 🤮)",                  value: "lespo1113d-sociologie" },
		{ label: "LINFO1140 (Électroniques)",                   value: "lespo1140-électroniques" },
		{ label: "LINFO1103 (Algorithmique)",                   value: "lespo1103-algorithmique" },
		{ label: "LINFO1002 (Projets en informatique 2)",       value: "linfo1002-projet-en-informatique-2" },
		{ label: "LCOPS1124c (Philosophie)",                    value: "lcops1124c-philosophie" },
		{ label: "LINFO1112 (Algèbre)",                         value: "linfo1112-algebre" },
		{ label: "LESPO1122c (Droit)",                          value: "lespo1122c-droit" },
	]},
	{ label: "BAC2", value: "bac2", description: "2nd year students" },
	{ label: "BAC3", value: "bac3", description: "3rd year students" },
	{ label: "APPSINF", value: "appsinf", description: "Approfondissement en sciences informatiques" },
	{ label: "Other minors", value: "minors" },
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Allows non-administrators to join course-related channels'),

	async execute(client, interaction) {
		// first thing to do here is send a dropdown for the different categories for the user to choose from

		const category_embed = new MessageEmbed()
			.setTitle("Category selection")
			.setDescription("Which category is the course you wanna join in? You can cancel now by dismissing this message.")
			.setColor("BLURPLE")

		const category_row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId("category")
					.setPlaceholder("Select course category")
					.setOptions(CATEGORIES)

					// user can't select multiple categories at a time

					.setMinValues(1)
					.setMaxValues(1)
			)

		// then, we ask how specific the user would like to be
		// i.e., do they want to join all course channels of a category, or only a few?

		const specificity_embed = new MessageEmbed()
			.setTitle("Choose specificity")
			.setColor("BLURPLE")

		const specificity_row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId("granular")
					.setLabel("Only specific courses")
					.setStyle("SECONDARY")
					.setDisabled(true),

				new MessageButton()
					.setCustomId("all")
					.setLabel("All courses")
					.setStyle("PRIMARY")
			)

		// finally, we tell the user they're done, and invite them to give a shitty take about the course in question

		const done_embed = new MessageEmbed()
			.setTitle("All done!")
			.setColor("BLURPLE")

		// create collector for component interactions
		// we wanna filter out all interactions not made by the user who executed this command

		const filter = component => component.user.id === interaction.user.id
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: TIMEOUT_MINUTES * 60 * 1000 })

		let selected_category

		collector.on('collect', async component => {
			// category selection

			if (component.customId === "category") {
				let name = "Unknown"

				for (const category of CATEGORIES) {
					if (category.value !== component.values[0]) {
						continue
					}

					selected_category = category
					name = category.label
				}

				specificity_embed.setDescription(`Would you like to join all course channels of your selected category (${name}) or only a few? You can still cancel now by dismissing this message.`)

				component.update({
					embeds: [ specificity_embed ],
					components: [ specificity_row ],
				})
			}

			// specificity selection

			if (component.customId === "all") {
				let channels_str = ""
				const course_count = selected_category.courses.length

				for (const [ i, course ] of selected_category.courses.entries()) {
					// TODO actually add the user to the channel

					channels_str += `#${course.value}`

					if (i < course_count - 2) {
						channels_str += ", "
					}

					if (i == course_count - 2) {
						channels_str += "and "
					}
				}

				let oof_comma_that_apostrophe_s_a_lot_exclamation_mark_space = ""

				if (course_count > 10) {
					oof_comma_that_apostrophe_s_a_lot_exclamation_mark_space = "Oof, that's a lot! "
				}

				done_embed.setDescription(`You have been registered to all ${course_count} of the channels of ${selected_category.label} (${channels_str})! ${oof_comma_that_apostrophe_s_a_lot_exclamation_mark_space}Don't forget to give an opinion no one asked for on the course in question!`)

				component.update({
					embeds: [ done_embed ],
					components: [],
				})
			}
		})

		// actually send the message
		// this message will be edited each step of the way

		await interaction.reply({
			embeds: [ category_embed ],
			components: [ category_row ],
			ephemeral: true,
		})
	}
}

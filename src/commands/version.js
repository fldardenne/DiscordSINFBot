const { SlashCommandBuilder } = require('@discordjs/builders')
const { execSync } = require('child_process')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('version')
		.setDescription('Return branch & commit hash the bot is running on'),

	async execute(client, interaction) {
		const commit = execSync('git rev-parse HEAD')
			.toString()
			.trim()

		const branch = execSync('git rev-parse --abbrev-ref HEAD')
			.toString()
			.trim()

		const remote = execSync('git config --get remote.origin.url')
			.toString()
			.trim()

		const system = execSync('uname -r')
			.toString()
			.trim()

		return interaction.reply(`Running on commit \`${commit}\`, branch \`${branch}\` (\`${remote}\`, ${system})`)
	},
}

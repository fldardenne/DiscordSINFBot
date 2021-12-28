const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('thanks')
		.setDescription('Return the list of my contributor'),
	async execute(client, interaction) {
        contributor = require('child_process')
        .execSync("git log --pretty='%cn' | sort | uniq | sed '/GitHub/d'")
        .toString().trim()

        const embed = new MessageEmbed()
                                .setTitle('Thanks')
                                .setDescription(contributor)
                                .setAuthor(interaction.user.username)
                                .setColor('#0099ff')
                                .setThumbnail("https://images.emojiterra.com/twitter/v13.1/512px/1f44f.png");
        interaction.reply({ embeds: [embed] });
        const message =  interaction.fetchReply();
	},
};
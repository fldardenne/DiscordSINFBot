const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder().setName('poop').setDescription('Poop...'),

  async execute(client, interaction) {
    return interaction.reply(
      'https://cdn.discordapp.com/attachments/654964496959406143/798116116185481236/java.mp4',
    )
  },
}

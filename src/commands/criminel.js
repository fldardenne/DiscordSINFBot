const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criminel')
    .setDescription('Criminel!'),

  async execute(client, interaction) {
    return interaction.reply(
      'https://media.discordapp.net/attachments/636295672861032448/890574900346097684/unknown.png',
    )
  },
}

const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('méchant')
    .setDescription('Méchant...'),

  async execute(client, interaction) {
    return interaction.reply(
      'https://cdn.discordapp.com/attachments/654964496959406143/797178131400097863/AT-cm_997620632.mp4',
    )
  },
}

const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('motivation')
    .setDescription('Donne de la motivation, ou pas...'),

  async execute(client, interaction) {
    const random = Math.floor(Math.random() * 20)
    let videoLink = ''

    switch (random) {
      case 0:
        videoLink =
          'https://cdn.discordapp.com/attachments/492790830210220042/797461634485321789/LE_BAC_1_1.mp4'
        break
      case 1:
        videoLink =
          'https://cdn.discordapp.com/attachments/659794451866058768/704717601556660314/guigui.webm'
        break
      default:
        videoLink =
          'https://cdn.discordapp.com/attachments/492790830210220042/797461680481239050/never-give-up-your-waaaaaaaaaaaay.mp4'
    }

    return interaction.reply(videoLink)
  },
}

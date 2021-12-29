const { SlashCommandBuilder } = require('@discordjs/builders')
const https = require('https')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pokémon')
    .setDescription('Returns the image of the pokemon')
    .addIntegerOption(option =>
      option.setName('id').setDescription('pokemon id'),
    ),

  async execute(client, interaction) {
    const id = interaction.options.getInteger('id')

    const options = {
      hostname: 'pokeapi.co',
      path: `/api/v2/pokemon/${id}/`,
      method: 'GET',
    }

    const req = https.request(options, res => {
      let data = ''
      if (res.statusCode === 200) {
        res.on('data', d => {
          data += d
        })

        res.on('end', () => {
          const pokemon = JSON.parse(data)
          const { sprites } = pokemon
          const imageLink = sprites['front_default']
          return interaction.reply(imageLink)
        })
      } else if (res.statusCode === 404) {
        return interaction.reply(`${id} not found!`)
      } else {
        return interaction.reply(`Error while trying to search for pokemon`)
      }
    })

    req.on('error', error => {
      return interaction.reply('Error while trying to search for pokemon')
    })

    req.end()
  },
}

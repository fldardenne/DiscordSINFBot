const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

const https = require('https')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('elo')
    .setDescription('Get elo with the user specified on chess.com')
    .addStringOption(option =>
      option
        .setName('username')
        .setDescription('Username of the user on chess.com')
        .setRequired(true),
    ),

  async execute(client, interaction) {
    let username = interaction.options.getString('username')
    username = username.toLowerCase()

    const options = {
      hostname: 'api.chess.com',
      path: `/pub/player/${username}/stats`,
      method: 'GET',
    }

    const getRating = categoryInformation =>
      categoryInformation !== undefined
        ? `${categoryInformation['last']['rating']}`
        : 'pas classé'

    const req = https.request(options, res => {
      let data = ''
      if (res.statusCode === 200) {
        res.on('data', d => {
          data += d
        })

        res.on('end', () => {
          const player = JSON.parse(data)
          const { chess_bullet, chess_blitz, chess_rapid } = player
          const embed = new MessageEmbed()
            .setTitle('elo')
            .setDescription(username)
            .setAuthor(interaction.user.username)
            .setColor('#0099ff')
            .setThumbnail(
              'https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png',
            )
            .addFields(
              {
                name: 'bullet',
                value: getRating(chess_bullet).toString(),
                inline: true,
              },
              {
                name: 'blitz',
                value: getRating(chess_blitz).toString(),
                inline: true,
              },
              {
                name: 'rapide',
                value: getRating(chess_rapid).toString(),
                inline: true,
              },
            )
          interaction.reply({ embeds: [embed] })
          const message = interaction.fetchReply()
        })
      } else if (res.statusCode === 404) {
        const embed = new MessageEmbed()
          .setTitle('ERREUR')
          .setDescription(`${username} pas trouvé sur chess.com`)
          .setAuthor(interaction.user.username)
          .setColor('#FF1919')
          .setThumbnail(
            'https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png',
          )
        interaction.reply({ embeds: [embed] })
        const message = interaction.fetchReply()
      } else {
        const embed = new MessageEmbed()
          .setTitle('ERREUR')
          .setDescription(`Erreur lors de la recherche des ratings`)
          .setAuthor(interaction.user.username)
          .setColor('#FF1919')
          .setThumbnail(
            'https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png',
          )
        interaction.reply({ embeds: [embed] })
        const message = interaction.fetchReply()
      }
    })

    req.on('error', error => {
      const embed = new MessageEmbed()
        .setTitle('ERREUR')
        .setDescription(`Il y a eu une erreur lors de la recherche.`)
        .setAuthor(interaction.user.username)
        .setColor('#FF1919')
        .setThumbnail(
          'https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png',
        )
      interaction.reply({ embeds: [embed] })
      const message = interaction.fetchReply()
    })

    req.end()
  },
}

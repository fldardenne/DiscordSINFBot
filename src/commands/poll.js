const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Creates a poll')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('Poll question')
        .setRequired(true),
    )

    // unfortunately, Discord slash commands don't yet support variadic arguments: https://github.com/discord/discord-api-docs/issues/2331

    .addStringOption(option =>
      option.setName('answers').setDescription('Possible poll answers'),
    ),

  async execute(client, interaction) {
    const question = interaction.options.getString('question')
    const answers = interaction.options
      .getString('answers')
      ?.split(' ')
      .map(x => x.replaceAll('_', ' '))

    if (!question) {
      return interaction.reply({
        content: 'You must provide a value for the question option',
        ephemeral: true,
      })
    }

    const answer_emojis = [
      '0️⃣',
      '1️⃣',
      '2️⃣',
      '3️⃣',
      '4️⃣',
      '5️⃣',
      '6️⃣',
      '7️⃣',
      '8️⃣',
      '9️⃣',
    ]

    if (answers?.length == 1) {
      return interaction.reply({
        content: 'A poll may not have a single possible answer',
        ephemeral: true,
      })
    }

    if (answers?.length > answer_emojis.length) {
      return interaction.reply({
        content: `You may not have more than ${answer_emojis.length} possible answers (you passed ${answers.length})`,
        ephemeral: true,
      })
    }

    let poll_content = ''

    if (answers) {
      for (const [i, answer] of answers.entries()) {
        poll_content += `${answer_emojis[i]} ${answer}\n`
      }
    }

    const embed = new MessageEmbed()
      .setTitle(question)
      .setDescription(poll_content)
      .setAuthor(interaction.user.username)
      .setColor(interaction.user.accent_color)
      .setThumbnail(
        'https://cdn.discordapp.com/emojis/770002495614877738.png?size=44',
      )

    await interaction.reply({ embeds: [embed] })
    const message = await interaction.fetchReply()

    // add reactions

    for (let i = 0; i < answers?.length; i++) {
      message.react(answer_emojis[i])
    }

    if (!answers) {
      message.react('✅')
      message.react('❌')
    }

    return message
  },
}

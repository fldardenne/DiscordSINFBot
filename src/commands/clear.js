const { SlashCommandBuilder } = require('@discordjs/builders')
const { Permissions } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Prune up to 99 messages.')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to prune')
        .setRequired(true),
    ),
  async execute(client, interaction) {
    const amount = interaction.options.getInteger('amount')

    if (
      !interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)
    ) {
      return interaction.reply({
        content: "You don't have the permission to do that.",
        ephemeral: true,
      })
    }

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: 'You need to input a number between 0 and 99.',
        ephemeral: true,
      })
    }

    await interaction.channel.bulkDelete(amount, true).catch(error => {
      console.error(error)
      interaction.reply({
        content: 'There was an error trying to prune messages in this channel!',
        ephemeral: true,
      })
    })

    return interaction.reply({
      content: `Successfully pruned \`${amount}\` messages.`,
      ephemeral: true,
    })
  },
}

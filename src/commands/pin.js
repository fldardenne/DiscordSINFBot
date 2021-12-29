const fs = require('fs')
const { SlashCommandBuilder } = require('@discordjs/builders')

const ROLE_NAME = 'Pineur'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pin')
    .setDescription('Allows non-administrators to pin messages')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('ID of the message you want to pin')
        .setRequired(true),
    ),

  async execute(client, interaction) {
    const id = interaction.options.getString('id')
    const channel = await client.channels.fetch(interaction.channelId)

    const message = await channel.messages.fetch(id).catch(() => undefined)

    if (!message) {
      return interaction.reply({
        content:
          "Message could not be found! Are you sure you're passing a valid message ID?",
        ephemeral: true,
      })
    }

    let permission = false

    // do we have the special role that allows us to pin?

    const member = interaction.member

    if (member.roles.cache.some(role => role.name === ROLE_NAME)) {
      permission |= true
    }

    if (!permission) {
      let rv = interaction.reply({
        content:
          'Insufficient privileges to pin this message. This is a very severe offence. This incident will be reported to the administrator.',
        ephemeral: true,
      })

      fs.appendFileSync(
        'log',
        `[${new Date()}] ${
          member.user.tag
        } attempted to pin a message without sufficient privileges`,
      )
      return rv
    }

    // finally pin the message

    await message.pin()
    return interaction.reply({
      content: 'Message has been pinned!',
      ephemeral: true,
    })
  },
}

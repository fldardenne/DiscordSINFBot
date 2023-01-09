const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')
require("dotenv").config({path: "../.env"})

const VOTE_MINUTES = 60 * 24
const IN_FAVOUR_REACTION = '✅'
const AGAINST_REACTION = '❌'
const WARN_USER_REACTION = '⚠️'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confess')
        .setDescription(
            'Confess a sin to the entire world and feel the redemption growing inside you',
        )
        .addStringOption(option =>
            option
                .setName('sin')
                .setDescription('A sin to confess')
                .setRequired(true),
        ),

    async execute(client, interaction) {
        const sin = interaction.options.getString('sin')
        const adminChannel = await client.channels.fetch(process.env.ADMIN_CHANNEL_ID)
        const confessionChannel = await client.channels.fetch(process.env.CONFESSION_CHANNEL_ID)

        const confessionEmbed = new MessageEmbed()
            .setTitle('New confession')
            .setDescription(sin)
            .setColor('BLURPLE')

        let vote = await adminChannel.send({embeds: [confessionEmbed]})

        vote.react(IN_FAVOUR_REACTION)
        vote.react(AGAINST_REACTION)
        vote.react(WARN_USER_REACTION)

        const filter = (reaction, user) => {
            return (
                [IN_FAVOUR_REACTION, AGAINST_REACTION, WARN_USER_REACTION].includes(reaction.emoji.name) &&
                user.id !== client.user.id
            )
        }

        let collector = vote.createReactionCollector({
            filter,
            time: VOTE_MINUTES * 60 * 1000,
        })

        collector.on('collect', async (reaction, user) => {
            collector.stop()

            if (reaction.emoji.name === IN_FAVOUR_REACTION) {
                await vote.edit({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Confession approved')
                            .setDescription(sin)
                            .setColor('GREEN'),
                    ],
                })

                await confessionChannel.send({embeds: [confessionEmbed]})

                await interaction.member
                    .send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle('Confession approved')
                                .setDescription(
                                    `Your confession "*${sin}*" was approved. It is now available publicly.`,
                                )
                                .setColor('GREEN'),
                        ],
                    })
                    .catch(() => undefined)
            } else if (reaction.emoji.name === WARN_USER_REACTION) {
                await vote.edit({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Confession rejected and user warned')
                            .setDescription(sin)
                            .setColor('ORANGE')
                    ]
                })

                await interaction.member
                    .send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle('WARNING')
                                .setDescription(`Your confession "*${sin}*" has been rejected and you have been issued a
                                 warn. Please note that confessions are **NOT** intended for this purpose. This includes
                                  (but not limited to): asking questions about courses (refer to the channel in question
                                  ), sexual/violent/discriminating content. Please do help keep this a safe space :)`)
                                .setColor("ORANGE")
                        ]
                    })
                    .catch(() => undefined)
            } else {
                await vote.edit({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Confession rejected')
                            .setDescription(sin)
                            .setColor('RED'),
                    ],
                })

                await interaction.member
                    .send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle('Confession rejected')
                                .setDescription(
                                    `Your confession "*${sin}*" was rejected by God himself. Therefore, it will not be shared publicly.`,
                                )
                                .setColor('RED'),
                        ],
                    })
                    .catch(() => undefined)
            }
        })

        collector.on('end', async (collected, reason) => {
            vote.reactions.removeAll()

            if (reason === 'time') {
                // Vote timed out
                await vote.edit({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Vote timed out')
                            .setDescription(sin)
                            .setColor('ORANGE'),
                    ],
                })

                await interaction.member
                    .send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle('Confession rejected')
                                .setDescription(
                                    `Your confession "*${sin}*" received no votes (God seems to be busy). It was therefore rejected. However, you can resubmit it with the command /confess`,
                                )
                                .setColor('ORANGE'),
                        ],
                    })
                    .catch(() => undefined)
            }
        })

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle('Confession sent')
                    .setDescription(
                        "Your confession has been sent and is awaiting verification. If your DM's are open to everyone, you'll be notified when it has been approved or rejected.",
                    )
                    .setColor('BLURPLE'),
            ],
            ephemeral: true,
        })
    },
}

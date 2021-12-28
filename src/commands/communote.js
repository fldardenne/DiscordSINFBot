const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const https = require("https");

const pasDeChancePath = "https://risibank.fr/cache/stickers/d374/37446-full.png"
const yesPath = "https://media.makeameme.org/created/yes-yes-yes-c6571c.jpg"
const communoteAuthor = {
    name: "Communote",
    iconUrl: "https://www.communote.be/build/images/favicon-32.71a81cd6.png",
    url: "https://www.communote.be"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("communote")
        .setDescription("Fetch notes on communote.be")
        .addStringOption(option => option.setName("code").setDescription("The code of the course"))
        ,



    async execute(client, interaction) {
        const code = interaction.options.getString("code");
        const name = interaction.options.getString("name");

        if (!code) {
            return interaction.reply({
                content: "You should provide an argument",
                ephemeral: true
            })
        }

        if (code) {
            const options = {
                hostname: "www.communote.be",
                path: `/api/notes?page=1&course.code=${code}`,
                method: "GET"
            };

            const req = https.request(options, res => {
                if (res.statusCode >= 400) {
                    const embed = new MessageEmbed()
                                    .setTitle("ERROR")
                                    .setDescription(`Error ${res.statusCode}`)
                                    .setAuthor(communoteAuthor)
                                    .setColor("RED")
                                    .setThumbnail(pasDeChancePath)
                                    .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    const message = interaction.fetchReply();
                }
                else {
                    let rawData = "";
                    res.on("data", d => {
                        rawData += d;
                    });

                    res.on("end", () => {
                        data = JSON.parse(rawData);
                        const embed = new MessageEmbed()
                                        .setAuthor(communoteAuthor)
                                        .setTimestamp()
                                        .setTitle(`No available notes for ${code}`)
                                        .setThumbnail(pasDeChancePath)
                                        .setColor("RED");
                        
                        const notes = data["hydra:member"];
                        if(notes.length > 0) {
                            const path = notes[0].course.path;
                            let url = communoteAuthor.url + path.substring(path.indexOf("/")).replaceAll(" ", "%20");
                            embed
                                .setTitle(`Available notes for ${code}`)
                                .setThumbnail(yesPath)
                                .setColor("GREEN")
                                .setURL(url);

                            notes.forEach(note => {
                                embed.addField(`${note.title} ${note.averageScore != 0 ? "("+note.averageScore+")" : ""}`, note.shortDescription, true)
                            });
                        }

                        interaction.reply({ embeds: [embed] });
                    const message =  interaction.fetchReply();
                    })
                }
            });

            req.end();
        }
    },
};

const {MessageEmbed} = require("discord.js");


module.exports = {
    name:'messageDelete',
    once:false,
    async execute(client, message) {
        const adminChannel = await client.channels.fetch(process.env.ADMIN_CHANNEL_ID)

        const embed = new MessageEmbed()
            .setTitle(`${message.author.username} (${message.author.id}) a supprimé un message`)
            .setThumbnail(message.author.avatarURL())
            .setDescription(message.content);
    }
}
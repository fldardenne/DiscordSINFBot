const { Client } = require("discord.js");
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

/* This event is triggered when the bot is connected to discord's websocket */
module.exports = {
    name: 'ready',
    once: true,

    /**
     * 
     * @param {Client} client 
     */

    async execute(client) {
        console.log(`The bot was successfully logged in as ${client.user.tag}!`);
        loadCommands();
    },
}

function loadCommands() {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

    for(const file of commandFiles) {
        if (file.startsWith('.')) continue;

        const command = require(`../commands/${file}`);
        commands.push(command.data.toJSON());
    }

    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: commands
    })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
}

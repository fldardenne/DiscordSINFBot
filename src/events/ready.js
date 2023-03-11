const { Client } = require("discord.js");

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
    },
}

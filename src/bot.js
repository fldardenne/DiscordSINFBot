// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

// register the set of commands dynamically by reading the ./commands folder
for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}
// register the set of events dynamically by reading the ./events folder
for(const file of eventFiles) {
	const event = require(`./events/${file}`);

	if(event.once) client.once(event.name, (...args) => event.execute(client, ...args));
	else client.on(event.name, (...args) => event.execute(client, ...args));
}

client.login(process.env.DISCORD_TOKEN);

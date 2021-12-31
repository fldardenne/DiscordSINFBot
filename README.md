# DiscordSINFBot

## How to install ?
Clone the project and install the dependencies in the `src` folder by running
```npm install```

Create the `src/.env` file, paste in the content of `.env.example` by modifying the variables appropriately.
To create a bot and get the token, go to https://discord.com/developers/applications.

To "upload" the commands to the Discord helper, run
```node deploy-commands.js```

To run the bot, execute
```node bot.js```

## Roadmap dev
- [ ] An anonymous confession system. Members send a DM to the bot (`/confess <message>`), the admin approve it in a private channel (with a react) and the message will be then in the public channel) 
- [x] A bulk clear (`/clear <number_message>`)
- [ ] A meme contest event creator (`/createcontest <channel_id> <emote> <start_date> <end_date>`) with the score command
- [x] A pin system for members with the role of pin management. (`/pin <message ID to pin>`) 
- [x] A welcoming DM to newcomers
- [x] A poll system
- [x] Some funny commands (`!poop`, `!méchant`, `!criminel`,...)
- [ ] A dynamic !help listing
- [x] A !version command that return the commit hash on which the bot run
- [ ] A hidden rick roll in the project (Holger is in charge)
- [x] A `/version` command that return the commit hash o

const { Client, GuildMember } = require("discord.js");

/* This event is triggered when a user joins the server */
module.exports = {
    name: 'guildMemberAdd',
    once: false,
    
    /**
     * 
     * @param {Client} client 
     * @param {GuildMember} member 
     * @returns 
     */

    async execute(client, member) {
        /**********************
            \n = New line
            \n\n = Empty line between two lines of text
        ***********************/
        const welcomeMessage = `Bienvenue sur le Discord SINF\nCe serveur a pour but de réunir tous les étudiants en informatique en un seul serveur Discord. L'accent est mis sur le partage et l'entraide entre étudiants.\nVous avez ici le droit de discuter, poser vos questions, donner votre avis sur un cours, partager vos tuyaux/synthèses/découvertes, recruter/chercher des personnes pour un projet (non limité aux cours), jouer, ...\nNous organisons également régulièrement des petits événements : le meme contest, distribution de stickers, concours de celui qui a le plus beau chat/setup/...\n\nPour l'instant, tu n'as seulement accès aux channels communautaires.\n\nUtilise la commande /register n'importe où sur le serveur pour t'inscrire aux channels de cours.\n\nN'oublie pas de lire les règles.`;

        return member.send(welcomeMessage);
    },
}

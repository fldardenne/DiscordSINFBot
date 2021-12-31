const WELCOME_MESSAGE = `Bienvenue sur le Discord SINF
Ce serveur a pour but de réunir tous les étudiants en informatique en un seul serveur Discord, l'accent est mis sur le partage et l'entraide entre étudiants.
Vous avez ici le droit de discuter, poser vos questions, donner votre avis sur un cours, partager vos tuyaux/synthèses/découvertes, recruter/chercher des personnes pour un projet (non limité aux cours), jouer, ...
Nous organisons également régulièrement des petits événements: le meme contest, distribution de stickers, concours de celui qui a le plus beau chat/setup/...

Pour l'instant, tu as seulement accès aux channels communautaires.

- Envoie la commande .registerChans en DM au @SinfBot.
- Clique sur le lien qui t'est donné.
- Une fois sur le site, coche tous les channels auxquels tu souhaites t'inscrire.
- En pied de page se trouve le bouton "Enregistrer mon choix", mais attention tu ne pourras changer qu'une seule fois toutes les 15 minutes.
 `

/* The event is triggered when a user joins the server */
module.exports = {
  name: 'guildMemberAdd',
  once: false,
  execute(newMember) {
    return newMember.send(WELCOME_MESSAGE)
  },
}

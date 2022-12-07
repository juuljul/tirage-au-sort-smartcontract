# tirage-au-sort-smartcontract

## Le contrat


Ce smartcontract permet à des utilisateurs de wallets de cryptomonnaies de concourir à un tirage au sort. Les frais de participation sont de 0,01 ETH. Le gagnant remporte la somme des frais engagés par les participants.


## Utilisation


Ce projet peut s'utiliser par exemple avec l'extension __metamask__ ajoutée à votre navigateur.

Cloner le projet.

Installer les dépendances du frontend. Depuis la racine
```
cd frontend
yarn
```

Installer les dépendances du backend. Depuis la racine
```
cd backend
yarn
```

Pour lancer le projet, aller dans le dossier frontend
```
cd frontend
yarn run dev
```
(si ce n'est pas fait automatiquement aller à l'url http://localhost:3000/)

Pour activer des comptes sur le réseau localhost, aller dans le dossier backend
```
cd backend
yarn hardhat node
```

Au besoin, rajouter le réseau hardhat-localhost à l'extension metamask.
Entrer pour le réseau les caractéristiques suivantes :

- nom du réseau: Hardhat-Localhost
- nouvelle URL de RPC: http://127.0.0.1:8545/ (à vérifier)
- id de chaîne: 31337
- symbole de la devise: ETH

Importer un ou plusieurs comptes via leur private key dans l'extension metamask.

Ces comptes permettront de participer au tirage au sort.

Pour enclencher le choix aléatoire d'un gagnant, lancer les scripts suivants :

```
yarn hardhat run scripts/enter.js --network localhost
yarn hardhat run scripts/mockOffChain.js --network localhost
```

Après un raffraîchissement de la page, un nouveau tirage au sort sera lancé, le nombre de participants sera actualisé, et l'adresse du dernier vainqueur sera affichée.





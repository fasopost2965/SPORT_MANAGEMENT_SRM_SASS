# Guide de Déploiement sur un Sous-Domaine Hostinger 🚀

Ce guide vous explique étape par étape comment préparer, générer et déployer l'application **Ndembo Kin Pro Management** sur un sous-domaine Hostinger.

---

## Étape 1 : Préparer et Compiler le Projet localement

1. Ouvrez votre terminal dans le dossier racine du projet.
2. Installez les dépendances si ce n'est pas déjà fait :
   ```bash
   npm install
   ```
3. Lancez la compilation de production :
   ```bash
   npm run build
   ```
4. Une fois la compilation terminée, un dossier nommé `dist/` est généré à la racine de votre projet. C'est **ce dossier uniquement** qui contient tous les fichiers HTML, CSS et JS compilés et prêts pour Hostinger.

---

## Étape 2 : Configuration du Fichier de Redirection (`.htaccess`)

Les applications Single Page (comme React + Vite) gèrent les routes côté client. Pour éviter les erreurs **404 Not Found** lors du rafraîchissement d'une page sur Hostinger :
* Nous avons créé un fichier `.htaccess` dans le dossier `/public`.
* Lors du `npm run build`, Vite copie automatiquement ce fichier à la racine de votre dossier `dist/`.
* Le contenu de ce fichier redirige de manière transparente toutes les requêtes vers `index.html` :
  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>
  ```

---

## Étape 3 : Création du Sous-Domaine sur Hostinger

1. Connectez-vous à votre **hPanel Hostinger**.
2. Allez dans **Sites Internet** ou **Hébergement**, puis cliquez sur **Gérer** à côté de votre nom de domaine principal.
3. Dans le menu de gauche, recherchez et cliquez sur **Sous-domaines**.
4. Saisissez le nom de votre sous-domaine (par exemple, `gestion` ou `app`).
5. Cochez l'option **Créer un dossier personnalisé** si vous souhaitez spécifier un chemin spécifique (généralement, Hostinger le crée dans `public_html/votre-sous-domaine`).
6. Cliquez sur **Créer**.

---

## Étape 4 : Téléverser les fichiers sur Hostinger

Vous pouvez charger vos fichiers de deux façons : via le **Gestionnaire de fichiers (File Manager)** de Hostinger ou par **FTP (FileZilla)**.

### Option A : Utiliser le Gestionnaire de Fichiers de Hostinger (Le plus rapide)
1. Compressez tout le **contenu** du dossier `dist/` généré (et non pas le dossier `dist` lui-même) dans un fichier zip nommé `archive.zip`.
   * *Note : Vérifiez que l'archive contient directement `index.html`, le dossier `assets`, et le fichier `.htaccess` à sa racine.*
2. Dans le hPanel Hostinger, allez dans **Gestionnaire de fichiers**.
3. Naviguez vers le dossier de votre nouveau sous-domaine (ex: `public_html/gestion`).
4. Supprimez le fichier par défaut `default.php` s'il est présent.
5. Cliquez sur l'icône **Importer / Upload** et téléversez votre fichier `archive.zip`.
6. Faites un clic droit sur `archive.zip` dans l'interface et choisissez **Extraire (Extract)**. Extrayez le contenu directement dans le dossier actuel.
7. Supprimez le fichier `archive.zip` pour garder votre espace propre.

### Option B : Utiliser un client FTP (comme FileZilla)
1. Connectez-vous à votre hébergement via FTP avec vos identifiants fournis par Hostinger.
2. Naviguez vers le dossier de votre sous-domaine (ex: `public_html/gestion`).
3. Supprimez le fichier `default.php` par défaut si nécessaire.
4. Glissez-déposez l'intégralité du contenu du dossier local `dist/` vers le dossier distant de votre sous-domaine.

---

## Étape 5 : Activer le SSL (HTTPS)

Pour garantir la sécurité de vos données financières et de vos connexions, activez le certificat SSL :
1. Dans le hPanel Hostinger, allez dans **Sécurité** > **SSL**.
2. Recherchez votre nouveau sous-domaine dans la liste.
3. Cliquez sur **Installer le SSL**. C'est gratuit et automatique via Let's Encrypt !

---

Votre application **Ndembo Kin Pro Management** est désormais en ligne et prête à être utilisée sur votre sous-domaine Hostinger ! 🎉

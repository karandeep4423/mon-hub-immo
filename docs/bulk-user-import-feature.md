# Fonctionnalité d'Import en Masse d'Utilisateurs

## Vue d'ensemble
Cette fonctionnalité permet à l'admin de créer plusieurs utilisateurs en masse via l'upload d'un fichier CSV. Chaque nouvel utilisateur reçoit automatiquement un email avec ses identifiants de connexion et un mot de passe temporaire.

## Architecture

### Frontend (`client/`)
- **Composant Modal**: `components/admin/ImportUsersModal.tsx`
  - Upload de fichier CSV
  - Affichage du statut d'import
  - Affichage des erreurs et succès

- **Page Admin**: `app/admin/users/page.tsx`
  - Bouton "↓ Importer utilisateurs (CSV)" ajouté à côté du bouton "Ajouter"
  - Gestion de l'état `showImportModal`
  - Rafraîchissement de la liste après import succès

### Backend (`server/`)
- **Route**: `POST /api/admin/users/import`
  - Upload multipart/form-data
  - Authentification admin requise

- **Contrôleur**: `controllers/adminController.ts`
  - Fonction `importUsersFromCSV`
  - Parse CSV simple (split par ligne/colonne)
  - Validation des données obligatoires
  - Création utilisateurs avec mot de passe temporaire
  - Envoi email automatique

- **Email Service**: Utilise le service existant (`utils/emailService.ts`)
  - Template HTML personnalisé avec identifiants
  - Lien de connexion inclus
  - Support Mailtrap (dev) et Brevo (prod)

## Format CSV Accepté

### En-têtes obligatoires:
- `email` (obligatoire)
- `firstName` (obligatoire)
- `lastName` (obligatoire)

### En-têtes optionnels:
- `userType` (défaut: "agent"; valeurs: "agent", "apporteur", "admin")
- `phone` (chaîne vide autorisée)
- `network` (chaîne vide autorisée)

### Exemple de fichier:
```csv
email,firstName,lastName,userType,phone,network
john.doe@example.com,John,Doe,agent,0123456789,Century21
jane.smith@example.com,Jane,Smith,apporteur,,Immo Services
pierre.martin@example.com,Pierre,Martin,agent,0987654321,Foncia
```

## Flux d'Import

1. **Admin clique sur "Importer utilisateurs (CSV)"**
   - Modal s'ouvre

2. **Sélection du fichier**
   - Validation: fichier .csv uniquement
   - Affichage du nom et taille du fichier

3. **Envoi du fichier**
   - POST multipart/form-data vers `/api/admin/users/import`
   - Spinner "Import en cours..."

4. **Backend: Parse & Validation**
   - Lecture des en-têtes CSV
   - Validation des colonnes requises
   - Pour chaque ligne:
     - Validation des données (email, firstName, lastName)
     - Vérification existence utilisateur
     - Génération mot de passe temporaire
     - Création utilisateur en BD

5. **Envoi des emails**
   - Pour chaque utilisateur créé
   - Template HTML avec:
     - Prénom/Nom personnalisé
     - Email de connexion
     - Mot de passe temporaire (format: 8 caractères aléatoires + "1!")
     - Lien de connexion
     - Conseil de changer le mot de passe

6. **Réponse au client**
   ```json
   {
     "success": true,
     "created": 3,
     "failed": 0,
     "createdUsers": [
       { "email": "john.doe@example.com", "id": "..." },
       { "email": "jane.smith@example.com", "id": "..." },
       { "email": "pierre.martin@example.com", "id": "..." }
     ],
     "errors": []
   }
   ```

7. **Affichage du résultat**
   - Liste des utilisateurs créés ✓
   - Liste des erreurs (si applicable) ✗
   - Toast de succès
   - Fermeture auto après 1.5s si succès
   - Rafraîchissement liste utilisateurs

## Gestion des Erreurs

### Côté Client
- Fichier non CSV: toast "Veuillez sélectionner un fichier CSV"
- Erreur réseau: toast "Erreur réseau"
- Réponse erreur serveur: affichage message d'erreur + détails dans modal

### Côté Serveur
- Pas de fichier: `400 - Aucun fichier fourni`
- Fichier vide: `400 - Le fichier CSV doit contenir au moins un en-tête et une ligne`
- En-têtes manquants: `400 - En-têtes manquants: ...`
- Données manquantes: affichage ligne-par-ligne dans réponse
- Utilisateur déjà existant: enregistré dans erreurs
- Erreur BD/email: enregistré dans erreurs

### Résilience
- Si un utilisateur échoue, les autres continuent d'être créés
- Email: si erreur, utilisateur est créé mais email n'est pas envoyé (erreur enregistrée)
- Réponse finale: décompte créations vs erreurs

## Sécurité

- **Authentification**: Token JWT requis (middleware `authenticateToken`)
- **Autorisation**: Rôle admin requis (middleware `requireAdmin`)
- **Validation**: 
  - Vérification format email
  - Suppression espaces superflus
  - No SQL injection (MongoDB + sanitization implicite)
  - Charset: UTF-8
- **Mots de passe**:
  - Générés aléatoirement, temporaires
  - Hashés avec bcrypt avant stockage
  - Jamais stockés en clair
- **CORS**: Credentials includs pour requête multipart

## Dépendances

### Client
- `papaparse` (optionnel, non utilisé actuellement; pour futurs parseurs avancés)

### Serveur
- `multer`: Gestion upload fichiers
- `nodemailer`: Envoi emails (déjà présent)
- `bcryptjs`: Hashage mots de passe (déjà présent)

## Configuration Requise

### Variables d'environnement (`.env` serveur)
```
CLIENT_URL=http://localhost:3000  # Lien de connexion dans l'email
EMAIL_FROM=noreply@monhubimmo.com  # Expéditeur
EMAIL_HOST=...                    # Mailtrap ou autre
EMAIL_USER=...
EMAIL_PASS=...
NODE_ENV=development|production   # Pour choix prestataire email
```

## Limitations Actuelles

1. **Format CSV simple**: Split basique par virgule
   - Limitation: champs avec virgules doivent être entre guillemets (non géré)
   - Solution future: utiliser `papaparse` ou `csv-parse`

2. **Excel non supporté**: Uniquement CSV
   - Solution future: ajouter support `.xlsx` via `xlsx` lib

3. **Import async**:
   - Non cancelable une fois lancé
   - Pas de sauvegarde état (en cas déconnexion)

4. **Upload limite**:
   - Limitée par multer (défaut: 50MB)
   - À adapter selon taille fichiers attendue

## Exemple de Test

1. Créer fichier CSV:
```csv
email,firstName,lastName,userType
alice@test.com,Alice,Test,agent
bob@test.com,Bob,Test,apporteur
```

2. Admin → Users → Clic "Importer utilisateurs (CSV)"

3. Sélectionner fichier

4. Clic "Importer"

5. Vérifier:
   - Modal affiche résultat
   - Utilisateurs apparaissent dans la liste
   - Emails reçus à alice@test.com et bob@test.com

## Améliorations Futures

1. **Validation avancée**:
   - Vérifier format email valide
   - Limiter taille fichier
   - Limiter nombre lignes

2. **Formats supportés**:
   - Excel (.xlsx)
   - JSON

3. **Mapping colonnes**:
   - Interface sélection colonnes avant import
   - Support noms colonnes personnalisés

4. **Bulk operations**:
   - Modifier rôles en masse
   - Supprimer en masse
   - Exporter utilisateurs

5. **Notifications**:
   - Webhooks pour sync systèmes externes
   - Enregistrement logs d'import

6. **Performance**:
   - Importation par batch (DB)
   - Progress bar client (Server-Sent Events)
   - Compression fichier

## Dépannage

### Les emails ne sont pas envoyés
- Vérifier config `emailService.ts`
- Vérifier `.env`: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
- Vérifier logs serveur pour erreurs nodemailer

### Les utilisateurs ne sont pas créés
- Vérifier authentification admin
- Vérifier format CSV (en-têtes exacts)
- Vérifier logs erreurs dans réponse import

### Modal ne s'ouvre pas
- Vérifier composant `ImportUsersModal.tsx` bien importé
- Vérifier état `showImportModal` bien géré

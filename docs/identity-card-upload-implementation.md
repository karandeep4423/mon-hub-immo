# Implémentation: Carte d'Identité lors de l'Inscription

## Vue d'Ensemble

Implémentation complète de l'upload de carte d'identité pendant l'inscription avec stockage **uniquement après vérification email** pour éviter les données orphelines.

## Architecture

### Flux de Données

```
1. Inscription (POST /api/auth/signup)
   ├─ Données utilisateur → PendingVerification (MongoDB)
   ├─ Fichier carte d'identité → temp/{email}/ (S3)
   └─ Email de vérification envoyé

2. Vérification Email (POST /api/auth/verify-email)
   ├─ Code valide → Créer User (MongoDB)
   ├─ Copier fichier: temp/{email}/ → users/{userId}/
   ├─ Supprimer PendingVerification
   └─ Supprimer fichier temp

3. Nettoyage Automatique (24h)
   ├─ MongoDB TTL → Supprime PendingVerification
   └─ S3 Lifecycle → Supprime fichiers temp/
```

## Changements Backend

### 1. Nouveau Modèle: PendingVerification

**Fichier:** `server/src/models/PendingVerification.ts`

- Stocke temporairement les données d'inscription
- Index TTL: suppression auto après 24h via `expires: 86400`
- Champs:
  - Données utilisateur (firstName, lastName, email, password, etc.)
  - `identityCardTempKey`: clé S3 temporaire
  - `emailVerificationCode` et `emailVerificationExpires`

### 2. Contrôleur signup()

**Fichier:** `server/src/controllers/authController.ts`

**Changements:**

- Accepte `multipart/form-data` via middleware `uploadIdentityDoc`
- Vérifie unicité email dans `User` ET `PendingVerification`
- Upload fichier vers S3 `temp/{email}/` si fourni
- Crée `PendingVerification` (pas `User`)
- Messages en français

### 3. Contrôleur verifyEmail()

**Changements:**

- Trouve `PendingVerification` par email + code
- Crée `User` à partir des données pending
- Si `identityCardTempKey` existe:
  - Copie fichier: `temp/` → `users/{userId}/identity-card.{ext}`
  - Met à jour `User.professionalInfo.identityCard`
  - Supprime fichier temp
- Supprime `PendingVerification`
- Génère token JWT et connecte l'utilisateur

### 4. Contrôleur resendVerificationCode()

**Changements:**

- Cherche dans `PendingVerification` (pas `User`)
- Vérifie si email déjà vérifié dans `User`
- Génère nouveau code et met à jour `PendingVerification`
- Messages en français

### 5. Service S3: Nouvelle Méthode copyObject()

**Fichier:** `server/src/services/s3Service.ts`

```typescript
async copyObject(sourceKey: string, destinationKey: string): Promise<{key: string, url: string}>
```

- Copie fichier d'un emplacement S3 à un autre
- Utilisée pour temp → permanent

### 6. Routes

**Fichier:** `server/src/routes/auth.ts`

- Route signup: `uploadIdentityDoc` middleware ajouté
- Accepte champ `identityCard` (file)

## Changements Frontend

### 1. API Client: authApi.signUp()

**Fichier:** `client/lib/api/authApi.ts`

**Changements:**

- Accepte paramètre optionnel `identityCardFile: File | null`
- Si fichier fourni:
  - Crée `FormData`
  - Ajoute tous les champs form
  - Ajoute fichier avec clé `identityCard`
  - Envoie avec `Content-Type: multipart/form-data`
- Sinon: envoie JSON classique

### 2. Hook useSignUpForm

**Fichier:** `client/hooks/useSignUpForm.ts`

**Changements:**

- State `identityCardFile` déjà présent
- Mutation mise à jour pour passer `identityCardFile` à `authService.signUp()`

## Nettoyage Automatique

### MongoDB TTL Index

- **Modèle:** `PendingVerification`
- **Champ:** `createdAt` avec `expires: 86400` (24h)
- **Fonctionnement:** MongoDB supprime automatiquement les documents après 24h
- **Fréquence:** Vérification toutes les 60 secondes

### S3 Lifecycle Rule

- **Bucket:** `monhubimmo`
- **Prefix:** `temp/`
- **Action:** Expiration après 1 jour
- **Configuration:** Voir `docs/s3-lifecycle-setup.md`
- **Fonctionnement:** S3 supprime fichiers automatiquement après 24h

## Prévention des Doublons

### Email Uniqueness Check

```typescript
// Dans signup()
const existingUser = await User.findOne({ email });
if (existingUser) {
  return res.status(400).json({ message: "Un compte existe déjà..." });
}

const existingPending = await PendingVerification.findOne({ email });
if (existingPending) {
  // Renvoyer code au lieu de créer doublon
  return res.status(200).json({ message: "Nouveau code envoyé..." });
}
```

- Vérifie `User` (comptes vérifiés)
- Vérifie `PendingVerification` (inscriptions en attente)
- Si pending existe: renvoie nouveau code

## Sécurité

### Validation Fichier

**Middleware:** `uploadIdentityDoc`

- Types acceptés: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `application/pdf`
- Taille max: 5MB
- Stockage: Mémoire (buffer) avant upload S3

### Stockage Temporaire

- Prefix S3: `temp/` séparé des fichiers permanents
- Suppression automatique → pas d'accumulation
- Fichiers non accessibles publiquement

### Données Utilisateur

- Pas de `User` créé avant vérification email
- Mot de passe hashé dans `PendingVerification`
- Code vérification expire après 24h

## Tests Manuels

### Scénario 1: Inscription + Vérification Réussie

1. S'inscrire comme agent avec carte d'identité
2. Vérifier MongoDB: `PendingVerification` créé avec `identityCardTempKey`
3. Vérifier S3: fichier dans `temp/{email}/`
4. Vérifier email
5. Vérifier MongoDB: `User` créé, `PendingVerification` supprimé
6. Vérifier S3: fichier dans `users/{userId}/`, fichier temp supprimé

### Scénario 2: Inscription Sans Vérification

1. S'inscrire comme agent avec carte d'identité
2. Vérifier MongoDB: `PendingVerification` créé
3. Vérifier S3: fichier dans `temp/`
4. Attendre 24h
5. Vérifier MongoDB: `PendingVerification` supprimé auto
6. Vérifier S3: fichier temp supprimé auto (24-48h)

### Scénario 3: Email Déjà Utilisé

1. S'inscrire avec email existant (User déjà vérifié)
2. Recevoir erreur: "Un compte existe déjà avec cet email"
3. S'inscrire avec email en attente (PendingVerification)
4. Recevoir: "Un nouveau code de vérification a été envoyé"

### Scénario 4: Apporteur (Sans Carte d'Identité)

1. S'inscrire comme apporteur (sans fichier)
2. Vérifier: `PendingVerification.identityCardTempKey` = undefined
3. Vérifier email
4. Vérifier: `User` créé sans `professionalInfo.identityCard`

## Commandes MongoDB Utiles

### Voir PendingVerifications

```javascript
db.pendingverifications.find().pretty();
```

### Voir TTL Index

```javascript
db.pendingverifications.getIndexes();
```

### Compter Documents en Attente

```javascript
db.pendingverifications.countDocuments();
```

### Supprimer Manuellement

```javascript
db.pendingverifications.deleteMany({ email: "test@example.com" });
```

## Commandes AWS S3 Utiles

### Lister Fichiers Temp

```bash
aws s3 ls s3://monhubimmo/temp/ --recursive
```

### Voir Lifecycle Configuration

```bash
aws s3api get-bucket-lifecycle-configuration --bucket monhubimmo
```

### Supprimer Fichier Manuellement

```bash
aws s3 rm s3://monhubimmo/temp/{email}/file.jpg
```

## Points d'Attention

### Performance

- Upload S3 est asynchrone (ne bloque pas signup)
- En cas d'échec upload, signup continue (user peut ré-uploader)
- TTL MongoDB vérifie toutes les 60s (pas instantané)

### Gestion d'Erreurs

- Échec upload S3 → Log erreur, continue signup
- Échec copie S3 lors vérification → Log erreur, continue création User
- User peut toujours uploader carte d'identité via profile completion

### Limitations

- S3 Lifecycle: suppression peut prendre 24-48h (traitement par lots)
- MongoDB TTL: vérification toutes les 60s
- Fichiers non supprimés instantanément mais automatiquement

## Configuration Requise

### Variables d'Environnement

```bash
# MongoDB
MONGO_URI=mongodb://...

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=monhubimmo

# Email
RESEND_API_KEY=...
```

### Permissions AWS S3

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:CopyObject"
      ],
      "Resource": "arn:aws:s3:::monhubimmo/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutLifecycleConfiguration",
        "s3:GetLifecycleConfiguration"
      ],
      "Resource": "arn:aws:s3:::monhubimmo"
    }
  ]
}
```

## Résolution des Problèmes

### Fichier non uploadé

1. Vérifier type MIME accepté
2. Vérifier taille < 5MB
3. Vérifier credentials AWS
4. Vérifier logs backend

### PendingVerification pas supprimé

1. Vérifier index TTL existe: `db.pendingverifications.getIndexes()`
2. Attendre 60s après expiration
3. Vérifier MongoDB version >= 4.0

### Fichier S3 pas supprimé

1. Vérifier lifecycle rule active
2. Vérifier prefix exactement `temp/`
3. Attendre 24-48h
4. Vérifier logs AWS CloudTrail

## Références

- [MongoDB TTL Indexes](https://www.mongodb.com/docs/manual/core/index-ttl/)
- [AWS S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
- [Multer File Upload](https://github.com/expressjs/multer)

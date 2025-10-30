# Configuration du Cycle de Vie S3 pour les Fichiers Temporaires

## Vue d'Ensemble

Cette configuration automatique supprime les fichiers temporaires (cartes d'identité non vérifiées) après 24 heures dans le bucket S3.

## Étapes de Configuration AWS Console

### 1. Accéder à S3 Management Console

1. Connectez-vous à [AWS Console](https://console.aws.amazon.com/)
2. Naviguez vers **S3**
3. Sélectionnez votre bucket: `monhubimmo` (ou votre nom de bucket configuré)

### 2. Créer une Règle de Cycle de Vie

1. Cliquez sur l'onglet **Management**
2. Faites défiler jusqu'à **Lifecycle rules**
3. Cliquez sur **Create lifecycle rule**

### 3. Configuration de la Règle

**Nom de la règle:**

```
delete-temp-identity-cards-24h
```

**Portée de la règle:**

- Sélectionnez: **Limit the scope of this rule using one or more filters**
- **Prefix:** `temp/`

**Actions de la règle:**

- Cochez: **Expire current versions of objects**

**Délai d'expiration:**

- **Days after object creation:** `1`

### 4. Réviser et Créer

1. Passez en revue votre configuration
2. Cliquez sur **Create rule**

## Configuration Programmatique (AWS CLI)

Si vous préférez utiliser AWS CLI:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket monhubimmo \
  --lifecycle-configuration file://lifecycle-config.json
```

**lifecycle-config.json:**

```json
{
  "Rules": [
    {
      "Id": "delete-temp-identity-cards-24h",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "temp/"
      },
      "Expiration": {
        "Days": 1
      }
    }
  ]
}
```

## Vérification

Pour vérifier que la règle est active:

```bash
aws s3api get-bucket-lifecycle-configuration --bucket monhubimmo
```

## Fonctionnement

1. **Inscription**: L'utilisateur s'inscrit → Carte d'identité uploadée dans `temp/{email}/`
2. **Attente**: L'utilisateur a 24h pour vérifier son email
3. **Vérification réussie**:
   - Fichier copié vers `users/{userId}/identity-card.{ext}`
   - Fichier temp supprimé immédiatement par le backend
4. **Pas de vérification**: S3 supprime automatiquement le fichier après 24h

## Coordination avec MongoDB TTL

- **MongoDB TTL**: Supprime les enregistrements `PendingVerification` après 24h
- **S3 Lifecycle**: Supprime les fichiers `temp/` après 24h
- Les deux systèmes fonctionnent en parallèle pour un nettoyage complet

## Notes Importantes

- La règle S3 vérifie les fichiers toutes les 24 heures, donc la suppression peut prendre jusqu'à 48h dans certains cas
- Les fichiers déjà copiés vers `users/` sont permanents et ne sont pas affectés
- Aucun coût supplémentaire pour les règles de cycle de vie

## Résolution des Problèmes

### La règle ne supprime pas les fichiers

1. Vérifiez que le statut est **Enabled**
2. Vérifiez que le prefix est exactement `temp/` (pas `temp` sans le slash)
3. Attendez 24-48h - S3 traite les règles par lots

### Fichiers supprimés trop tôt/tard

- Ajustez le paramètre **Days** dans la configuration
- 1 jour = suppression après 24-48h
- 0 jour n'est pas autorisé, minimum 1 jour

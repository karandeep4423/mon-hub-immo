# 🎯 Guide Complet - Utiliser le Nouvel Admin Dashboard

## 🚀 Démarrage Rapide

### 1. Accéder à l'Admin
```
http://localhost:3000/admin
```

### 2. Navigation
- **Tableau de bord**: Statistiques en temps réel
- **Utilisateurs**: Gestion des agents et apporteurs
- **Annonces**: Gestion immobilière (table/grid)
- **Collaborations**: Suivi des partenariats
- **Paramètres**: Configuration système

---

## 📊 Tableau de Bord

### Fonctionnalités

#### Cards Statistiques
- **Agents Inscrits**: Total avec détail (Actifs, Attente, Désabonnés)
- **Annonces Actives**: Total avec détail (Archivées, Collaboration)
- **Collaborations**: Total avec détail (Clôturées)
- **Frais d'Agence**: Montant total en EUR

#### Top Performers
- **Top Réseaux**: Réseaux avec plus d'activité
- **Top Régions**: Régions/villes les plus actives

#### Actions Rapides
- Liens directs vers gestion utilisateurs, annonces, collaborations

### Animations
- Hover effects sur les cards (+5% zoom)
- Transitions fluides de 300ms
- Loading skeletons pendant le chargement

---

## 👥 Gestion Utilisateurs

### Vue d'ensemble
Table moderne affichant tous les utilisateurs (agents, apporteurs).

### Filtres
1. **Type**: Agent / Apporteur
2. **Statut**: Actif / En attente / Bloqué
3. **Recherche**: Par nom, email, prénom

### Stats
- Total d'utilisateurs actuels
- Nombre d'actifs
- Nombre en attente

### Actions par Ligne
- **Éditer** (✏️): Modifier l'utilisateur
- **Supprimer** (🗑️): Supprimer l'utilisateur

### Modal d'Édition
```
Champs éditables:
- Prénom
- Nom
- Email
- Statut (dropdown)
```

### Boutons Rapides
- **📥 Importer**: Importer utilisateurs via CSV
- **➕ Nouveau**: Créer nouvel utilisateur

### Créer un nouvel utilisateur
1. Cliquez sur **➕ Nouveau** pour ouvrir le modal de création
2. Remplissez les champs requis: *Prénom, Nom, Email*. Vous pouvez aussi indiquer le *Téléphone*, l'*Image de profil* (URL), et le rôle (*Agent*, *Apporteur*, *Admin*).
3. Optionnel: cochez *Valider ce compte* pour valider immédiatement l'utilisateur; un email de confirmation sera envoyé.
4. Cliquez sur **Créer**. L'utilisateur sera ajouté et la table se mettra à jour automatiquement.

Note: Si vous créez un utilisateur sans définir de mot de passe, le compte devra utiliser le flux de réinitialisation de mot de passe (ou l'utilisateur pourra compléter son profil pour définir un mot de passe).

---

## 🏠 Gestion Annonces

### Modes d'Affichage
- **Table**: Vue classique avec colonnes
- **Grid**: Cartes interactives 3 par ligne

### Filtres
1. **Type**: Tous types / Appartement / Maison / Terrain / Commercial
2. **Statut**: Tous / Actif / En attente / Archivé
3. **Recherche**: Par titre ou localisation

### Colonnes Table
- Titre + Localisation
- Type (badge)
- Prix
- Vues
- Statut (badge)
- Dates de création

### Cartes Grid
- Image placeholder (🏠)
- Titre et localisation
- Prix + Type badge
- Vues et date
- Boutons Voir/Supprimer

### Stats
- Total d'annonces
- Annonces actives
- Nombre total de vues
- Valeur totale en EUR/M

### Actions
- **👁️ Voir**: Afficher détails
- **✏️ Éditer**: Modifier annonce
- **🗑️ Supprimer**: Archiver/supprimer

### Boutons Rapides
- **⬇️ Exporter**: Télécharger en CSV
- **➕ Nouvelle Annonce**: Créer annonce

---

## 🤝 Gestion Collaborations

### Vue Tableau
Affiche toutes les collaborations avec détails.

### Colonnes
- Agent & Apporteur (avec avatars)
- Annonce associée
- Commission (EUR)
- Statut (avec badge coloré)
- Dates (création + mise à jour)

### Statuts et Couleurs
- 🟡 **Pending** (En attente): Jaune/Ambre
- 🟢 **Active** (Active): Vert/Émerald
- 🔵 **Completed** (Complétée): Bleu
- 🔴 **Cancelled** (Annulée): Rouge

### Filtres
1. **Statut**: Tous / En attente / Active / Complétée / Annulée
2. **Recherche**: Par agent, apporteur, ou annonce

### Actions
- **👁️ Voir**: Détails
- **✏️ Éditer**: Modifier
- **✅ Valider**: Compléter collaboration

### Timeline
Affichage chronologique des collaborations actives:
- Ordre d'arrivée
- Agent ↔️ Apporteur
- Annonce associée
- Commission
- Date de début

### Stats
- Total collaborations
- Collaborations actives (🟢)
- Collaborations complétées (✅)
- Commissions totales (EUR)

---

## ⚙️ Paramètres Admin

### Sections

#### Paramètres Généraux
- Nom de la plateforme
- Max utilisateurs par agent
- Commission (%) par défaut

#### Notifications
- Toggle Notifications Email
- Toggle Notifications SMS

#### Système
- Toggle Mode Maintenance (avec avertissement)

### Statistiques
- Statut Serveur (🟢 En ligne)
- Base de données (🟢 Connectée)
- Service Email (🟢 Actif)
- Uptime (%)

### Sauvegarde
- Dernière sauvegarde (date/heure)
- Bouton pour lancer une sauvegarde manuelle

---

## 🎨 Design & Interactions

### Couleurs
- **Primaire**: Cyan (#00BCE4)
- **Secondaire**: Indigo (#6366F1)
- **Success**: Émerald (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Composants Interactifs

#### Badges
- Formes arrondies
- Variants: success, warning, error, info, default
- Tailles: sm, md, lg

#### Boutons
- Primary: Gradient cyan→blue
- Secondary: Gradient indigo→purple
- Outline: Border seulement
- Ghost: Texte seulement
- Danger: Red

#### Cards
- Shadow au repos
- Hover: +5% zoom + shadow augmentée
- Border léger gris

### Animations
- **Transitions**: 300ms par défaut
- **Easing**: ease-in-out
- **Loading**: Spinner CSS

---

## 📱 Responsive Design

### Mobile (<640px)
- Sidebar caché, accessible via hamburger
- Grille 1 colonne
- Navigation tactile optimisée

### Tablet (640px-1024px)
- Sidebar peut être collapsée
- Grille 2 colonnes
- Tables scrollables

### Desktop (>1024px)
- Sidebar toujours visible
- Grille 3-4 colonnes
- Tables complètes

---

## ⌨️ Raccourcis Clavier

(À implémenter selon besoin)

---

## 🔐 Permissions

### Admin Super
- ✅ Accès complet
- ✅ Modifier tous les utilisateurs
- ✅ Accès paramètres

### Admin Limité
- ⚠️ À définir selon vos besoins

---

## 📈 Performance Tips

1. **Filtres**: Utiliser pour réduire données affichées
2. **Search**: Rechauffe sur saisie (debounce)
3. **Pagination**: À implémenter pour >1000 items
4. **Cache**: Les données se rechargent à chaque navigation

---

## 🐛 Troubleshooting

### Le tableau ne charge pas
- Vérifier connexion API
- Vérifier tokens d'authentification
- Ouvrir DevTools > Network

### Styles bizarres
- Vérifier Tailwind CSS chargé
- Hard-refresh (Ctrl+Shift+R)
- Vérifier pas de conflits CSS

### Responsive cassé
- Vérifier écran size
- Ouvrir DevTools responsif
- Tester sur vraiment appareil

### Animations lentes
- Vérifier performance PC
- Vérifier DevTools Performance
- Réduire nombre de items

---

## 🚀 Optimisations Futures

1. **Graphiques**: Ajouter Chart.js/Recharts
2. **Export**: CSV/PDF pour annonces et utilisateurs
3. **Notifications**: Toast notifications
4. **Dark mode**: Toggle jour/nuit
5. **Pagination**: Pour listes >1000 items
6. **Multi-langue**: i18n support
7. **Analytics**: Tracking utilisateur

---

## 📞 Support

Pour des questions ou bugs:
1. Consulter la documentation
2. Vérifier DevTools Console
3. Contacter développeur

---

**Guide Complet - Admin Dashboard v2.0**  
**Mise à jour: 13/11/2025**

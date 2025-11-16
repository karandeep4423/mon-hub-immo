# 🎨 Admin Dashboard - Composants Modernes

## Vue d'ensemble

Système de composants moderne et réutilisable pour le panneau d'administration MonHubImmo.

## 📦 Composants Disponibles

### UI Components (`/ui`)

#### StatCard
Affiche des statistiques avec gradients, détails et trends.

```tsx
import { StatCard } from '@/components/admin';

<StatCard
  icon="👥"
  title="Agents Actifs"
  value={250}
  gradient="blue"
  trend={{ value: 12, isPositive: true }}
  details={[
    { label: "Actifs", value: 240, color: "#10B981" }
  ]}
/>
```

**Props:**
- `icon`: React.ReactNode - Icône affichée
- `title`: string - Titre de la carte
- `value`: string | number - Valeur principale
- `gradient`: 'blue' | 'purple' | 'emerald' | 'rose' - Style gradient
- `trend?`: { value: number; isPositive: boolean } - Trend optionnel
- `details?`: Array - Détails additionnels

---

#### DataTable
Tableau moderne avec colonnes configurables et actions.

```tsx
import { DataTable } from '@/components/admin';

<DataTable
  columns={[
    {
      header: 'Nom',
      accessor: 'name',
      width: '30%',
      render: (value) => <strong>{value}</strong>
    },
    {
      header: 'Email',
      accessor: 'email',
      width: '40%'
    }
  ]}
  data={users}
  loading={isLoading}
  onRowClick={(row) => console.log(row)}
  actions={(row) => (
    <button onClick={() => edit(row)}>Éditer</button>
  )}
/>
```

**Props:**
- `columns`: Array - Configuration des colonnes
- `data`: any[] - Données à afficher
- `loading?`: boolean - État de chargement
- `onRowClick?`: (row) => void - Callback au clic
- `actions?`: (row) => ReactNode - Actions par ligne

---

#### Badge
Badges avec 5 variantes et 3 tailles.

```tsx
import { Badge } from '@/components/admin';

<Badge label="Actif" variant="success" size="md" icon="✅" />
```

**Variants:** success, warning, error, info, default  
**Sizes:** sm, md, lg

---

#### Button
Boutons avec 5 styles et loading state.

```tsx
import { Button } from '@/components/admin';

<Button 
  variant="primary" 
  size="md" 
  loading={isLoading}
  icon="💾"
>
  Enregistrer
</Button>
```

**Variants:** primary, secondary, outline, ghost, danger  
**Sizes:** sm, md, lg

---

### Layout Components

#### AdminLayout
Layout principal avec sidebar et header.

```tsx
import { AdminLayout } from '@/components/admin';

<AdminLayout>
  <YourContent />
</AdminLayout>
```

Features:
- Sidebar collapsible sur mobile
- Header avec notifications
- Menu utilisateur
- Responsive automatique

---

#### HeaderAdmin
Header standalone avec notifications et menu.

```tsx
import { HeaderAdmin } from '@/components/admin';

<HeaderAdmin 
  onMenuToggle={() => setMenuOpen(!menuOpen)} 
  menuOpen={menuOpen}
/>
```

---

#### SidebarAdminModern
Sidebar dark avec navigation.

```tsx
import { SidebarAdminModern } from '@/components/admin';

<SidebarAdminModern 
  isOpen={menuOpen}
  onClose={() => setMenuOpen(false)}
/>
```

---

### Dashboard Components

#### DashboardAdminModern
Dashboard principal avec stats et actions rapides.

```tsx
import { DashboardAdminModern } from '@/components/admin';

<DashboardAdminModern stats={adminStats} />
```

Features:
- Cards statistiques animées
- Top réseaux et régions
- Actions rapides
- Loading skeletons

---

#### AdminStatsClient
Wrapper client pour les stats avec gestion d'erreur.

```tsx
import { AdminStatsClient } from '@/components/admin';

<AdminStatsClient />
```

---

### Data Table Components

#### AdminUsersTableModern
Tableau moderne pour gestion utilisateurs.

```tsx
import { AdminUsersTableModern } from '@/components/admin';

<AdminUsersTableModern users={users} loading={loading} />
```

Features:
- Filtres (type, statut, recherche)
- Stats dynamiques
- Modal d'édition
- Actions rapides

---

#### AdminPropertiesTableModern
Tableau moderne pour annonces avec vue table/grid.

```tsx
import { AdminPropertiesTableModern } from '@/components/admin';

<AdminPropertiesTableModern properties={properties} loading={loading} />
```

Features:
- Vue table et grid
- Filtres avancés
- Stats (prix total, vues)
- Cartes interactives

---

#### AdminCollaborationsTableModern
Tableau pour collaborations avec timeline.

```tsx
import { AdminCollaborationsTableModern } from '@/components/admin';

<AdminCollaborationsTableModern collaborations={collabs} loading={loading} />
```

Features:
- Timeline visuelle
- Statuts colorés
- Commissions
- Recherche et filtres

---

## 🎨 Design Tokens

Système centralisé dans `lib/constants/designTokens.ts`

```typescript
import { designTokens } from '@/components/admin';

// Utiliser les tokens
const bgColor = designTokens.colors.primary;
const shadow = designTokens.shadows.lg;
const spacing = designTokens.spacing.md;
const radius = designTokens.radius.lg;
const gradient = designTokens.gradients.blue;
```

---

## 📱 Responsive Design

Tous les composants sont responsive:
- **Mobile**: Stack vertical, sidebar hidden
- **Tablet**: 2 colonnes, sidebar sidebar collapse
- **Desktop**: 3-4 colonnes, sidebar toujours visible

---

## ♿ Accessibilité

- Labels sémantiques
- ARIA attributes où nécessaire
- Focus states visibles
- Contraste suffisant (WCAG AA)

---

## 🚀 Performance

- Memoization automatique avec React
- Loading skeletons pour UX
- Pas de re-renders inutiles
- Images optimisées

---

## 📚 Exemples Complets

### Dashboard Page
```tsx
'use client';
import { AdminLayout, AdminStatsClient } from '@/components/admin';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminStatsClient />
    </AdminLayout>
  );
}
```

### Users Management Page
```tsx
'use client';
import { AdminLayout, AdminUsersTableModern } from '@/components/admin';

export default function UsersPage() {
  return (
    <AdminLayout>
      <AdminUsersTableModern />
    </AdminLayout>
  );
}
```

### Custom Page with Components
```tsx
'use client';
import { 
  AdminLayout, 
  StatCard, 
  Button, 
  Badge 
} from '@/components/admin';

export default function CustomPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <StatCard
          icon="📊"
          title="KPI"
          value={1250}
          gradient="blue"
        />
        <Button variant="primary">Action</Button>
        <Badge label="Status" variant="success" />
      </div>
    </AdminLayout>
  );
}
```

---

## 🛠️ Personnalisation

### Modifier les couleurs
Éditer `lib/constants/designTokens.ts`

### Ajouter de nouveaux tokens
```typescript
export const designTokens = {
  // ...
  myNewColor: '#FF0000',
  myNewGradient: 'linear-gradient(135deg, #FF0000 0%, #00FF00 100%)',
};
```

---

## 📖 Conventions

- **Noms**: PascalCase pour composants, camelCase pour hooks/fonctions
- **Fichiers**: Utiliser `.tsx` pour composants, `.ts` pour utils
- **Imports**: Préférer exports nommés plutôt que default
- **Props**: Interfaces TypeScript pour typage fort

---

## ✅ Checklist - Avant de lancer en prod

- [ ] Tester sur mobile (iPhone, Android)
- [ ] Tester sur tablette
- [ ] Vérifier les performances (Lighthouse)
- [ ] Tester l'accessibilité (WAVE)
- [ ] Intégrer avec les vraies données
- [ ] Ajouter pagination si >100 items
- [ ] Configurer toast notifications
- [ ] Tester dark mode (si ajouté)

---

## 🐛 Troubleshooting

### Le layout ne s'affiche pas
- Vérifier que AdminLayout enveloppe le contenu
- Vérifier que 'use client' est present

### Les colonnes du tableau ne s'alignent pas
- Vérifier les widths totalisent ~100%
- Utiliser des valeurs en %

### Les animations ne marchent pas
- Vérifier que Tailwind CSS est configuré
- Vérifier les classes transition-*

---

**Version:** 2.0  
**Dernière mise à jour:** 13/11/2025  
**Auteur:** Copilot Admin Team

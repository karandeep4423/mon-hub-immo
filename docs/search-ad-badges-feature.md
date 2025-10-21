# Search Ad Badges Feature

## Overview

Added a multi-select badges field to search ad forms allowing users to tag their search ads with relevant characteristics and highlights.

## Implementation Date

October 21, 2025

## Changes Made

### Backend (Server)

#### 1. SearchAd Model (`server/src/models/SearchAd.ts`)

- **Added `badges` field** to `ISearchAd` interface:
  ```typescript
  badges?: string[]; // Badges pour l'annonce
  ```
- **Added to Mongoose schema**:
  ```typescript
  badges: [{ type: String }],
  ```

### Frontend (Client)

#### 2. SearchAd Type (`client/types/searchAd.ts`)

- **Added `badges` field** to match backend:
  ```typescript
  badges?: string[]; // Badges pour l'annonce
  ```

#### 3. CreateSearchAdForm (`client/components/search-ads/CreateSearchAdForm.tsx`)

- **Updated FormData interface** with `badges: string[]`
- **Added badge options** (30 total badges):
  - Urgency: Vente urgente, Mandat possible rapidement, Signature imminente
  - Property characteristics: Bien rare, Secteur recherché, Bonne affaire, Fort potentiel
  - Contact info: Contact direct propriétaire, Contact ami/famille, Contact pro, Vendeur joignable
  - Property types: Maison individuelle, Appartement, Terrain constructible, Commerce, Immeuble, Bâtiment, Atypique, Bien à rénover
  - Buyer profiles: Jeune couple primo-accédant, Famille agrandissement, Retraité/résidence secondaire, Investisseur locatif
  - Project types: Projet rénovation/construction, Recherche résidence principale
  - Timeline: À rappeler rapidement, Disponible cette semaine, Projet à court terme (<3 mois), Projet à moyen terme (6-12 mois), Projet en réflexion
- **Updated handleArrayChange** to support 'badges' field
- **Added badges UI section** before Client Information section
- **Updated form submission** to include badges in API call

#### 4. EditSearchAdForm (`client/components/search-ads/EditSearchAdForm.tsx`)

- **Updated FormData interface** with `badges: string[]`
- **Added same badge options** array as CreateSearchAdForm
- **Updated initial form state** with `badges: []`
- **Updated form data loading** from API: `badges: ad.badges || []`
- **Updated handleArrayChange** to support 'badges' field
- **Added badges UI section** before Client Information section
- **Updated form submission** to include badges in API call

## UI/UX Details

### Badge Selection UI

- **Section title**: "🏷️ Badges pour l'annonce"
- **Description**: "Ajoutez des badges pour mettre en avant les caractéristiques importantes de cette recherche (optionnel)"
- **Layout**: Grid responsive
  - 1 column on mobile
  - 2 columns on sm screens
  - 3 columns on lg screens
  - 4 columns on xl screens
- **Checkbox styling**:
  - Brand color accent (`text-brand-600`)
  - Hover effect on labels
  - Minimum height for text wrapping
- **Multi-select**: Users can select unlimited badges
- **Optional field**: No validation required

## Badge Categories

1. **Urgency & Status** (7 badges)

   - Vente urgente
   - Mandat possible rapidement
   - Signature imminente
   - À rappeler rapidement
   - Disponible cette semaine
   - Projet à court terme (<3 mois)
   - Projet à moyen terme (6-12 mois)

2. **Property Characteristics** (11 badges)

   - Bien rare
   - Secteur recherché
   - Bonne affaire
   - Fort potentiel
   - Maison individuelle
   - Appartement
   - Terrain constructible
   - Commerce
   - Immeuble
   - Bâtiment
   - Atypique
   - Bien à rénover

3. **Contact Information** (4 badges)

   - Contact direct propriétaire
   - Contact ami / famille
   - Contact pro (collègue, artisan, notaire…)
   - Vendeur joignable

4. **Buyer Profiles** (4 badges)

   - Jeune couple primo-accédant
   - Famille agrandissement
   - Retraité / résidence secondaire
   - Investisseur locatif

5. **Project Types** (4 badges)
   - Projet rénovation / construction
   - Recherche résidence principale
   - Projet en réflexion

## API Contract

### Create Search Ad

```typescript
POST /api/searchAds
{
  // ... existing fields
  badges?: string[]
}
```

### Update Search Ad

```typescript
PUT /api/searchAds/:id
{
  // ... existing fields
  badges?: string[]
}
```

### Response

```typescript
{
  // ... existing fields
  badges?: string[]
}
```

## Badge Display

### Visual Presentation

Badges are displayed on search ad cards similar to property cards:

- **Position**: Top-left corner of the card image
- **Style**: Colored pills with white text
- **Limit**: Maximum 5 badges on SearchAdCard, 4 on HomeSearchAdCard
- **Responsive**: `max-w-[70%]` to prevent overflow

### Badge Configuration

Each badge has a unique color scheme defined in `client/lib/constants/badges.ts`:

- **Urgency badges**: Red shades (Vente urgente, Signature imminente, À rappeler)
- **Contact badges**: Blue/cyan shades (Contact direct, Contact ami/famille, Contact pro)
- **Property type badges**: Various colors (Maison: amber, Appartement: blue, Terrain: lime)
- **Timeline badges**: Orange/yellow/gray shades (Court terme, Moyen terme, En réflexion)
- **Buyer profile badges**: Pink/violet/rose shades (Primo-accédant, Famille, Retraité)

### Components Updated

- `SearchAdCard.tsx`: Full search ad card with badges on image
- `HomeSearchAdCard.tsx`: Homepage search ad card with badges on image

### Usage

```tsx
// Badges automatically display if searchAd.badges array has values
<SearchAdCard searchAd={searchAd} />
<HomeSearchAdCard searchAd={searchAd} />
```

## Testing Checklist

- [ ] Create new search ad with badges selected
- [ ] Create new search ad without badges (optional field)
- [ ] Edit existing search ad to add badges
- [ ] Edit existing search ad to remove badges
- [ ] Verify badges persist in database
- [ ] Verify badges display correctly on search ad details
- [ ] Test multi-select functionality (select/deselect multiple badges)
- [ ] Test responsive layout on different screen sizes
- [ ] Verify badge data included in collaboration flow

## Future Enhancements

1. **Badge Display**: Show badges on search ad cards and detail pages
2. **Badge Filtering**: Allow agents to filter search ads by badges
3. **Badge Analytics**: Track which badges lead to more collaborations
4. **Custom Badges**: Allow users to create custom badges
5. **Badge Colors**: Color-code badges by category
6. **Badge Icons**: Add visual icons for each badge category

## Files Modified

### Backend

- `server/src/models/SearchAd.ts`

### Frontend

- `client/types/searchAd.ts`
- `client/components/search-ads/CreateSearchAdForm.tsx`
- `client/components/search-ads/EditSearchAdForm.tsx`

## Related Features

- Search Ad Creation/Editing
- Collaboration System
- Search Ad Display

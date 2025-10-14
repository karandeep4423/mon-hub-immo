# Agency Fees & Collaboration Feature

## Overview

Implementation of agency fees management and collaboration details display as requested by Nicolas Fortin.

## Key Principles

1. **Prix affiché = Prix net vendeur** (displayed price = seller net price)
2. Agency fees, FAI price, and commissions are for internal calculation and transparency between agents
3. Collaboration details only shown when property is in active collaboration

## Changes Made

### 1. Backend - Property Model

**File:** `server/src/models/Property.ts`

Added new fields:

- `agencyFeesPercentage?: number` - % frais d'agence
- `agencyFeesAmount?: number` - Montant des frais d'agence (calculated)
- `priceIncludingFees?: number` - Prix FAI (Frais d'Acquéreur Inclus)

### 2. Frontend - Property Types

**File:** `client/lib/api/propertyApi.ts`

Added same fields to `Property` interface and `PropertyFormData` interface.

### 3. Property Creation Form

**File:** `client/components/property/PropertyForm.tsx`

Added "Frais d'agence" section in Step 1 with:

- % frais d'agence input (user enters this)
- Frais d'agence montant (auto-calculated: price × percentage / 100)
- Prix FAI (auto-calculated: price + fees amount)
- Auto-calculation on percentage change

## TODO - Next Steps

### 1. Property Details Page - Add "Prix et frais" Section

**File to modify:** `client/app/property/[id]/page.tsx`

Add new card section displaying:

```
📊 Prix et frais
- Prix net vendeur: 240 000 €
- % frais d'agence: 8 %
- → Frais d'agence: 19 200 €
- → Prix FAI: 259 200 €
```

Only show if `agencyFeesPercentage` is defined.

### 2. Property Details Page - Add "Détails collaboration" Section

**File to modify:** `client/app/property/[id]/page.tsx`

Add new card section (only if property has active collaboration):

```
🤝 Détails collaboration
- Part collaborateur: 50 %
- → Commission collaborateur: 9 600 €
- → Commission mandataire: 9 600 €
```

Formula:

- Commission collaborateur = agencyFeesAmount × (collaboration.proposedCommission / 100)
- Commission mandataire = agencyFeesAmount - Commission collaborateur

### 3. Property Card Components - Show Only Net Price

**Files to check:**

- `client/components/property/PropertyCard.tsx`
- `client/components/property/HomePropertyCard.tsx`

Ensure only `property.price` (prix net vendeur) is displayed on cards.

### 4. Dashboard Stats - Add "Valeur totale frais d'agence"

**File to modify:** `client/components/dashboard-agent/DashboardContent.tsx`

Add new KPI card showing:

```
💰 Valeur totale frais d'agence
[Total sum of agency fees for all active properties]
```

Formula: Sum of `agencyFeesAmount` for all properties where status = 'active' and owned by agent.

**Backend API needed:**

- Add endpoint or extend dashboard stats API to calculate total agency fees

### 5. Backend Dashboard Stats

**File to modify:** `server/src/controllers/dashboardController.ts`

Add calculation:

```typescript
const totalAgencyFees = await Property.aggregate([
  {
    $match: {
      owner: userId,
      status: "active",
      agencyFeesAmount: { $exists: true },
    },
  },
  { $group: { _id: null, total: { $sum: "$agencyFeesAmount" } } },
]);
```

## Visual Reference

As shown in client screenshot:

- Property details page shows separate "Prix et frais" card
- "Détails collaboration" card appears next to it
- Price displayed prominently is always "Prix net vendeur"
- FAI and fees are secondary information

## Database Migration

No migration needed - new fields are optional, existing properties will have undefined values.

## Testing Checklist

- [ ] Create property with agency fees
- [ ] Verify auto-calculation works
- [ ] Create property without agency fees
- [ ] Edit property and add/modify agency fees
- [ ] View property details - check "Prix et frais" display
- [ ] Create collaboration - check "Détails collaboration" display
- [ ] Verify dashboard shows total agency fees
- [ ] Check property cards only show net price

## Notes from Client

> "Le prix affiché sur la fiche du bien doit toujours correspondre au prix net vendeur."
>
> "Les autres montants (frais d'agence, prix FAI, commissions, etc.) servent uniquement au calcul interne et à la transparence entre agents."
>
> "La 'valeur totale frais d'agence' = somme de tous les frais d'agence des biens à vendre de cet agent. Permet un indicateur global sur le potentiel de commissions en portefeuille."

---

**Author:** Karan & Selmi  
**Date:** October 14, 2025  
**Status:** ✅ Form fields added, 🔄 Display pages pending

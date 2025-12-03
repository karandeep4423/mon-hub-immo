# Search Ads System

> Property search requests from apporteurs matching with agent properties

---

## 📋 Overview

Search Ads are property requests created by apporteurs (deal finders) to describe what kind of properties their clients are looking for. Agents can then match their properties to these requests to initiate collaborations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SEARCH AD FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   APPORTEUR                         AGENT                                   │
│   ┌─────────────┐                   ┌─────────────┐                        │
│   │ Create      │                   │ Browse      │                        │
│   │ Search Ad   │ ───────────────►  │ Search Ads  │                        │
│   │ (criteria)  │                   │ (matching)  │                        │
│   └─────────────┘                   └──────┬──────┘                        │
│                                            │                               │
│                                            ▼                               │
│                                    ┌─────────────┐                        │
│                                    │ Has matching│                        │
│                                    │  property?  │                        │
│                                    └──────┬──────┘                        │
│                                           │                               │
│                                    ┌──────┴──────┐                        │
│                                   YES            NO                        │
│                                    │              │                        │
│                              ┌─────▼─────┐       │                        │
│                              │  Propose  │       │                        │
│                              │Collaboration      │                        │
│                              └─────┬─────┘       │                        │
│                                    │              │                        │
│   ┌─────────────┐                  │              │                        │
│   │  Review &   │ ◄────────────────┘              │                        │
│   │  Accept?    │                                 │                        │
│   └─────────────┘                                 │                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄 Data Model

### SearchAd Schema

```typescript
interface ISearchAd extends Document {
  // Owner
  owner: mongoose.Types.ObjectId; // Apporteur

  // Search Criteria
  title: string;
  description?: string;

  // Property Type
  propertyTypes: ("apartment" | "house" | "land" | "commercial" | "other")[];
  transactionType: "sale" | "rent";

  // Budget
  minBudget?: number;
  maxBudget: number;

  // Location
  cities: string[]; // Target cities
  postalCodes?: string[]; // Specific postal codes
  departments?: string[]; // Departments (e.g., "75", "92")
  regions?: string[]; // Regions

  // Size Requirements
  minSurface?: number; // m²
  maxSurface?: number;
  minRooms?: number;
  maxRooms?: number;
  minBedrooms?: number;

  // Preferences
  mustHaveParking?: boolean;
  mustHaveGarden?: boolean;
  mustHaveBalcony?: boolean;
  mustHaveElevator?: boolean;
  maxFloor?: number; // For apartments
  groundFloorOnly?: boolean;

  // Energy
  minEnergyRating?: "A" | "B" | "C" | "D" | "E" | "F" | "G";

  // Client Info
  clientInfo?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    notes?: string;
    timeline?: string; // "Urgent", "1-3 months", etc.
  };

  // Status
  status: "active" | "paused" | "fulfilled" | "expired";
  expiresAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Status Meanings

| Status      | Description                           |
| ----------- | ------------------------------------- |
| `active`    | Actively searching, visible to agents |
| `paused`    | Temporarily paused by apporteur       |
| `fulfilled` | Property found, search complete       |
| `expired`   | Auto-expired after period             |

---

## 🔌 API Endpoints

### Search Ad CRUD

| Method   | Endpoint              | Description                | Auth          |
| -------- | --------------------- | -------------------------- | ------------- |
| `GET`    | `/api/search-ads`     | List all active search ads | Agent         |
| `GET`    | `/api/search-ads/:id` | Get search ad details      | Authenticated |
| `POST`   | `/api/search-ads`     | Create search ad           | Apporteur     |
| `PUT`    | `/api/search-ads/:id` | Update search ad           | Owner         |
| `DELETE` | `/api/search-ads/:id` | Delete search ad           | Owner         |

### My Search Ads

| Method | Endpoint               | Description                | Auth      |
| ------ | ---------------------- | -------------------------- | --------- |
| `GET`  | `/api/search-ads/mine` | Get apporteur's search ads | Apporteur |

### Matching

| Method | Endpoint                      | Description             | Auth  |
| ------ | ----------------------------- | ----------------------- | ----- |
| `GET`  | `/api/search-ads/:id/matches` | Get matching properties | Agent |

---

## 📝 Creating a Search Ad

### Required Fields

```typescript
// POST /api/search-ads
{
  "title": "Appartement T3+ Paris intra-muros",
  "propertyTypes": ["apartment"],
  "transactionType": "sale",
  "maxBudget": 500000,
  "cities": ["Paris"],
  "minRooms": 3
}
```

### Full Example

```typescript
{
  "title": "Appartement familial Paris/proche banlieue",
  "description": "Famille avec 2 enfants cherche appartement spacieux",
  "propertyTypes": ["apartment"],
  "transactionType": "sale",

  // Budget
  "minBudget": 400000,
  "maxBudget": 600000,

  // Location
  "cities": ["Paris", "Boulogne-Billancourt", "Neuilly-sur-Seine"],
  "departments": ["75", "92"],

  // Size
  "minSurface": 80,
  "minRooms": 4,
  "minBedrooms": 3,

  // Preferences
  "mustHaveElevator": true,
  "mustHaveParking": true,
  "maxFloor": 5,

  // Energy
  "minEnergyRating": "D",

  // Client
  "clientInfo": {
    "firstName": "Marie",
    "lastName": "Martin",
    "phone": "+33612345678",
    "notes": "Préfère lumineux, exposition sud",
    "timeline": "Dans les 3 mois"
  }
}
```

---

## 🔍 Agent Search & Filtering

### Query Parameters

```typescript
// GET /api/search-ads?params

interface SearchAdFilters {
  // Location
  city?: string;
  department?: string;
  region?: string;

  // Budget Range
  minBudget?: number;
  maxBudget?: number;

  // Property Type
  propertyType?: string;
  transactionType?: "sale" | "rent";

  // Size
  minSurface?: number;
  minRooms?: number;

  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sortBy?: "createdAt" | "maxBudget";
  sortOrder?: "asc" | "desc";
}
```

### Example: Agent Finding Matching Search Ads

```
GET /api/search-ads?city=Paris&minBudget=300000&propertyType=apartment&sortBy=maxBudget&sortOrder=desc
```

---

## 🔗 Property Matching

### Match Score Algorithm

```typescript
// services/matchingService.ts
interface MatchResult {
  property: Property;
  searchAd: SearchAd;
  score: number; // 0-100
  matchDetails: {
    locationMatch: boolean;
    budgetMatch: boolean;
    sizeMatch: boolean;
    typeMatch: boolean;
    amenitiesMatch: string[];
    mismatches: string[];
  };
}

const calculateMatchScore = (
  property: Property,
  searchAd: SearchAd
): MatchResult => {
  let score = 0;
  const details = { amenitiesMatch: [], mismatches: [] };

  // Location (30 points)
  if (searchAd.cities.includes(property.city)) {
    score += 30;
    details.locationMatch = true;
  }

  // Budget (25 points)
  if (property.price <= searchAd.maxBudget) {
    score += 25;
    if (searchAd.minBudget && property.price >= searchAd.minBudget) {
      score += 5; // Bonus for being in range
    }
    details.budgetMatch = true;
  }

  // Size (20 points)
  if (!searchAd.minSurface || property.surface >= searchAd.minSurface) {
    score += 10;
    details.sizeMatch = true;
  }
  if (!searchAd.minRooms || property.rooms >= searchAd.minRooms) {
    score += 10;
  }

  // Type (15 points)
  if (searchAd.propertyTypes.includes(property.propertyType)) {
    score += 15;
    details.typeMatch = true;
  }

  // Amenities (10 points)
  if (searchAd.mustHaveParking && property.hasParking) {
    score += 2;
    details.amenitiesMatch.push("parking");
  }
  if (searchAd.mustHaveGarden && property.hasGarden) {
    score += 2;
    details.amenitiesMatch.push("garden");
  }
  // ... other amenities

  return { property, searchAd, score, matchDetails: details };
};
```

### API Response

```typescript
// GET /api/search-ads/:id/matches
{
  "searchAd": { /* search ad data */ },
  "matches": [
    {
      "property": { /* property data */ },
      "score": 85,
      "matchDetails": {
        "locationMatch": true,
        "budgetMatch": true,
        "sizeMatch": true,
        "typeMatch": true,
        "amenitiesMatch": ["parking", "elevator"],
        "mismatches": ["No garden (requested)"]
      }
    }
  ],
  "totalMatches": 5
}
```

---

## 🎣 Client Hooks

### useSearchAds

```typescript
// hooks/useSearchAds.ts
export const useSearchAds = (filters?: SearchAdFilters) => {
  const { data, error, isLoading, mutate } = useSWR(
    [SWR_KEYS.SEARCH_ADS, filters],
    () => searchAdService.getAll(filters)
  );

  return {
    searchAds: data?.searchAds || [],
    pagination: data?.pagination,
    loading: isLoading,
    error,
    refresh: mutate,
  };
};
```

### useSearchAdForm

```typescript
// hooks/useSearchAdForm.ts
export const useSearchAdForm = (searchAdId?: string) => {
  const [formData, setFormData] = useState<SearchAdFormData>(defaultValues);

  // Load existing search ad
  useFetch(() => searchAdService.getById(searchAdId!), {
    enabled: !!searchAdId,
    onSuccess: (data) => setFormData(data),
  });

  const { mutate: save, loading } = useMutation(
    async () => {
      if (searchAdId) {
        return searchAdService.update(searchAdId, formData);
      }
      return searchAdService.create(formData);
    },
    { successMessage: "Annonce de recherche enregistrée" }
  );

  return { formData, setFormData, save, loading };
};
```

---

## 🧩 Components

### SearchAdCard

```tsx
// components/search-ads/SearchAdCard.tsx
interface SearchAdCardProps {
  searchAd: SearchAd;
  onMatch?: () => void; // For agents
}

const SearchAdCard = ({ searchAd, onMatch }) => (
  <div className="search-ad-card">
    <div className="header">
      <h3>{searchAd.title}</h3>
      <Badge>{searchAd.transactionType}</Badge>
    </div>

    <div className="budget">
      <span>Budget: </span>
      {searchAd.minBudget && `${formatPrice(searchAd.minBudget)} - `}
      {formatPrice(searchAd.maxBudget)}
    </div>

    <div className="criteria">
      <CriteriaList searchAd={searchAd} />
    </div>

    <div className="locations">
      {searchAd.cities.map((city) => (
        <LocationTag key={city}>{city}</LocationTag>
      ))}
    </div>

    {onMatch && <Button onClick={onMatch}>Proposer un bien</Button>}
  </div>
);
```

### SearchAdForm

```tsx
// components/search-ads/SearchAdForm.tsx
const SearchAdForm = () => {
  const { formData, setFormData, save, loading } = useSearchAdForm();

  return (
    <form onSubmit={save}>
      {/* Basic Info */}
      <Section title="Description de la recherche">
        <Input
          label="Titre"
          value={formData.title}
          onChange={(v) => setFormData({ ...formData, title: v })}
        />
        <Textarea label="Description" value={formData.description} />
      </Section>

      {/* Property Criteria */}
      <Section title="Critères du bien">
        <PropertyTypeSelector
          selected={formData.propertyTypes}
          onChange={(types) =>
            setFormData({ ...formData, propertyTypes: types })
          }
        />
        <TransactionTypeToggle />
      </Section>

      {/* Budget */}
      <Section title="Budget">
        <BudgetRangeInput min={formData.minBudget} max={formData.maxBudget} />
      </Section>

      {/* Location */}
      <Section title="Localisation">
        <CityMultiSelect
          selected={formData.cities}
          onChange={(cities) => setFormData({ ...formData, cities })}
        />
      </Section>

      {/* Size Requirements */}
      <Section title="Surface et pièces">
        <SurfaceRange />
        <RoomsSelector />
      </Section>

      {/* Amenities */}
      <Section title="Critères obligatoires">
        <AmenityCheckboxes />
      </Section>

      {/* Client Info */}
      <Section title="Client (optionnel)">
        <ClientInfoForm
          value={formData.clientInfo}
          onChange={(client) =>
            setFormData({ ...formData, clientInfo: client })
          }
        />
      </Section>

      <SubmitButton loading={loading} />
    </form>
  );
};
```

---

## 🔄 Collaboration Initiation

When an agent finds a matching property:

```typescript
// Agent clicks "Propose" on a search ad
const initiateCollaboration = async (
  searchAdId: string,
  propertyId: string
) => {
  // Create collaboration linking agent's property to apporteur's search ad
  const response = await api.post("/collaborations", {
    searchAdId,
    propertyId,
    message: "J'ai un bien qui correspond à votre recherche",
  });

  // Apporteur receives notification
  // Search ad status can be updated to "pending" if desired
};
```

---

## 📊 Search Ad Statistics

### For Apporteur Dashboard

```typescript
// GET /api/search-ads/mine/stats
{
  "total": 5,
  "byStatus": {
    "active": 3,
    "paused": 1,
    "fulfilled": 1
  },
  "totalProposals": 12,  // Collaboration requests received
  "avgResponseTime": "2.5 days"
}
```

---

## ⏱ Expiration

Search ads can auto-expire:

```typescript
// Cron job or TTL index
const expireSearchAds = async () => {
  await SearchAd.updateMany(
    {
      status: "active",
      expiresAt: { $lt: new Date() },
    },
    { status: "expired" }
  );
};

// Or MongoDB TTL index
searchAdSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "active" } }
);
```

---

_Next: [Appointments →](./appointments.md)_

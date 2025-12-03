# Properties System

> Real estate property management, listings, and client association

---

## 📋 Overview

Properties are the core entity in MonHubImmo - real estate listings created by agents that can be linked with apporteurs through collaborations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROPERTY LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   AGENT                                                                     │
│   ┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐  │
│   │  Create   │ ──►  │   Draft   │ ──►  │  Active   │ ──►  │   Sold    │  │
│   │ Property  │      │  (Edit)   │      │ (Public)  │      │(Archived) │  │
│   └───────────┘      └───────────┘      └───────────┘      └───────────┘  │
│                            │                  │                            │
│                            ▼                  ▼                            │
│   APPORTEUR          Match with         Collaboration                      │
│   ┌───────────┐      Search Ad          Request                           │
│   │  Browse   │ ◄────────────────────────────┘                            │
│   │Properties │                                                            │
│   └───────────┘                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄 Data Model

### Property Schema

```typescript
interface IProperty extends Document {
  // Owner
  owner: mongoose.Types.ObjectId; // Agent who created

  // Basic Info
  title: string;
  description: string;
  propertyType: "apartment" | "house" | "land" | "commercial" | "other";
  transactionType: "sale" | "rent";

  // Pricing
  price: number;
  pricePerSquareMeter?: number;
  charges?: number;

  // Location
  address: string;
  city: string;
  postalCode: string; // French format: 5 digits
  department?: string;
  region?: string;
  latitude?: number;
  longitude?: number;

  // Features
  surface: number; // m²
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  constructionYear?: number;

  // Amenities
  hasParking: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  hasTerrace: boolean;
  hasPool: boolean;
  hasElevator: boolean;
  hasCellar: boolean;

  // Energy Performance
  energyRating?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  gasEmissionRating?: "A" | "B" | "C" | "D" | "E" | "F" | "G";

  // Media
  images: string[]; // S3 URLs
  virtualTourUrl?: string;

  // Client (for collaborations)
  clientInfo?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    notes?: string;
  };

  // Status
  status: "draft" | "active" | "pending" | "sold" | "rented" | "archived";
  availableFrom?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Status Flow

| Status     | Description                         |
| ---------- | ----------------------------------- |
| `draft`    | Property being created, not visible |
| `active`   | Live and searchable                 |
| `pending`  | Under offer/negotiation             |
| `sold`     | Sale completed                      |
| `rented`   | Rental completed                    |
| `archived` | Removed from listings               |

---

## 🔌 API Endpoints

### Property CRUD

| Method   | Endpoint              | Description                | Auth   |
| -------- | --------------------- | -------------------------- | ------ |
| `GET`    | `/api/properties`     | List all active properties | Public |
| `GET`    | `/api/properties/:id` | Get property details       | Public |
| `POST`   | `/api/properties`     | Create property            | Agent  |
| `PUT`    | `/api/properties/:id` | Update property            | Owner  |
| `DELETE` | `/api/properties/:id` | Delete property            | Owner  |

### Agent Properties

| Method | Endpoint                     | Description             | Auth  |
| ------ | ---------------------------- | ----------------------- | ----- |
| `GET`  | `/api/properties/mine`       | Get agent's properties  | Agent |
| `GET`  | `/api/properties/mine/stats` | Get property statistics | Agent |

### Images

| Method   | Endpoint                              | Description   | Auth  |
| -------- | ------------------------------------- | ------------- | ----- |
| `POST`   | `/api/properties/:id/images`          | Upload images | Owner |
| `DELETE` | `/api/properties/:id/images/:imageId` | Remove image  | Owner |

---

## 📤 Property Creation Flow

### 1. Basic Information

```typescript
// POST /api/properties
{
  "title": "Appartement T3 lumineux",
  "description": "Bel appartement...",
  "propertyType": "apartment",
  "transactionType": "sale",
  "price": 350000,
  "surface": 75
}
```

### 2. Location Details

```typescript
// PUT /api/properties/:id
{
  "address": "15 Rue de la Paix",
  "city": "Paris",
  "postalCode": "75002",
  "department": "Paris",
  "region": "Île-de-France"
}
```

### 3. Features & Amenities

```typescript
{
  "rooms": 3,
  "bedrooms": 2,
  "bathrooms": 1,
  "floor": 4,
  "totalFloors": 6,
  "hasBalcony": true,
  "hasElevator": true,
  "energyRating": "C",
  "gasEmissionRating": "D"
}
```

### 4. Image Upload

```typescript
// POST /api/properties/:id/images
// Content-Type: multipart/form-data
// Field: images (multiple files)

const formData = new FormData();
images.forEach((file) => formData.append("images", file));

await api.post(`/properties/${id}/images`, formData);
```

### 5. Client Information (for Collaborations)

```typescript
{
  "clientInfo": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@email.com",
    "phone": "+33612345678",
    "notes": "Client motivated, looking for quick sale"
  }
}
```

### 6. Publish

```typescript
// PUT /api/properties/:id
{ "status": "active" }
```

---

## 🔍 Filtering & Search

### Query Parameters

```typescript
// GET /api/properties?params

interface PropertyFilters {
  // Location
  city?: string;
  postalCode?: string;
  department?: string;
  region?: string;

  // Property Type
  propertyType?: "apartment" | "house" | "land" | "commercial";
  transactionType?: "sale" | "rent";

  // Price Range
  minPrice?: number;
  maxPrice?: number;

  // Surface Range
  minSurface?: number;
  maxSurface?: number;

  // Rooms
  minRooms?: number;
  maxRooms?: number;
  minBedrooms?: number;

  // Amenities
  hasParking?: boolean;
  hasGarden?: boolean;
  hasBalcony?: boolean;
  hasPool?: boolean;
  hasElevator?: boolean;

  // Energy
  energyRating?: string[]; // ['A', 'B', 'C']

  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sortBy?: "price" | "surface" | "createdAt";
  sortOrder?: "asc" | "desc";
}
```

### Example Request

```
GET /api/properties?city=Paris&minPrice=200000&maxPrice=500000&propertyType=apartment&minRooms=2&hasBalcony=true&sortBy=price&sortOrder=asc&page=1&limit=20
```

---

## 🖼 Image Management

### Upload Process

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │      │   Server    │      │    AWS S3   │
│  (Browser)  │      │  (Express)  │      │   Bucket    │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │
       │ POST /images       │                    │
       │ (multipart)        │                    │
       │───────────────────►│                    │
       │                    │                    │
       │                    │ Validate file      │
       │                    │ (type, size)       │
       │                    │                    │
       │                    │ Upload to S3       │
       │                    │───────────────────►│
       │                    │                    │
       │                    │◄───────────────────│
       │                    │ Return URL         │
       │                    │                    │
       │                    │ Save URL to        │
       │                    │ property.images[]  │
       │                    │                    │
       │◄───────────────────│                    │
       │ Success + URLs     │                    │
       │                    │                    │
```

### S3 Configuration

```typescript
// services/s3Service.ts
const uploadPropertyImage = async (
  propertyId: string,
  file: Express.Multer.File
): Promise<string> => {
  const key = `properties/${propertyId}/${uuidv4()}-${file.originalname}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
```

### Image Constraints

- **Max file size**: 10MB per image
- **Allowed types**: JPEG, PNG, WebP
- **Max images**: 20 per property
- **Recommended dimensions**: 1920x1080 minimum

---

## 🎣 Client Hooks

### useProperties

```typescript
// hooks/useProperties.ts
export const useProperties = (filters: PropertyFilters) => {
  const { data, error, isLoading, mutate } = useSWR(
    [SWR_KEYS.PROPERTIES, filters],
    () => propertyService.getAll(filters)
  );

  return {
    properties: data?.properties || [],
    pagination: data?.pagination,
    loading: isLoading,
    error,
    refresh: mutate,
  };
};
```

### usePropertyForm

```typescript
// hooks/usePropertyForm.ts
export const usePropertyForm = (propertyId?: string) => {
  const [formData, setFormData] = useState<PropertyFormData>(defaultValues);
  const [images, setImages] = useState<File[]>([]);

  const { mutate: save, loading: saving } = useMutation(
    async () => {
      if (propertyId) {
        return propertyService.update(propertyId, formData);
      }
      return propertyService.create(formData);
    },
    { successMessage: "Bien enregistré" }
  );

  const uploadImages = async (propertyId: string) => {
    if (images.length === 0) return;

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    await api.post(`/properties/${propertyId}/images`, formData);
  };

  return {
    formData,
    setFormData,
    images,
    setImages,
    save,
    saving,
    uploadImages,
  };
};
```

### usePropertyFilters

```typescript
// hooks/usePropertyFilters.ts
export const usePropertyFilters = () => {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const debouncedFilters = useDebounce(filters, 300);

  const updateFilter = <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters({});

  return {
    filters: debouncedFilters,
    updateFilter,
    resetFilters,
  };
};
```

---

## 🧩 Components

### PropertyCard

```tsx
// components/property/PropertyCard.tsx
interface PropertyCardProps {
  property: Property;
  onFavorite?: () => void;
  showActions?: boolean;
}

const PropertyCard = ({ property, onFavorite, showActions }) => (
  <div className="property-card">
    <PropertyImages images={property.images} />
    <div className="property-info">
      <h3>{property.title}</h3>
      <p className="price">{formatPrice(property.price)}</p>
      <PropertyFeatures property={property} />
      <PropertyLocation city={property.city} postalCode={property.postalCode} />
    </div>
    {showActions && (
      <PropertyActions property={property} onFavorite={onFavorite} />
    )}
  </div>
);
```

### PropertyForm

```tsx
// components/property/PropertyForm/index.tsx
const PropertyForm = () => {
  const { formData, setFormData, save, saving } = usePropertyForm();

  return (
    <form onSubmit={save}>
      <BasicInfoSection formData={formData} onChange={setFormData} />
      <LocationSection formData={formData} onChange={setFormData} />
      <FeaturesSection formData={formData} onChange={setFormData} />
      <ImageUploader />
      <ClientInfoSection formData={formData} onChange={setFormData} />
      <SubmitButton loading={saving} />
    </form>
  );
};
```

### PropertyFilters

```tsx
// components/property/PropertyFilters.tsx
const PropertyFilters = () => {
  const { filters, updateFilter, resetFilters } = usePropertyFilters();

  return (
    <div className="filters">
      <LocationFilter
        value={filters.city}
        onChange={(v) => updateFilter("city", v)}
      />
      <PriceRangeFilter
        min={filters.minPrice}
        max={filters.maxPrice}
        onChange={(min, max) => {
          updateFilter("minPrice", min);
          updateFilter("maxPrice", max);
        }}
      />
      <PropertyTypeFilter />
      <AmenitiesFilter />
      <button onClick={resetFilters}>Réinitialiser</button>
    </div>
  );
};
```

---

## 🔐 Ownership Verification

All property modifications verify ownership:

```typescript
// middleware/propertyOwnership.ts
export const verifyPropertyOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  if (property.owner.toString() !== req.user.userId) {
    return res.status(403).json({
      error: "Not authorized to modify this property",
    });
  }

  req.property = property;
  next();
};
```

---

## 📊 Property Statistics

Agent dashboard statistics:

```typescript
// GET /api/properties/mine/stats
{
  "total": 15,
  "byStatus": {
    "active": 10,
    "draft": 2,
    "pending": 2,
    "sold": 1
  },
  "byType": {
    "apartment": 8,
    "house": 5,
    "commercial": 2
  },
  "totalValue": 4500000,
  "averagePrice": 300000
}
```

---

_Next: [Search Ads →](./searchads.md)_

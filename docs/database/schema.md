# Database Schema

> MongoDB collections, Mongoose models, and entity relationships

---

## 📊 Overview

MonHubImmo uses **MongoDB** with **Mongoose ODM**. All models are defined with TypeScript interfaces.

### Collections

| Collection              | Description                                |
| ----------------------- | ------------------------------------------ |
| `users`                 | User accounts (agents, apporteurs, admins) |
| `properties`            | Real estate listings                       |
| `searchads`             | Property search advertisements             |
| `collaborations`        | Agent-apporteur partnerships               |
| `messages`              | Chat messages                              |
| `appointments`          | Booking appointments                       |
| `notifications`         | User notifications                         |
| `userfavorites`         | Property favorites                         |
| `userfavoritesearchads` | Search ad favorites                        |
| `pendingverifications`  | Email verification records                 |
| `loginattempts`         | Failed login tracking                      |
| `securitylogs`          | Security audit logs                        |
| `agentavailabilities`   | Agent schedule slots                       |

---

## 👤 User Model

### Schema

```typescript
interface IUser extends Document {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  userType: "agent" | "apporteur" | "guest" | "admin";
  isEmailVerified: boolean;
  isGuest: boolean;
  profileImage?: string;
  lastSeen?: Date;
  profileCompleted: boolean;

  // Professional Info (Agents)
  professionalInfo?: {
    postalCode?: string;
    city?: string;
    interventionRadius?: number;
    coveredCities?: string[];
    network?: string;
    siretNumber?: string;
    mandateTypes?: ("simple" | "exclusif" | "co-mandat")[];
    yearsExperience?: number;
    personalPitch?: string;
    collaborateWithAgents?: boolean;
    shareCommission?: boolean;
    independentAgent?: boolean;
    alertsEnabled?: boolean;
    alertFrequency?: "quotidien" | "hebdomadaire";
    identityCard?: {
      url: string;
      key: string;
      uploadedAt: Date;
    };
  };

  // Search Preferences
  searchPreferences?: {
    preferredRadius?: number;
    lastSearchLocations?: Array<{
      city: string;
      postcode: string;
      coordinates?: { lat: number; lon: number };
    }>;
  };

  // Email Verification
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;

  // Password Reset
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  mustChangePassword?: boolean;

  // Account Security
  failedLoginAttempts?: number;
  accountLockedUntil?: Date;
  passwordHistory?: Array<{ hash: string; changedAt: Date }>;

  // Subscription
  isPaid: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;

  // Admin Features
  isValidated: boolean;
  validatedAt?: Date;
  validatedBy?: ObjectId;
  isBlocked?: boolean;
  blockedAt?: Date;
  blockedBy?: ObjectId;
  accessGrantedByAdmin?: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}
```

### Indexes

```javascript
// Unique email index
{ email: 1 } // unique: true

// User type queries
{ userType: 1 }

// Location-based agent search
{ "professionalInfo.city": 1 }
{ "professionalInfo.postalCode": 1 }
```

---

## 🏠 Property Model

### Schema

```typescript
interface IProperty extends Document {
  // Basic Info
  title: string;
  description: string;
  price: number;
  surface: number;
  propertyType: 'Appartement' | 'Maison' | 'Terrain' | 'Local commercial' | 'Bureaux';
  transactionType: 'Vente' | 'Location';

  // Location
  address: string;
  city: string;
  postalCode: string;
  sector: string;

  // Property Details
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;

  // Features
  hasParking: boolean;
  hasGarden: boolean;
  hasElevator: boolean;
  hasBalcony: boolean;
  hasTerrace: boolean;
  hasGarage: boolean;

  // Energy
  energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Non soumis au DPE';
  gasEmissionClass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Non soumis au DPE';

  // Condition
  condition?: 'new' | 'good' | 'refresh' | 'renovate';
  propertyNature?: string;
  saleType?: string;

  // Financial
  annualCondoFees?: number;
  agencyFeesPercentage?: number;
  agencyFeesAmount?: number;
  priceIncludingFees?: number;

  // Additional Details
  landArea?: number;
  levels?: number;
  parkingSpaces?: number;
  exterior?: ('garden' | 'balcony' | 'terrace' | 'courtyard' | 'none')[];
  availableFromDate?: string;

  // Images
  mainImage: { url: string; key: string };
  galleryImages: Array<{ url: string; key: string }>;
  images?: string[]; // Legacy

  // Ownership
  owner: ObjectId | IUser;

  // Status
  status: 'active' | 'sold' | 'rented' | 'draft' | 'archived';
  badges: string[];
  isFeatured: boolean;

  // Stats
  viewCount: number;
  favoriteCount: number;

  // Client Info (Collaboration-only)
  clientInfo?: {
    commercialDetails?: { ... };
    propertyHistory?: { ... };
    ownerInfo?: { ... };
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes

```javascript
// Location searches
{ city: 1, postalCode: 1 }
{ city: 'text', sector: 'text', title: 'text' }

// Price range queries
{ price: 1 }
{ transactionType: 1, price: 1 }

// Owner properties
{ owner: 1 }

// Status filtering
{ status: 1 }
```

---

## 🤝 Collaboration Model

### Schema

```typescript
interface ICollaboration extends Document {
  _id: ObjectId;

  // Post Reference
  postId: ObjectId; // Property or SearchAd
  postType: "Property" | "SearchAd";
  postOwnerId: ObjectId;
  collaboratorId: ObjectId;

  // Status
  status:
    | "pending"
    | "accepted"
    | "active"
    | "completed"
    | "cancelled"
    | "rejected";

  // Proposal
  proposedCommission: number; // Percentage (e.g., 40 for 40%)
  proposalMessage?: string;

  // Compensation (for SearchAd collaborations)
  compensationType?: "percentage" | "fixed_amount" | "gift_vouchers";
  compensationAmount?: number;

  // Contract Signing
  ownerSigned: boolean;
  ownerSignedAt?: Date;
  collaboratorSigned: boolean;
  collaboratorSignedAt?: Date;
  contractText?: string;
  additionalTerms?: string;
  contractModified: boolean;
  contractLastModifiedBy?: ObjectId;
  contractLastModifiedAt?: Date;

  // Progress Tracking
  currentStep: "proposal" | "contract_signing" | "active" | "completed";
  currentProgressStep: ProgressStepId;
  progressSteps: Array<{
    id: ProgressStepId;
    completed: boolean;
    validatedAt?: Date;
    ownerValidated: boolean;
    collaboratorValidated: boolean;
    notes: Array<{
      note: string;
      createdBy: ObjectId;
      createdAt: Date;
    }>;
  }>;

  // Activity Log
  activities: Array<{
    type:
      | "proposal"
      | "acceptance"
      | "rejection"
      | "signing"
      | "status_update"
      | "progress_step_update"
      | "note";
    message: string;
    createdBy: ObjectId;
    createdAt: Date;
  }>;

  // Completion
  completedAt?: Date;
  completionReason?: CompletionReason;
  completedBy?: ObjectId;
  completedByRole?: "owner" | "collaborator";

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

type ProgressStepId =
  | "accord_collaboration"
  | "premier_contact"
  | "visite_programmee"
  | "visite_realisee"
  | "retour_client"
  | "offre_en_cours"
  | "negociation_en_cours"
  | "compromis_signe"
  | "signature_notaire"
  | "affaire_conclue";

type CompletionReason =
  | "vente_conclue_collaboration"
  | "vente_conclue_seul"
  | "bien_retire"
  | "mandat_expire"
  | "client_desiste"
  | "vendu_tiers"
  | "sans_suite";
```

### Indexes

```javascript
// Post queries
{ postId: 1 }
{ postId: 1, postType: 1 }

// User collaborations
{ postOwnerId: 1 }
{ collaboratorId: 1 }

// Status filtering
{ status: 1 }

// Combined queries
{ postOwnerId: 1, status: 1 }
{ collaboratorId: 1, status: 1 }
```

---

## 💬 Message Model

### Schema

```typescript
interface IMessage extends Document {
  senderId: ObjectId;
  receiverId: ObjectId;
  text?: string;
  image?: string;
  attachments?: Array<{
    url: string;
    name: string;
    mime: string;
    size: number;
    type: "image" | "pdf" | "doc" | "docx" | "file";
    thumbnailUrl?: string;
  }>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes

```javascript
// Unread count queries
{ receiverId: 1, isRead: 1 }

// Conversation queries
{ senderId: 1, receiverId: 1 }
```

---

## 🔍 SearchAd Model

### Schema

```typescript
interface ISearchAd extends Document {
  authorId: ObjectId;
  authorType: 'agent' | 'apporteur';
  status: 'active' | 'paused' | 'fulfilled' | 'sold' | 'rented' | 'archived';

  // Search Criteria
  propertyTypes: ('house' | 'apartment' | 'land' | 'building' | 'commercial')[];
  propertyState: ('new' | 'old')[];
  projectType: 'primary' | 'secondary' | 'investment';

  // Location
  location?: {
    cities: string[];
    postalCodes?: string[];
    maxDistance?: number;
    openToOtherAreas: boolean;
  };

  // Requirements
  minRooms?: number;
  minBedrooms?: number;
  minSurface?: number;
  hasExterior: boolean;
  hasParking: boolean;
  acceptedFloors?: string;
  desiredState: ('new' | 'good' | 'refresh' | 'renovate')[];

  // Budget
  budget?: {
    max: number;
    ideal?: number;
    financingType: 'loan' | 'cash' | 'pending';
    isSaleInProgress: boolean;
    hasBankApproval: boolean;
  };

  // Priorities
  priorities: {
    mustHaves: string[];
    niceToHaves: string[];
    dealBreakers: string[];
  };

  // Display
  title: string;
  description: string;
  badges?: string[];

  // Client Info
  clientInfo?: {
    qualificationInfo?: { ... };
    timelineInfo?: { ... };
  };

  createdAt: Date;
  updatedAt: Date;
}
```

---

## 📅 Appointment Model

### Schema

```typescript
interface IAppointment extends Document {
  agentId: ObjectId;
  clientId?: ObjectId;
  isGuestBooking: boolean;

  appointmentType: "estimation" | "vente" | "achat" | "conseil";
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

  scheduledDate: Date;
  scheduledTime: string; // "HH:MM"
  duration: number; // minutes

  propertyDetails?: {
    address?: string;
    city?: string;
    postalCode?: string;
    propertyType?: string;
    description?: string;
  };

  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };

  notes?: string;

  // Reschedule
  isRescheduled?: boolean;
  rescheduleReason?: string;
  originalScheduledDate?: Date;
  originalScheduledTime?: string;

  // Cancellation
  cancellationReason?: string;
  cancelledBy?: ObjectId;
  cancelledAt?: Date;

  agentNotes?: string;
  respondedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes

```javascript
{ agentId: 1 }
{ clientId: 1 }
{ status: 1 }
{ scheduledDate: 1 }
{ agentId: 1, scheduledDate: 1 }
```

---

## 🔔 Notification Model

### Schema

```typescript
interface INotification extends Document {
  userId: ObjectId;
  type:
    | "collaboration_proposal"
    | "collaboration_accepted"
    | "collaboration_rejected"
    | "contract_signed"
    | "progress_update"
    | "message"
    | "appointment"
    | "system";
  title: string;
  message: string;
  data?: {
    collaborationId?: string;
    propertyId?: string;
    searchAdId?: string;
    appointmentId?: string;
    senderId?: string;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}
```

### Indexes

```javascript
{ userId: 1, isRead: 1 }
{ userId: 1, createdAt: -1 }
```

---

## 🔐 Security Models

### LoginAttempt

```typescript
interface ILoginAttempt extends Document {
  email: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  createdAt: Date;
}
```

### SecurityLog

```typescript
interface ISecurityLog extends Document {
  userId?: ObjectId;
  action: string;
  ip: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
```

### PendingVerification

```typescript
interface IPendingVerification extends Document {
  email: string;
  verificationCode: string;
  userData: {
    firstName: string;
    lastName: string;
    phone?: string;
    userType: string;
    password: string;
    identityCardKey?: string;
  };
  expiresAt: Date;
  createdAt: Date;
}
```

---

## 🔗 Entity Relationships

```
                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌───────────┐     ┌───────────┐
  │ Property │      │ SearchAd  │     │  Message  │
  └────┬─────┘      └─────┬─────┘     └───────────┘
       │                  │
       │                  │
       └────────┬─────────┘
                │
                ▼
         ┌─────────────┐
         │Collaboration│
         └──────┬──────┘
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│Contract │ │Progress │ │Activities│
└─────────┘ └─────────┘ └──────────┘
```

### Relationships Summary

| From     | To            | Type | Description                         |
| -------- | ------------- | ---- | ----------------------------------- |
| User     | Property      | 1:N  | User owns properties                |
| User     | SearchAd      | 1:N  | User creates search ads             |
| User     | Collaboration | N:N  | Via postOwnerId/collaboratorId      |
| Property | Collaboration | 1:N  | Property has collaborations         |
| SearchAd | Collaboration | 1:N  | SearchAd has collaborations         |
| User     | Message       | N:N  | Users send/receive messages         |
| User     | Appointment   | N:N  | Agent has appointments with clients |
| User     | Notification  | 1:N  | User receives notifications         |
| User     | UserFavorite  | 1:N  | User favorites properties           |

---

_Next: [Frontend Guide →](../frontend/overview.md)_

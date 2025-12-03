# Collaboration System

> Agent-apporteur partnership workflows, progress tracking, and contract management

---

## 🤝 Overview

The collaboration system enables partnerships between:

- **Agents** (real estate professionals)
- **Apporteurs d'affaires** (lead providers)

Collaborations can be initiated on:

- **Properties**: Listed by agents
- **Search Ads**: Created by apporteurs for buyer needs

---

## 🔄 Collaboration Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COLLABORATION LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────┐                                                            │
│   │  PENDING  │  ← Initial proposal sent                                   │
│   └─────┬─────┘                                                            │
│         │                                                                  │
│     Accept/Reject                                                          │
│         │                                                                  │
│   ┌─────▼─────┐         ┌───────────┐                                      │
│   │ ACCEPTED  │         │ REJECTED  │  → End                               │
│   └─────┬─────┘         └───────────┘                                      │
│         │                                                                  │
│    Contract Signing                                                        │
│    (Both parties)                                                          │
│         │                                                                  │
│   ┌─────▼─────┐                                                            │
│   │  ACTIVE   │  ← Progress tracking begins                                │
│   └─────┬─────┘                                                            │
│         │                                                                  │
│   Progress Steps (10 stages)                                               │
│         │                                                                  │
│   ┌─────▼─────┐         ┌───────────┐                                      │
│   │ COMPLETED │         │ CANCELLED │                                      │
│   └───────────┘         └───────────┘                                      │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Progress Steps

Collaborations track progress through 10 defined stages:

| Step                   | French Label            | Description                 |
| ---------------------- | ----------------------- | --------------------------- |
| `accord_collaboration` | Accord de collaboration | Initial agreement confirmed |
| `premier_contact`      | Premier contact         | First contact with client   |
| `visite_programmee`    | Visite programmée       | Visit scheduled             |
| `visite_realisee`      | Visite réalisée         | Visit completed             |
| `retour_client`        | Retour client           | Client feedback received    |
| `offre_en_cours`       | Offre en cours          | Offer in progress           |
| `negociation_en_cours` | Négociation en cours    | Negotiation ongoing         |
| `compromis_signe`      | Compromis signé         | Preliminary contract signed |
| `signature_notaire`    | Signature notaire       | Notary appointment          |
| `affaire_conclue`      | Affaire conclue         | Deal completed              |

### Progress Validation

Each step requires validation from both parties:

```typescript
// Collaboration model
progressSteps: Array<{
  id: ProgressStepId;
  completed: boolean;
  validatedAt?: Date;
  ownerValidated: boolean; // Post owner validation
  collaboratorValidated: boolean; // Collaborator validation
  notes: Array<{
    note: string;
    createdBy: ObjectId;
    createdAt: Date;
  }>;
}>;
```

---

## 📋 Data Model

### Collaboration Interface

```typescript
interface ICollaboration extends Document {
  // Reference to the post (Property or SearchAd)
  postId: ObjectId;
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

  // Commission proposal
  proposedCommission: number; // Percentage (e.g., 40 for 40%)
  proposalMessage?: string;

  // Alternative compensation (for SearchAd collaborations)
  compensationType?: "percentage" | "fixed_amount" | "gift_vouchers";
  compensationAmount?: number;

  // Contract signing
  ownerSigned: boolean;
  ownerSignedAt?: Date;
  collaboratorSigned: boolean;
  collaboratorSignedAt?: Date;
  contractText?: string;
  additionalTerms?: string;

  // Workflow tracking
  currentStep: "proposal" | "contract_signing" | "active" | "completed";
  currentProgressStep: ProgressStepId;
  progressSteps: ProgressStep[];

  // Activity log
  activities: Activity[];

  // Completion
  completedAt?: Date;
  completionReason?: CompletionReason;
  completedBy?: ObjectId;
  completedByRole?: "owner" | "collaborator";
}

type CompletionReason =
  | "vente_conclue_collaboration" // Sale completed via collaboration
  | "vente_conclue_seul" // Sale completed independently
  | "bien_retire" // Property withdrawn
  | "mandat_expire" // Mandate expired
  | "client_desiste" // Client withdrew
  | "vendu_tiers" // Sold by third party
  | "sans_suite"; // No follow-up
```

---

## 🔀 Workflow Scenarios

### Scenario 1: Agent → Apporteur's SearchAd

```
Apporteur creates SearchAd (buyer need)
        │
        ▼
Agent sees SearchAd, proposes collaboration
        │
        ▼
Agent offers: compensation (fixed/percentage/vouchers)
        │
        ▼
Apporteur accepts/rejects
        │
        ▼
Contract signing → Active → Progress tracking
```

### Scenario 2: Apporteur → Agent's Property

```
Agent lists Property
        │
        ▼
Apporteur has a buyer, proposes collaboration
        │
        ▼
Apporteur proposes: commission split (e.g., 40%)
        │
        ▼
Agent accepts/rejects
        │
        ▼
Contract signing → Active → Progress tracking
```

---

## 🔌 API Endpoints

### Propose Collaboration

```http
POST /api/collaboration
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Request:**

```json
{
  "postId": "property_id_or_searchad_id",
  "postType": "Property",
  "proposedCommission": 40,
  "proposalMessage": "Je souhaite collaborer sur cette annonce..."
}
```

**Response:**

```json
{
  "success": true,
  "collaboration": {
    "_id": "...",
    "status": "pending",
    "currentStep": "proposal",
    ...
  }
}
```

### Respond to Proposal

```http
POST /api/collaboration/:id/respond
```

**Request:**

```json
{
  "action": "accept", // or "reject"
  "message": "Je suis intéressé par cette collaboration"
}
```

### Sign Contract

```http
POST /api/collaboration/:id/sign
```

**Response:**

```json
{
  "success": true,
  "collaboration": {
    "ownerSigned": true,
    "ownerSignedAt": "2025-12-03T...",
    "status": "active" // When both sign
  }
}
```

### Update Progress Step

```http
POST /api/collaboration/:id/progress
```

**Request:**

```json
{
  "targetStep": "visite_programmee",
  "notes": "Visite prévue le 15/12/2025 à 14h"
}
```

### Complete Collaboration

```http
POST /api/collaboration/:id/complete
```

**Request:**

```json
{
  "completionReason": "vente_conclue_collaboration"
}
```

---

## 🎮 Controller Implementation

### Propose Collaboration

```typescript
// controllers/collaborationController.ts
export const proposeCollaboration = async (req: AuthRequest, res: Response) => {
  const {
    postId,
    postType,
    proposedCommission,
    proposalMessage,
    compensationType,
    compensationAmount,
  } = req.body;
  const collaboratorId = req.userId;

  // Verify post exists and get owner
  let post: any;
  let postOwnerId: string;

  if (postType === "Property") {
    post = await Property.findById(postId);
    postOwnerId = post.owner.toString();
  } else {
    post = await SearchAd.findById(postId);
    postOwnerId = post.authorId.toString();
  }

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  // Cannot collaborate on own post
  if (postOwnerId === collaboratorId) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot collaborate on own post" });
  }

  // Check for existing active collaboration
  const existing = await Collaboration.findOne({
    postId,
    collaboratorId,
    status: { $in: ["pending", "accepted", "active"] },
  });

  if (existing) {
    return res
      .status(400)
      .json({ success: false, message: "Active collaboration already exists" });
  }

  // Initialize progress steps
  const progressSteps = [
    "accord_collaboration",
    "premier_contact",
    "visite_programmee",
    "visite_realisee",
    "retour_client",
    "offre_en_cours",
    "negociation_en_cours",
    "compromis_signe",
    "signature_notaire",
    "affaire_conclue",
  ].map((id) => ({
    id,
    completed: false,
    ownerValidated: false,
    collaboratorValidated: false,
    notes: [],
  }));

  const collaboration = await Collaboration.create({
    postId,
    postType,
    postOwnerId,
    collaboratorId,
    proposedCommission,
    proposalMessage: sanitizeHtmlContent(proposalMessage),
    compensationType,
    compensationAmount,
    status: "pending",
    currentStep: "proposal",
    currentProgressStep: "accord_collaboration",
    progressSteps,
    activities: [
      {
        type: "proposal",
        message: `Proposition de collaboration envoyée`,
        createdBy: collaboratorId,
        createdAt: new Date(),
      },
    ],
  });

  // Send notification
  await sendNotification({
    userId: postOwnerId,
    type: "collaboration_proposal",
    title: "Nouvelle proposition de collaboration",
    message: `Nouvelle proposition sur votre annonce`,
    data: { collaborationId: collaboration._id },
  });

  res.status(201).json({ success: true, collaboration });
};
```

### Update Progress

```typescript
export const updateProgressStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { targetStep, notes } = req.body;
  const userId = req.userId;

  const collaboration = await Collaboration.findById(id);

  if (!collaboration) {
    return res
      .status(404)
      .json({ success: false, message: "Collaboration not found" });
  }

  // Verify user is part of collaboration
  const isOwner = collaboration.postOwnerId.toString() === userId;
  const isCollaborator = collaboration.collaboratorId.toString() === userId;

  if (!isOwner && !isCollaborator) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  // Find the target step
  const stepIndex = collaboration.progressSteps.findIndex(
    (s) => s.id === targetStep
  );
  if (stepIndex === -1) {
    return res.status(400).json({ success: false, message: "Invalid step" });
  }

  const step = collaboration.progressSteps[stepIndex];

  // Mark validation
  if (isOwner) {
    step.ownerValidated = true;
  } else {
    step.collaboratorValidated = true;
  }

  // Add notes if provided
  if (notes) {
    step.notes.push({
      note: sanitizeHtmlContent(notes),
      createdBy: userId,
      createdAt: new Date(),
    });
  }

  // Complete step if both validated
  if (step.ownerValidated && step.collaboratorValidated) {
    step.completed = true;
    step.validatedAt = new Date();
    collaboration.currentProgressStep = targetStep;
  }

  // Add activity
  collaboration.activities.push({
    type: "progress_step_update",
    message: `Étape "${targetStep}" validée`,
    createdBy: userId,
    createdAt: new Date(),
  });

  await collaboration.save();

  // Notify other party
  const otherPartyId = isOwner
    ? collaboration.collaboratorId
    : collaboration.postOwnerId;

  await sendNotification({
    userId: otherPartyId.toString(),
    type: "progress_update",
    title: "Mise à jour de collaboration",
    message: `Une étape a été validée`,
    data: { collaborationId: collaboration._id },
  });

  res.json({ success: true, collaboration });
};
```

---

## 📝 Contract Management

### Default Contract Template

```typescript
const generateContractText = (
  collaboration: ICollaboration,
  post: any,
  owner: any,
  collaborator: any
) => {
  return `
ACCORD DE COLLABORATION IMMOBILIÈRE

Entre les soussignés :

${owner.firstName} ${owner.lastName}
Ci-après dénommé "le Propriétaire de l'annonce"

et

${collaborator.firstName} ${collaborator.lastName}
Ci-après dénommé "le Collaborateur"

ARTICLE 1 - OBJET
Le présent accord porte sur la collaboration concernant le bien immobilier suivant :
${post.title}
Situé à : ${post.city}, ${post.postalCode}

ARTICLE 2 - COMMISSION
En cas de réalisation de la vente par l'intermédiaire du Collaborateur,
celui-ci percevra une commission de ${
    collaboration.proposedCommission
  }% sur les honoraires d'agence.

ARTICLE 3 - DURÉE
Le présent accord est valable jusqu'à la vente du bien ou sa retrait du marché.

ARTICLE 4 - CONFIDENTIALITÉ
Les parties s'engagent à respecter la confidentialité des informations échangées.

Fait en deux exemplaires, le ${new Date().toLocaleDateString("fr-FR")}
  `.trim();
};
```

### Contract Signing

```typescript
export const signCollaboration = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  const collaboration = await Collaboration.findById(id);

  const isOwner = collaboration.postOwnerId.toString() === userId;
  const isCollaborator = collaboration.collaboratorId.toString() === userId;

  if (isOwner && !collaboration.ownerSigned) {
    collaboration.ownerSigned = true;
    collaboration.ownerSignedAt = new Date();
  } else if (isCollaborator && !collaboration.collaboratorSigned) {
    collaboration.collaboratorSigned = true;
    collaboration.collaboratorSignedAt = new Date();
  }

  // If both signed, activate collaboration
  if (collaboration.ownerSigned && collaboration.collaboratorSigned) {
    collaboration.status = "active";
    collaboration.currentStep = "active";

    // Mark first step as completed
    collaboration.progressSteps[0].completed = true;
    collaboration.progressSteps[0].validatedAt = new Date();
    collaboration.progressSteps[0].ownerValidated = true;
    collaboration.progressSteps[0].collaboratorValidated = true;
  }

  collaboration.activities.push({
    type: "signing",
    message: `Contrat signé`,
    createdBy: userId,
    createdAt: new Date(),
  });

  await collaboration.save();

  res.json({ success: true, collaboration });
};
```

---

## 🖥 Frontend Components

### Collaboration List

```typescript
// components/collaboration/CollaborationList.tsx
const CollaborationList = () => {
  const { data, loading } = useFetch(() => CollaborationService.getMine());

  const groupedCollaborations = useMemo(() => {
    return {
      pending: data?.filter((c) => c.status === "pending"),
      active: data?.filter((c) => c.status === "active"),
      completed: data?.filter((c) => c.status === "completed"),
    };
  }, [data]);

  return (
    <div>
      <Tabs>
        <TabPanel title="En cours" count={groupedCollaborations.active?.length}>
          {groupedCollaborations.active?.map((c) => (
            <CollaborationCard key={c._id} collaboration={c} />
          ))}
        </TabPanel>
        <TabPanel
          title="En attente"
          count={groupedCollaborations.pending?.length}
        >
          {groupedCollaborations.pending?.map((c) => (
            <CollaborationCard key={c._id} collaboration={c} />
          ))}
        </TabPanel>
        <TabPanel
          title="Terminées"
          count={groupedCollaborations.completed?.length}
        >
          {groupedCollaborations.completed?.map((c) => (
            <CollaborationCard key={c._id} collaboration={c} />
          ))}
        </TabPanel>
      </Tabs>
    </div>
  );
};
```

### Progress Tracker

```typescript
// components/collaboration/ProgressTracker.tsx
const ProgressTracker = ({
  collaboration,
}: {
  collaboration: Collaboration;
}) => {
  const { mutate, loading } = useMutation((step: string) =>
    CollaborationService.updateProgress(collaboration._id, step)
  );

  return (
    <div className="space-y-4">
      {collaboration.progressSteps.map((step, index) => (
        <ProgressStep
          key={step.id}
          step={step}
          isActive={collaboration.currentProgressStep === step.id}
          canValidate={!step.completed && index <= currentStepIndex + 1}
          onValidate={() => mutate(step.id)}
          loading={loading}
        />
      ))}
    </div>
  );
};

const ProgressStep = ({ step, isActive, canValidate, onValidate }) => (
  <div className={`flex items-center gap-4 ${isActive ? "bg-blue-50" : ""}`}>
    <div
      className={`
      w-8 h-8 rounded-full flex items-center justify-center
      ${step.completed ? "bg-green-500 text-white" : "bg-gray-200"}
    `}
    >
      {step.completed ? "✓" : index + 1}
    </div>

    <div className="flex-1">
      <p className="font-medium">{STEP_LABELS[step.id]}</p>
      <div className="flex gap-2 text-sm text-gray-500">
        {step.ownerValidated && <span>✓ Propriétaire</span>}
        {step.collaboratorValidated && <span>✓ Collaborateur</span>}
      </div>
    </div>

    {canValidate && (
      <button onClick={onValidate} className="btn-primary">
        Valider
      </button>
    )}
  </div>
);
```

---

## 🔔 Notifications

### Collaboration Events

| Event                   | Recipient    | Message                                 |
| ----------------------- | ------------ | --------------------------------------- |
| New proposal            | Post owner   | "Nouvelle proposition de collaboration" |
| Proposal accepted       | Collaborator | "Votre proposition a été acceptée"      |
| Proposal rejected       | Collaborator | "Votre proposition a été refusée"       |
| Contract signed         | Other party  | "Le contrat a été signé"                |
| Step validated          | Other party  | "Une étape a été validée"               |
| Collaboration completed | Both parties | "La collaboration est terminée"         |

---

## 👨‍💼 Admin Features

### Admin Close Collaboration

```typescript
// Admin can force-close problematic collaborations
router.post("/:id/admin/close", requireAdmin, adminCloseCollaboration);

export const adminCloseCollaboration = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;
  const { action, completionReason } = req.body;

  const collaboration = await Collaboration.findById(id);

  if (action === "cancel") {
    collaboration.status = "cancelled";
  } else if (action === "complete") {
    collaboration.status = "completed";
    collaboration.completionReason = completionReason;
    collaboration.completedAt = new Date();
  }

  collaboration.activities.push({
    type: "status_update",
    message: `Collaboration ${action} par l'admin`,
    createdBy: req.userId,
    createdAt: new Date(),
  });

  await collaboration.save();

  res.json({ success: true, collaboration });
};
```

---

_Next: [Deployment Guide →](../deployment/overview.md)_

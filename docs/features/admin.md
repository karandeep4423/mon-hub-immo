# Admin Dashboard

> Platform administration, user management, and moderation features

---

## 📋 Overview

The admin dashboard provides platform administrators with tools to:

- Manage user accounts (validation, blocking)
- Moderate content (properties, search ads)
- View platform statistics
- Monitor collaborations
- Handle support issues

---

## 👥 User Management

### User Validation Flow

New agents require admin validation before full access:

```
Sign Up → Email Verified → Profile Complete → Admin Review → Validated
```

### Admin Actions

| Action           | Description           | Effect                        |
| ---------------- | --------------------- | ----------------------------- |
| **Validate**     | Approve user account  | `isValidated = true`          |
| **Block**        | Suspend user access   | `isBlocked = true`            |
| **Unblock**      | Restore user access   | `isBlocked = false`           |
| **Grant Access** | Give temporary access | `accessGrantedByAdmin = true` |
| **Delete**       | Permanently remove    | Account deleted               |

### API Endpoints

```typescript
// GET /api/admin/users - List all users
// GET /api/admin/users/:id - Get user details
// PUT /api/admin/users/:id/validate - Validate user
// PUT /api/admin/users/:id/block - Block user
// PUT /api/admin/users/:id/unblock - Unblock user
// DELETE /api/admin/users/:id - Delete user

// Example: Validate user
// PUT /api/admin/users/user_123/validate
{
  "success": true,
  "message": "User validated successfully",
  "user": {
    "_id": "user_123",
    "isValidated": true,
    "validatedAt": "2025-12-03T10:00:00Z",
    "validatedBy": "admin_456"
  }
}
```

---

## 📊 Dashboard Statistics

### Overview Stats

```typescript
// GET /api/admin/stats
{
  "users": {
    "total": 1250,
    "agents": 850,
    "apporteurs": 400,
    "pending": 25,
    "blocked": 5,
    "newThisMonth": 45
  },
  "properties": {
    "total": 3500,
    "active": 2800,
    "sold": 500,
    "pending": 200,
    "newThisMonth": 120
  },
  "searchAds": {
    "total": 800,
    "active": 600,
    "fulfilled": 150,
    "newThisMonth": 50
  },
  "collaborations": {
    "total": 450,
    "active": 200,
    "completed": 180,
    "pending": 70,
    "newThisMonth": 35
  },
  "revenue": {
    "total": 25000,
    "thisMonth": 3500,
    "subscriptions": {
      "monthly": 150,
      "annual": 80
    }
  }
}
```

### Charts & Analytics

The dashboard includes:

- User registration trends (line chart)
- Property listings by type (pie chart)
- Collaboration success rate (bar chart)
- Revenue over time (area chart)
- Geographic distribution (map)

---

## 🏠 Property Moderation

### Property Review Queue

Admins can review and moderate properties:

```typescript
// GET /api/admin/properties?status=pending
// PUT /api/admin/properties/:id/approve
// PUT /api/admin/properties/:id/reject
// DELETE /api/admin/properties/:id

// Rejection with reason
// PUT /api/admin/properties/:id/reject
{
  "reason": "Images de mauvaise qualité",
  "notifyOwner": true
}
```

### Moderation Actions

| Action  | When to Use                    |
| ------- | ------------------------------ |
| Approve | Property meets guidelines      |
| Reject  | Violates terms, incorrect info |
| Flag    | Needs review, suspicious       |
| Remove  | Inappropriate content          |

---

## 🔍 Search Ad Moderation

Similar moderation for search ads:

```typescript
// GET /api/admin/search-ads?status=all
// PUT /api/admin/search-ads/:id/approve
// PUT /api/admin/search-ads/:id/reject
// DELETE /api/admin/search-ads/:id
```

---

## 🤝 Collaboration Monitoring

### View All Collaborations

```typescript
// GET /api/admin/collaborations
{
  "collaborations": [
    {
      "_id": "collab_123",
      "postType": "Property",
      "status": "active",
      "owner": { "firstName": "Jean", "lastName": "Agent" },
      "collaborator": { "firstName": "Marie", "lastName": "Apporteur" },
      "currentStep": "visite_programmee",
      "createdAt": "2025-11-15T10:00:00Z"
    }
  ],
  "stats": {
    "total": 450,
    "byStatus": {
      "pending": 70,
      "active": 200,
      "completed": 180
    }
  }
}
```

### Admin Intervention

Admins can intervene in disputes:

```typescript
// PUT /api/admin/collaborations/:id/resolve
{
  "action": "cancel",
  "reason": "Dispute resolution - mutual agreement",
  "notifyParties": true
}
```

---

## 💬 Chat Moderation

### View Chat Reports

```typescript
// GET /api/admin/chat/reports
{
  "reports": [
    {
      "_id": "report_123",
      "reportedBy": "user_456",
      "reportedUser": "user_789",
      "reason": "harassment",
      "messageId": "msg_101",
      "status": "pending",
      "createdAt": "2025-12-03T09:00:00Z"
    }
  ]
}

// PUT /api/admin/chat/reports/:id/resolve
{
  "action": "warn_user", // warn_user, block_user, dismiss
  "notes": "First warning issued"
}
```

---

## 📧 Communication Tools

### Broadcast Messages

Send announcements to users:

```typescript
// POST /api/admin/broadcast
{
  "title": "Mise à jour importante",
  "message": "Nouvelle fonctionnalité disponible...",
  "recipients": "all", // all, agents, apporteurs
  "channels": ["notification", "email"]
}
```

### Direct Contact

Contact specific users:

```typescript
// POST /api/admin/contact-user
{
  "userId": "user_123",
  "subject": "Vérification de documents",
  "message": "Nous avons besoin de...",
  "channel": "email"
}
```

---

## 🎨 Frontend Components

### AdminLayout

```typescript
// components/admin/AdminLayout.tsx
const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <AdminHeader />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};
```

### AdminSidebar

```typescript
// Navigation items
const menuItems = [
  { icon: <DashboardIcon />, label: "Tableau de bord", href: "/admin" },
  { icon: <UsersIcon />, label: "Utilisateurs", href: "/admin/users" },
  { icon: <HomeIcon />, label: "Biens", href: "/admin/properties" },
  { icon: <SearchIcon />, label: "Annonces", href: "/admin/search-ads" },
  {
    icon: <HandshakeIcon />,
    label: "Collaborations",
    href: "/admin/collaborations",
  },
  { icon: <ChatIcon />, label: "Messages", href: "/admin/chat" },
  { icon: <ChartIcon />, label: "Statistiques", href: "/admin/stats" },
  { icon: <SettingsIcon />, label: "Paramètres", href: "/admin/settings" },
];
```

### UserManagementTable

```typescript
// components/admin/UserManagementTable.tsx
const UserManagementTable = () => {
  const { data: users, refetch } = useFetch(() => api.get("/admin/users"));

  const handleValidate = async (userId: string) => {
    await api.put(`/admin/users/${userId}/validate`);
    toast.success("Utilisateur validé");
    refetch();
  };

  const handleBlock = async (userId: string) => {
    if (confirm("Bloquer cet utilisateur ?")) {
      await api.put(`/admin/users/${userId}/block`);
      toast.success("Utilisateur bloqué");
      refetch();
    }
  };

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Type</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users?.map((user) => (
          <UserRow
            key={user._id}
            user={user}
            onValidate={handleValidate}
            onBlock={handleBlock}
          />
        ))}
      </tbody>
    </table>
  );
};
```

---

## 🔐 Security

### Admin Authentication

Admins must pass additional checks:

```typescript
// middleware/authorize.ts
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.userType !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }
  next();
};

// Usage
router.use("/admin", authenticateToken, requireAdmin);
```

### Audit Logging

All admin actions are logged:

```typescript
// models/AuditLog.ts
interface IAuditLog {
  adminId: ObjectId;
  action: string;
  targetType: "user" | "property" | "searchAd" | "collaboration";
  targetId: ObjectId;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

// Usage in controller
await AuditLog.create({
  adminId: req.user.userId,
  action: "user_validated",
  targetType: "user",
  targetId: userId,
  details: { reason: "Documents verified" },
  ip: req.ip,
  userAgent: req.get("user-agent"),
});
```

---

## 📚 Related Documentation

- [Authentication System](./authentication.md) - User authentication
- [Security Guide](../security/overview.md) - Security measures
- [API Overview](../api/overview.md) - API documentation

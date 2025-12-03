# Appointments System

> Scheduling, managing, and tracking property visits and meetings

---

## 📋 Overview

The appointments system allows agents and apporteurs to schedule property visits, meetings, and follow-ups. It supports both registered users and guest bookings.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APPOINTMENT FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SCHEDULING                                                                │
│   ┌───────────────┐                                                        │
│   │ Request       │                                                        │
│   │ Appointment   │ ──► Agent/Apporteur                                    │
│   │ (User/Guest)  │     receives notification                              │
│   └───────┬───────┘                                                        │
│           │                                                                 │
│           ▼                                                                 │
│   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐         │
│   │   Pending     │ ──►  │  Confirmed    │ ──►  │  Completed    │         │
│   │               │      │               │      │               │         │
│   └───────┬───────┘      └───────────────┘      └───────────────┘         │
│           │                      │                                         │
│           ▼                      ▼                                         │
│   ┌───────────────┐      ┌───────────────┐                                │
│   │   Declined    │      │   Cancelled   │                                │
│   │               │      │               │                                │
│   └───────────────┘      └───────────────┘                                │
│                                                                             │
│   REMINDERS                                                                 │
│   • 24h before: Email notification                                         │
│   • 1h before: In-app notification                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄 Data Model

### Appointment Schema

```typescript
interface IAppointment extends Document {
  // Participants
  organizer: mongoose.Types.ObjectId; // User who created
  attendee?: mongoose.Types.ObjectId; // Other user (if registered)

  // Guest Info (for non-registered attendees)
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };

  // Related Entities
  property?: mongoose.Types.ObjectId; // Property for visit
  collaboration?: mongoose.Types.ObjectId; // Related collaboration

  // Appointment Details
  title: string;
  description?: string;
  type: "property_visit" | "meeting" | "call" | "other";

  // Scheduling
  scheduledAt: Date;
  duration: number; // Minutes (30, 60, 90, 120)
  location?: string; // Address or "Video call"

  // Video Call
  videoCallUrl?: string; // Google Meet, Zoom link

  // Status
  status: "pending" | "confirmed" | "declined" | "cancelled" | "completed";

  // Notes
  notes?: string; // Private notes for organizer
  attendeeNotes?: string; // Notes from attendee

  // Reminders
  reminderSent24h: boolean;
  reminderSent1h: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Appointment Types

| Type             | Description                |
| ---------------- | -------------------------- |
| `property_visit` | In-person property viewing |
| `meeting`        | Business meeting           |
| `call`           | Phone or video call        |
| `other`          | Custom appointment         |

### Status Transitions

```
pending ──► confirmed ──► completed
   │             │
   ▼             ▼
declined     cancelled
```

---

## 🔌 API Endpoints

### Appointment CRUD

| Method   | Endpoint                | Description              | Auth        |
| -------- | ----------------------- | ------------------------ | ----------- |
| `GET`    | `/api/appointments`     | List user's appointments | User        |
| `GET`    | `/api/appointments/:id` | Get appointment details  | Participant |
| `POST`   | `/api/appointments`     | Create appointment       | User        |
| `PUT`    | `/api/appointments/:id` | Update appointment       | Organizer   |
| `DELETE` | `/api/appointments/:id` | Delete appointment       | Organizer   |

### Status Actions

| Method | Endpoint                         | Description         | Auth        |
| ------ | -------------------------------- | ------------------- | ----------- |
| `PUT`  | `/api/appointments/:id/confirm`  | Confirm appointment | Attendee    |
| `PUT`  | `/api/appointments/:id/decline`  | Decline appointment | Attendee    |
| `PUT`  | `/api/appointments/:id/cancel`   | Cancel appointment  | Participant |
| `PUT`  | `/api/appointments/:id/complete` | Mark completed      | Organizer   |

### Guest Booking

| Method | Endpoint                         | Description            | Auth   |
| ------ | -------------------------------- | ---------------------- | ------ |
| `POST` | `/api/appointments/guest`        | Book as guest          | Public |
| `GET`  | `/api/appointments/guest/:token` | View guest appointment | Token  |

---

## 📝 Creating Appointments

### Standard Appointment

```typescript
// POST /api/appointments
{
  "title": "Visite appartement T3 Paris 15e",
  "type": "property_visit",
  "propertyId": "property_123",
  "attendeeId": "user_456",
  "scheduledAt": "2025-01-15T14:00:00Z",
  "duration": 60,
  "location": "15 Rue de la Convention, 75015 Paris",
  "notes": "Apporter documents d'identité"
}
```

### With Collaboration

```typescript
{
  "title": "Point sur collaboration Dupont",
  "type": "meeting",
  "collaborationId": "collab_789",
  "attendeeId": "user_456",
  "scheduledAt": "2025-01-16T10:00:00Z",
  "duration": 30,
  "videoCallUrl": "https://meet.google.com/xxx-yyyy-zzz"
}
```

### Guest Booking (Public)

```typescript
// POST /api/appointments/guest
{
  "title": "Visite du bien",
  "propertyId": "property_123",
  "guestInfo": {
    "firstName": "Pierre",
    "lastName": "Martin",
    "email": "pierre.martin@email.com",
    "phone": "+33612345678"
  },
  "scheduledAt": "2025-01-17T15:00:00Z",
  "duration": 45
}
```

---

## 📅 Availability Management

### Get User Availability

```typescript
// GET /api/appointments/availability?userId=xxx&date=2025-01-15

// Response
{
  "date": "2025-01-15",
  "workingHours": {
    "start": "09:00",
    "end": "18:00"
  },
  "bookedSlots": [
    { "start": "10:00", "end": "11:00" },
    { "start": "14:00", "end": "15:00" }
  ],
  "availableSlots": [
    { "start": "09:00", "end": "10:00" },
    { "start": "11:00", "end": "14:00" },
    { "start": "15:00", "end": "18:00" }
  ]
}
```

### Check Slot Availability

```typescript
// POST /api/appointments/check-availability
{
  "organizerId": "user_123",
  "scheduledAt": "2025-01-15T14:00:00Z",
  "duration": 60
}

// Response
{
  "available": false,
  "conflict": {
    "appointmentId": "apt_456",
    "title": "Autre visite",
    "time": "14:00 - 15:00"
  },
  "nextAvailable": "2025-01-15T15:00:00Z"
}
```

---

## 🔔 Notifications

### Appointment Created

```typescript
// Notification to attendee
{
  "type": "appointment_request",
  "title": "Nouvelle demande de rendez-vous",
  "message": "Jean Dupont vous propose un RDV le 15/01 à 14h00",
  "appointmentId": "apt_123",
  "actions": ["confirm", "decline"]
}
```

### Status Change Notifications

```typescript
// Confirmed
{
  "type": "appointment_confirmed",
  "title": "Rendez-vous confirmé",
  "message": "Votre RDV du 15/01 à 14h00 a été confirmé"
}

// Cancelled
{
  "type": "appointment_cancelled",
  "title": "Rendez-vous annulé",
  "message": "Le RDV du 15/01 à 14h00 a été annulé"
}
```

### Reminders

```typescript
// 24h before
{
  "type": "appointment_reminder",
  "title": "Rappel: RDV demain",
  "message": "N'oubliez pas votre visite demain à 14h00"
}

// 1h before
{
  "type": "appointment_soon",
  "title": "RDV dans 1 heure",
  "message": "Votre visite commence à 14h00"
}
```

---

## 🎣 Client Hooks

### useAppointments

```typescript
// hooks/useAppointments.ts
export const useAppointments = (filters?: AppointmentFilters) => {
  const { data, error, isLoading, mutate } = useSWR(
    [SWR_KEYS.APPOINTMENTS, filters],
    () => appointmentService.getAll(filters)
  );

  return {
    appointments: data?.appointments || [],
    loading: isLoading,
    error,
    refresh: mutate,
  };
};
```

### useAppointmentActions

```typescript
// hooks/useAppointmentActions.ts
export const useAppointmentActions = (appointmentId: string) => {
  const { refresh } = useAppointments();

  const confirm = useMutation(() => appointmentService.confirm(appointmentId), {
    successMessage: "Rendez-vous confirmé",
    onSuccess: refresh,
  });

  const decline = useMutation(() => appointmentService.decline(appointmentId), {
    successMessage: "Rendez-vous décliné",
    onSuccess: refresh,
  });

  const cancel = useMutation(() => appointmentService.cancel(appointmentId), {
    successMessage: "Rendez-vous annulé",
    onSuccess: refresh,
  });

  return { confirm, decline, cancel };
};
```

### useAppointmentNotifications

```typescript
// hooks/useAppointmentNotifications.ts
export const useAppointmentNotifications = () => {
  const { socket } = useSocket();
  const { refresh } = useAppointments();

  useEffect(() => {
    if (!socket) return;

    socket.on("appointment:new", () => {
      toast.info("Nouvelle demande de rendez-vous");
      refresh();
    });

    socket.on("appointment:status", ({ appointmentId, status }) => {
      toast.info(`Rendez-vous ${getStatusLabel(status)}`);
      refresh();
    });

    return () => {
      socket.off("appointment:new");
      socket.off("appointment:status");
    };
  }, [socket, refresh]);
};
```

---

## 🧩 Components

### AppointmentCard

```tsx
// components/appointments/AppointmentCard.tsx
const AppointmentCard = ({ appointment, isOrganizer }) => {
  const { confirm, decline, cancel } = useAppointmentActions(appointment._id);

  return (
    <div className="appointment-card">
      <div className="header">
        <AppointmentTypeIcon type={appointment.type} />
        <h3>{appointment.title}</h3>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="details">
        <DateTime date={appointment.scheduledAt} />
        <Duration minutes={appointment.duration} />
        {appointment.location && <Location address={appointment.location} />}
      </div>

      <div className="participant">
        {isOrganizer ? (
          <AttendeeInfo
            user={appointment.attendee}
            guest={appointment.guestInfo}
          />
        ) : (
          <OrganizerInfo user={appointment.organizer} />
        )}
      </div>

      {appointment.status === "pending" && !isOrganizer && (
        <div className="actions">
          <Button onClick={confirm.mutate} loading={confirm.loading}>
            Confirmer
          </Button>
          <Button variant="outline" onClick={decline.mutate}>
            Décliner
          </Button>
        </div>
      )}

      {appointment.status === "confirmed" && (
        <Button variant="danger" onClick={cancel.mutate}>
          Annuler
        </Button>
      )}
    </div>
  );
};
```

### AppointmentCalendar

```tsx
// components/appointments/AppointmentCalendar.tsx
const AppointmentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { appointments } = useAppointments({
    startDate: startOfMonth(selectedDate),
    endDate: endOfMonth(selectedDate),
  });

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce((acc, apt) => {
      const dateKey = format(apt.scheduledAt, "yyyy-MM-dd");
      acc[dateKey] = [...(acc[dateKey] || []), apt];
      return acc;
    }, {} as Record<string, Appointment[]>);
  }, [appointments]);

  return (
    <div className="appointment-calendar">
      <CalendarHeader date={selectedDate} onNavigate={setSelectedDate} />

      <CalendarGrid>
        {daysOfMonth.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            appointments={appointmentsByDate[format(day, "yyyy-MM-dd")]}
            isSelected={isSameDay(day, selectedDate)}
            onClick={() => setSelectedDate(day)}
          />
        ))}
      </CalendarGrid>

      <DayAgenda
        date={selectedDate}
        appointments={appointmentsByDate[format(selectedDate, "yyyy-MM-dd")]}
      />
    </div>
  );
};
```

### AppointmentForm

```tsx
// components/appointments/AppointmentForm.tsx
const AppointmentForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    type: "meeting",
    duration: 60,
  });

  const { mutate: create, loading } = useMutation(
    () => appointmentService.create(formData),
    {
      successMessage: "Rendez-vous créé",
      onSuccess,
    }
  );

  return (
    <form onSubmit={create}>
      <Input label="Titre" required />

      <AppointmentTypeSelector
        value={formData.type}
        onChange={(type) => setFormData({ ...formData, type })}
      />

      <DateTimePicker
        label="Date et heure"
        value={formData.scheduledAt}
        onChange={(scheduledAt) => setFormData({ ...formData, scheduledAt })}
        minDate={new Date()}
      />

      <DurationSelector value={formData.duration} options={[30, 60, 90, 120]} />

      <UserSelector label="Participant" value={formData.attendeeId} />

      <PropertySelector
        label="Bien concerné (optionnel)"
        value={formData.propertyId}
      />

      <Input label="Lieu" placeholder="Adresse ou lien visio" />

      <Textarea label="Notes" placeholder="Notes privées" />

      <SubmitButton loading={loading}>Créer le rendez-vous</SubmitButton>
    </form>
  );
};
```

### TimeSlotPicker

```tsx
// components/appointments/TimeSlotPicker.tsx
const TimeSlotPicker = ({ userId, date, onSelect }) => {
  const { data: availability, loading } = useFetch(() =>
    appointmentService.getAvailability(userId, date)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="time-slots">
      {availability.availableSlots.map((slot) => (
        <button
          key={slot.start}
          className="time-slot"
          onClick={() => onSelect(slot.start)}
        >
          {slot.start}
        </button>
      ))}
    </div>
  );
};
```

---

## 📧 Email Notifications

### Confirmation Email

```typescript
// services/emailService.ts
const sendAppointmentConfirmation = async (appointment: IAppointment) => {
  const attendeeEmail =
    appointment.guestInfo?.email || appointment.attendee?.email;

  await sendEmail({
    to: attendeeEmail,
    subject: "Rendez-vous confirmé - MonHubImmo",
    template: "appointment-confirmed",
    data: {
      title: appointment.title,
      date: format(appointment.scheduledAt, "dd MMMM yyyy", { locale: fr }),
      time: format(appointment.scheduledAt, "HH:mm"),
      location: appointment.location,
      organizerName: `${appointment.organizer.firstName} ${appointment.organizer.lastName}`,
    },
  });
};
```

### Reminder Email

```typescript
const sendAppointmentReminder = async (appointment: IAppointment) => {
  await sendEmail({
    to: getAttendeeEmail(appointment),
    subject: "Rappel: Votre rendez-vous demain",
    template: "appointment-reminder",
    data: {
      title: appointment.title,
      date: format(appointment.scheduledAt, "dd MMMM yyyy à HH:mm", {
        locale: fr,
      }),
      location: appointment.location,
    },
  });

  // Mark reminder as sent
  await Appointment.findByIdAndUpdate(appointment._id, {
    reminderSent24h: true,
  });
};
```

---

## ⏰ Scheduled Jobs

### Reminder Cron Job

```typescript
// jobs/appointmentReminders.ts
import cron from "node-cron";

// Run every hour
cron.schedule("0 * * * *", async () => {
  const now = new Date();
  const in24h = addHours(now, 24);
  const in25h = addHours(now, 25);

  // Find appointments needing 24h reminder
  const appointments24h = await Appointment.find({
    status: "confirmed",
    reminderSent24h: false,
    scheduledAt: { $gte: in24h, $lt: in25h },
  }).populate("organizer attendee");

  for (const apt of appointments24h) {
    await sendAppointmentReminder(apt);
  }

  // Similar for 1h reminders
});
```

---

_Next: [Payments →](./payments.md)_

# VAGIN Notification System - Trigger Guide

This document explains how to use the notification trigger system throughout the VAGIN admin dashboard.

## Architecture Overview

The notification system consists of two layers:

### 1. **Database Triggers** (Automatic)
Fire automatically when certain events occur in the database:
- New school registration
- Pad distribution completion
- Payment received

### 2. **Application Triggers** (Manual/Conditional)
Called from React components when business logic determines a notification should be sent:
- Low inventory alerts
- Payment reminders
- Cycle completion
- System alerts

---

## Quick Start

### In a React Component:

```typescript
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";

function MyComponent() {
  const { onLowInventory, onPaymentDue, onCycleComplete } = useNotificationTriggers();

  // Trigger low inventory alert
  const handleLowStock = async () => {
    await onLowInventory("school-uuid-here", 45, 50); // 45 pads, threshold 50
  };

  // Trigger payment reminder
  const handlePaymentDue = async () => {
    await onPaymentDue("school-uuid-here", 45000, 5); // ₦45k, 5 days overdue
  };

  // Trigger cycle completion
  const handleCycleComplete = async () => {
    await onCycleComplete(
      "school-uuid-here",
      42, // girls participated
      "2026-06-01",
      "2026-08-31"
    );
  };

  return (
    <div>
      <button onClick={handleLowStock}>Test Low Inventory</button>
      <button onClick={handlePaymentDue}>Test Payment Reminder</button>
      <button onClick={handleCycleComplete}>Test Cycle Completion</button>
    </div>
  );
}
```

---

## Notification Triggers Reference

### 1. Low Inventory Alert

**When to trigger:**
- Pad count falls below 50 (configurable)
- Inventory drops below minimum threshold

**Code:**
```typescript
import { NotificationService } from "@/services/notificationService";

await NotificationService.triggerLowInventoryAlert(
  schoolId,
  padCount,      // e.g., 45
  threshold      // e.g., 50 (optional, defaults to 50)
);
```

**Creates:**
- Dashboard alert for admin
- WhatsApp message to matron

**Example messages:**
- Admin: "🚨 Inventory Alert: Low Pad Stock at Lagos School. Only 45 pads remaining."
- Matron: "📦 Low Stock Warning: Your school has low inventory (45 units). Suggested reorder: 455 units."

---

### 2. Payment Reminder

**When to trigger:**
- Payment is due (e.g., end of month approaching)
- Payment is overdue (e.g., 5+ days late)
- Regular payment follow-ups

**Code:**
```typescript
await NotificationService.triggerPaymentReminder(
  schoolId,
  outstandingAmount,  // e.g., 45000 (in Naira)
  daysOverdue         // e.g., 5 (optional, omit if not overdue)
);
```

**Creates:**
- Email reminder to matron
- Dashboard alert for admin

**Example messages:**
- Matron: "💰 Payment Reminder: Outstanding Balance of ₦45,000 for your school. 5 days overdue."
- Admin: "💳 Payment Alert: School has outstanding payment of ₦45,000. Please follow up."

---

### 3. Cycle Completion

**When to trigger:**
- 3-month pad cycle is completed
- All metrics for the cycle have been recorded

**Code:**
```typescript
await NotificationService.triggerCycleCompletion(
  schoolId,
  girlsParticipated,  // e.g., 42
  startDate,          // e.g., "2026-06-01"
  endDate             // e.g., "2026-08-31"
);
```

**Creates:**
- Dashboard celebration notification for admin
- WhatsApp message to matron

**Example messages:**
- Admin: "✅ Cycle Completed: Umuahia School. Congratulations! 42 girls participated."
- Matron: "🎉 Cycle Complete: Your school's 3-month cycle is complete! 42 girls participated. Great work!"

---

### 4. Payment Received

**When to trigger:**
- Payment is successfully processed
- Payment status changes to "confirmed" or "completed"

**Code:**
```typescript
await NotificationService.triggerPaymentReceived(
  schoolId,
  amount,          // e.g., 22500 (in Naira)
  paymentMethod    // e.g., "Bank Transfer", "Mobile Money"
);
```

**Creates:**
- Dashboard confirmation for admin
- WhatsApp confirmation for matron

**Example messages:**
- Admin: "💳 Payment Processed: ₦22,500 from Lagos School received. Thank you!"
- Matron: "✅ Payment Confirmed: We received your payment of ₦22,500. Your account updated."

---

### 5. Distribution Completed

**When to trigger:**
- Pad distribution is logged in the system
- Automatically triggered by database trigger on `vagin_pad_distributions` insert

**Database Trigger:** Auto-fires
**Manual Trigger (if needed):**
```typescript
await NotificationService.triggerDistributionComplete(
  schoolId,
  girlsCount,       // e.g., 42
  padsDistributed   // e.g., 126 (3 per girl)
);
```

**Creates:**
- Dashboard log for admin
- WhatsApp update to matron

**Example messages:**
- Admin: "📦 Distribution Completed at Abuja School. 126 pads distributed to 42 girls."
- Matron: "🎁 Pads Distributed: 126 pads distributed at your school. Distribute to 42 girls."

---

### 6. System Alert

**When to trigger:**
- Critical system errors
- Data sync failures
- Integration issues

**Code:**
```typescript
await NotificationService.triggerSystemAlert(
  title,           // e.g., "Data Sync Failed"
  message,         // e.g., "Failed to sync data from Ibadan school..."
  severity         // "low" | "medium" | "high" (optional, default: "medium")
);
```

**Creates:**
- Dashboard alert for admin only
- Severity indicator in metadata

**Example messages:**
- Admin: "⚠️ System Alert: Data Sync Failed. Failed to sync data from Ibadan school. Please check internet connection."

---

### 7. New School Registration

**When to trigger:**
- Automatically triggered by database trigger when new school is added
- No manual trigger needed

**Database Trigger:** Auto-fires
**Creates:**
- Dashboard alert for admin

**Example message:**
- Admin: "🆕 New School Registered: Lagos Academy (Nigeria). Review and assign matron."

---

## Integration Points

### Where to Add Triggers in Your Code

#### School Management
```typescript
// In school creation/update logic
const { onLowInventory } = useNotificationTriggers();

// When updating inventory
if (newPadCount < threshold) {
  await onLowInventory(schoolId, newPadCount);
}
```

#### Payment Management
```typescript
// In payment processing logic
const { onPaymentDue, onPaymentReceived } = useNotificationTriggers();

// When payment is processed
if (payment.status === "completed") {
  await onPaymentReceived(schoolId, amount, paymentMethod);
}

// When checking overdue payments
if (daysOverdue > 0) {
  await onPaymentDue(schoolId, outstandingAmount, daysOverdue);
}
```

#### Distribution Tracking
```typescript
// When a distribution is logged
// Database trigger auto-fires, but you can also call:
const { onDistributionComplete } = useNotificationTriggers();
await onDistributionComplete(schoolId, girlsCount, padsCount);
```

#### Cycle Management
```typescript
// When cycle is marked complete
const { onCycleComplete } = useNotificationTriggers();
await onCycleComplete(schoolId, 42, "2026-06-01", "2026-08-31");
```

#### Error Handling
```typescript
// When critical errors occur
const { onSystemAlert } = useNotificationTriggers();

try {
  // risky operation
} catch (error) {
  await onSystemAlert(
    "Sync Error",
    "Failed to sync data: " + error.message,
    "high"
  );
}
```

---

## Database Triggers (Already Active)

These trigger automatically when data is inserted/updated:

### Trigger 1: New School Registration
**Table:** `vagin_schools`
**Event:** INSERT
**Action:** Creates dashboard alert for admin

### Trigger 2: Distribution Completed
**Table:** `vagin_pad_distributions`
**Event:** INSERT
**Action:** Creates notifications for admin (dashboard) + matron (WhatsApp)

### Trigger 3: Payment Received
**Table:** `vagin_payments`
**Event:** INSERT or UPDATE (when status → "completed"/"confirmed")
**Action:** Creates notifications for admin (dashboard) + matron (WhatsApp)

---

## Notification Status Flow

All notifications follow this status cycle:

```
pending → sent → read
           ↓
          failed (can be retried)
```

### Status Values:
- **pending:** Created, waiting to be processed/sent
- **sent:** Successfully delivered via channel
- **failed:** Failed to send (will need retry logic in background worker)
- **read:** Admin marked as read in dashboard

---

## Testing the Notification System

### 1. Test via Components
Add temporary buttons to test triggers:

```typescript
import { NotificationService } from "@/services/notificationService";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";

function TestNotifications() {
  const { onLowInventory, onPaymentDue, onCycleComplete } = useNotificationTriggers();

  return (
    <div style={{ padding: 20, gap: 10, display: "flex", flexDirection: "column" }}>
      <button onClick={() => onLowInventory("test-school", 45)}>
        Test: Low Inventory
      </button>
      <button onClick={() => onPaymentDue("test-school", 45000, 5)}>
        Test: Payment Overdue
      </button>
      <button onClick={() => onCycleComplete("test-school", 42, "2026-06-01", "2026-08-31")}>
        Test: Cycle Complete
      </button>
      <button onClick={() => NotificationService.triggerSystemAlert("Test", "Test alert")}>
        Test: System Alert
      </button>
    </div>
  );
}
```

### 2. View in Dashboard
After triggering, go to **Notifications** tab to see them appear in real-time.

### 3. Filter by Type
Use the filter buttons to see specific notification types.

---

## Next Steps: Background Worker

Once notification triggers are working, build a background worker to:

1. ✅ Fetch "pending" notifications
2. ✅ Send via WhatsApp bot
3. ✅ Send via email (Resend)
4. ✅ Update status to "sent" or "failed"
5. ✅ Retry failed notifications

See: `NOTIFICATION_WORKER.md` (coming soon)

---

## API Reference

### NotificationService Methods

```typescript
// Create notification
NotificationService.createNotification(params)

// Create multiple
NotificationService.createNotifications(params[])

// Triggers
NotificationService.triggerLowInventoryAlert(schoolId, padCount, threshold?)
NotificationService.triggerPaymentReminder(schoolId, amount, daysOverdue?)
NotificationService.triggerCycleCompletion(schoolId, girls, start, end)
NotificationService.triggerPaymentReceived(schoolId, amount, method)
NotificationService.triggerDistributionComplete(schoolId, girls, pads)
NotificationService.triggerSystemAlert(title, message, severity?)
NotificationService.triggerNewSchoolRegistration(schoolId, name, country)

// Status updates
NotificationService.markAsRead(notificationId)
NotificationService.markAsSent(notificationId)
NotificationService.markAsFailed(notificationId, reason?)
NotificationService.deleteNotification(notificationId)
```

---

## Troubleshooting

### Notifications not appearing?
1. Check database: `SELECT * FROM vagin_notifications;`
2. Verify school_id is valid UUID
3. Check browser console for errors
4. Ensure Supabase subscription is active

### "pending" notifications not being sent?
- Background worker not yet implemented
- See background worker documentation (coming soon)

### WhatsApp/Email not sending?
- Integration with bot/service not yet implemented
- See channel-specific documentation (coming soon)

---

## Architecture Diagram

```
Event Occurs (School created, payment made, pads distributed)
        ↓
    DATABASE TRIGGER (auto) OR
    APPLICATION CODE (manual)
        ↓
    NotificationService.trigger*()
        ↓
    INSERT into vagin_notifications (status='pending')
        ↓
    Real-time Supabase subscription
        ↓
    Notifications Tab displays update
        ↓
    Background Worker (TODO)
        ↓
    Send via Channel (WhatsApp, Email)
        ↓
    Update status to 'sent' or 'failed'
```

---

## Support

For issues or questions:
1. Check the database for notification records
2. Review component integration examples above
3. Verify school IDs are valid UUIDs
4. Check Supabase logs for trigger execution

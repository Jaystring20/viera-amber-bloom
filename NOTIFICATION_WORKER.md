# VAGIN Notification Worker - Setup & Deployment Guide

This document explains how to set up and deploy the notification background worker that processes pending notifications and sends them via WhatsApp, Email, or Dashboard.

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Notification Triggers (React/Database) │
│  Create notifications with status:      │
│  "pending"                              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Pending Notifications Table            │
│  vagin_notifications (status=pending)   │
└────────────┬────────────────────────────┘
             │ (every 5 minutes)
             ▼
┌─────────────────────────────────────────┐
│  Background Worker                      │
│  (Supabase Edge Function)               │
│  - Fetch pending notifications          │
│  - Send via channels                    │
│  - Update status to sent/failed         │
└────────────┬────────────────────────────┘
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
    WhatsApp Email Dashboard
     (Bot)  (Resend) (UI)
```

---

## Components

### 1. **NotificationWorker Service** (`src/services/notificationWorker.ts`)
TypeScript service class with methods to:
- Process pending notifications
- Send via WhatsApp, Email, or Dashboard
- Handle retries for failed notifications
- Get worker statistics

### 2. **Edge Function** (`supabase/functions/process-notifications/index.ts`)
Deno TypeScript function that:
- Fetches pending notifications from Supabase
- Calls the appropriate channel API (WhatsApp bot, Resend)
- Updates notification status to sent/failed
- Can be scheduled via Supabase Scheduler

### 3. **Environment Variables**
Required configuration for channels:
- `WHATSAPP_BOT_API_URL` - Your WhatsApp bot endpoint
- `WHATSAPP_BOT_API_KEY` - API key for WhatsApp bot
- `RESEND_API_KEY` - Resend.com API key for email

---

## Setup Instructions

### Step 1: Environment Variables

Add these to your `.env.local` (for local development) and Supabase secrets:

```bash
# .env.local (local development)
REACT_APP_WHATSAPP_BOT_API=https://your-bot-api.com/send
WHATSAPP_BOT_API_KEY=your-bot-api-key
RESEND_API_KEY=your-resend-api-key
```

**In Supabase Dashboard:**
1. Go to **Settings** → **Secrets**
2. Add these secrets:
   - `WHATSAPP_BOT_API_KEY`
   - `WHATSAPP_BOT_API_URL`
   - `RESEND_API_KEY`

### Step 2: Deploy Edge Function

```bash
# From your project root
supabase functions deploy process-notifications
```

Verify deployment:
```bash
supabase functions list
```

### Step 3: Create Scheduled Job

Option A: Using Supabase Dashboard UI
1. Go to **SQL Editor**
2. Run this SQL to create a scheduled job:

```sql
-- Create scheduled job that runs every 5 minutes
SELECT cron.schedule(
  'process-pending-notifications',
  '*/5 * * * *',  -- Every 5 minutes
  'SELECT net.http_post(
     url := ''https://<project-id>.supabase.co/functions/v1/process-notifications'',
     headers := jsonb_build_object(
       ''Authorization'', ''Bearer <your-anon-key>''
     ),
     body := jsonb_build_object(
       ''action'', ''process_notifications''
     )
   ) as request_id;'
);
```

Option B: Using Supabase CLI
```bash
supabase functions deploy process-notifications \
  --create-schedule "*/5 * * * *"
```

### Step 4: Verify Configuration

Test the worker locally:
```bash
# Test the Edge Function locally
supabase functions serve process-notifications
```

Then in another terminal:
```bash
# Call the function
curl -X POST \
  http://localhost:54321/functions/v1/process-notifications \
  -H "Authorization: Bearer your-anon-key"
```

---

## Testing the System

### 1. Create a Test Notification

```typescript
import { NotificationService } from "@/services/notificationService";

// Create test notification
await NotificationService.triggerLowInventoryAlert(
  "your-school-id",
  45,  // pad count
  50   // threshold
);
```

### 2. Check Notification Status

```sql
-- View all pending notifications
SELECT * FROM vagin_notifications WHERE status = 'pending';

-- View sent notifications
SELECT * FROM vagin_notifications WHERE status = 'sent' ORDER BY created_at DESC;

-- View failed notifications
SELECT * FROM vagin_notifications WHERE status = 'failed' ORDER BY created_at DESC;
```

### 3. Run Worker Manually

```bash
# Test the Edge Function
curl -X POST \
  https://<project-id>.supabase.co/functions/v1/process-notifications \
  -H "Authorization: Bearer $(supabase status | grep 'Anon key')" \
  -H "Content-Type: application/json"
```

### 4. Monitor Results

Check the **Notifications** tab in your admin dashboard to see notifications processed in real-time.

---

## Deployment Checklist

- [ ] Set environment variables in Supabase Secrets
- [ ] Deploy Edge Function: `supabase functions deploy process-notifications`
- [ ] Create scheduled job (every 5 minutes recommended)
- [ ] Test with manual notification creation
- [ ] Verify WhatsApp API endpoint is reachable
- [ ] Verify Resend API key is valid
- [ ] Monitor first few runs in Supabase function logs
- [ ] Set up error alerting (optional)

---

## Configuration

### Notification Processing Frequency

The worker runs on a schedule (default: every 5 minutes). Adjust by changing the cron expression:

| Expression | Frequency |
|-----------|-----------|
| `*/1 * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes (recommended) |
| `*/15 * * * *` | Every 15 minutes |
| `0 * * * *` | Every hour |

### Max Retries

Failed notifications are retried up to 3 times before being marked as permanently failed.

Adjust in `notificationWorker.ts`:
```typescript
static async retryFailedNotifications(maxRetries: number = 3)
```

### Batch Size

The worker processes up to 100 notifications per run. Adjust in:
- `notificationWorker.ts`: `.limit(100)`
- `index.ts` (Edge Function): `.limit(100)`

---

## Monitoring & Logging

### View Function Logs

In Supabase Dashboard:
1. Go to **Functions**
2. Click **process-notifications**
3. View **Recent Invocations** and logs

### Database Monitoring

```sql
-- Get worker statistics
SELECT 
  status,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM vagin_notifications
GROUP BY status;

-- Get failed notifications with retry count
SELECT 
  id,
  title,
  data->>'retry_count' as retry_count,
  data->>'last_error' as error,
  created_at
FROM vagin_notifications
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Get processing performance
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  COUNTIF(status = 'sent') as sent,
  COUNTIF(status = 'failed') as failed,
  ROUND(100.0 * COUNTIF(status = 'sent') / COUNT(*), 2) as success_rate
FROM vagin_notifications
WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY date
ORDER BY date DESC;
```

### Error Notifications

Set up alerts for worker failures:

```sql
-- Create alert: notify admin when worker fails multiple times
CREATE OR REPLACE FUNCTION notify_worker_failures()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM vagin_notifications 
      WHERE status = 'failed' 
      AND data->>'retry_count'::int >= 3
      AND created_at > NOW() - INTERVAL '1 hour') > 10 THEN
    
    INSERT INTO vagin_notifications (
      notification_type, title, message, 
      channel, recipient_type, status
    ) VALUES (
      'alert',
      '🚨 Notification Worker Alert',
      'High failure rate detected in notification worker. Check logs.',
      'dashboard',
      'admin',
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Troubleshooting

### Issue: Notifications not being sent

**Check:**
1. Are notifications created with `status = 'pending'`?
   ```sql
   SELECT * FROM vagin_notifications WHERE status = 'pending' LIMIT 5;
   ```

2. Is the Edge Function deployed?
   ```bash
   supabase functions list
   ```

3. Are environment variables configured?
   ```bash
   supabase secrets list
   ```

4. Check function logs for errors:
   - Supabase Dashboard → Functions → process-notifications → Recent Invocations

### Issue: WhatsApp not sending

**Check:**
1. Is `WHATSAPP_BOT_API_URL` configured correctly?
2. Is `WHATSAPP_BOT_API_KEY` valid?
3. Does the matron have a phone number in the database?
   ```sql
   SELECT id, name, phone FROM vagin_matrons WHERE phone IS NOT NULL;
   ```

4. Test the WhatsApp API directly:
   ```bash
   curl -X POST https://your-bot-api.com/send \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"phone": "+234XXXXXXXXXX", "message": "Test"}'
   ```

### Issue: Email not sending

**Check:**
1. Is `RESEND_API_KEY` set and valid?
2. Does the recipient have an email address?
   ```sql
   SELECT id, name, email FROM vagin_matrons WHERE email IS NOT NULL;
   ```

3. Test the Resend API:
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "notifications@vagin.org",
       "to": "test@example.com",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

### Issue: High failure rate

**Solutions:**
1. Increase retry count:
   ```typescript
   await NotificationWorker.retryFailedNotifications(5);
   ```

2. Increase batch size (process more per run):
   - Update `.limit(100)` to `.limit(200)`

3. Increase frequency of runs:
   - Change cron from `*/5` to `*/2` (every 2 minutes)

4. Check API rate limits:
   - WhatsApp bot rate limit
   - Resend API rate limit

---

## Integration with Application

### Manual Processing

```typescript
import { NotificationWorker } from "@/services/notificationWorker";

// Process all pending notifications
const result = await NotificationWorker.processPendingNotifications();
console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);

// Retry failed notifications
const retryResult = await NotificationWorker.retryFailedNotifications(3);

// Get statistics
const stats = await NotificationWorker.getWorkerStats();
console.log(`Pending: ${stats.pending}, Sent: ${stats.sent}`);
```

### In a React Component

```typescript
import { useState } from "react";
import { NotificationWorker } from "@/services/notificationWorker";

function AdminNotificationStats() {
  const [stats, setStats] = useState(null);

  const handleRefresh = async () => {
    const data = await NotificationWorker.getWorkerStats();
    setStats(data);
  };

  const handleProcessNow = async () => {
    const result = await NotificationWorker.processPendingNotifications();
    console.log("Processed:", result);
    handleRefresh();
  };

  return (
    <div>
      <button onClick={handleProcessNow}>Process Now</button>
      <button onClick={handleRefresh}>Refresh Stats</button>
      {stats && (
        <div>
          <p>Pending: {stats.pending}</p>
          <p>Sent: {stats.sent}</p>
          <p>Failed: {stats.failed}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Performance Considerations

### Processing Capacity

| Batch Size | Frequency | Notifications/Hour | Notes |
|-----------|-----------|-------------------|-------|
| 100 | Every 1 min | 6,000 | Max load |
| 100 | Every 5 min | 1,200 | Recommended |
| 100 | Every 15 min | 400 | Light load |

### Database Indexes

Ensure these indexes exist for optimal performance:

```sql
CREATE INDEX IF NOT EXISTS idx_vagin_notifications_status 
  ON vagin_notifications(status) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_vagin_notifications_created_at 
  ON vagin_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vagin_notifications_channel 
  ON vagin_notifications(channel);
```

### Optimize for Scale

If you exceed 1,000s of notifications:
1. Increase batch size to 500
2. Split by channel (separate jobs for WhatsApp, Email, Dashboard)
3. Use external queue system (Redis, RabbitMQ)
4. Implement exponential backoff for retries

---

## Next Steps

1. ✅ Deploy the Edge Function
2. ✅ Configure environment variables
3. ✅ Set up scheduled job
4. ✅ Test with sample notifications
5. Monitor in production
6. Set up error alerts
7. Scale as needed

---

## Support & Debugging

### Enable Debug Logging

Edit `index.ts` and add more `console.log` statements:

```typescript
console.log("📢 Processing notification:", {
  id: notification.id,
  channel: notification.channel,
  recipient_type: notification.recipient_type,
  school_id: notification.school_id,
});
```

### Redeploy Function

```bash
# Update the function code
# Then redeploy
supabase functions deploy process-notifications --no-verify
```

---

## Related Documentation

- [NOTIFICATION_TRIGGERS.md](./NOTIFICATION_TRIGGERS.md) - Trigger system documentation
- [Supabase Functions Docs](https://supabase.com/docs/guides/functions)
- [Resend Email API](https://resend.com/docs)
- [WhatsApp Bot API](https://developers.facebook.com/docs/whatsapp)

# Deploy Edge Function via Supabase Dashboard

Since the Supabase CLI requires elevated permissions, here's how to deploy the Edge Function manually via the Supabase Dashboard.

---

## Step 1: Get the Function Code

The Edge Function code is at:
```
supabase/functions/process-notifications/index.ts
```

Copy the entire contents of this file.

---

## Step 2: Open Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your **Viera Amber** project
4. Go to **Functions** in the left sidebar

---

## Step 3: Create Function via Dashboard

### Method A: Via Dashboard UI (Recommended)

1. Click **Create a new function**
2. Choose **From scratch**
3. Name it: `process-notifications`
4. Select runtime: **TypeScript**
5. Click **Create**

This creates a new function with a boilerplate.

---

## Step 4: Replace Function Code

1. In the **Code Editor**, select ALL and delete the default code
2. Paste the complete contents from `supabase/functions/process-notifications/index.ts`
3. Click **Deploy** button at the top right

The deployment should complete in a few seconds.

---

## Step 5: Set Environment Variables (Secrets)

Go to **Settings** → **Secrets** and add these three:

### Secret 1: WHATSAPP_BOT_API_URL
```
Key: WHATSAPP_BOT_API_URL
Value: https://your-whatsapp-bot-api.com/send
```

### Secret 2: WHATSAPP_BOT_API_KEY
```
Key: WHATSAPP_BOT_API_KEY
Value: your-api-key-here
```

### Secret 3: RESEND_API_KEY
```
Key: RESEND_API_KEY
Value: re_your_resend_api_key
```

Click **Add** for each secret.

---

## Step 6: Test the Function

Once deployed:

1. Go back to the **Functions** list
2. Click on **process-notifications**
3. Click the **Invoke** button

You should see a response like:
```json
{
  "success": true,
  "processed": 0,
  "sent": 0,
  "failed": 0,
  "errors": [],
  "timestamp": "2026-09-12T..."
}
```

(0 processed if there are no pending notifications)

---

## Step 7: Create Scheduled Job

Now set up the scheduler to run the function every 5 minutes.

### Option A: Via Supabase Dashboard

1. Go to **Database** → **Scheduled Jobs** (or look for Cron/Scheduler)
2. Click **Create Job** or similar
3. Set these details:
   - **Name:** `process_notifications_every_5_min`
   - **Function:** `process-notifications`
   - **Schedule:** `*/5 * * * *` (every 5 minutes)
   - **Enabled:** Yes
   - Click **Create**

### Option B: Via SQL Query

Go to **SQL Editor** and run this query:

```sql
-- Create cron job to run every 5 minutes
-- Note: This requires pgcron extension to be enabled
SELECT cron.schedule(
  'process_pending_notifications',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/process-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <YOUR_ANON_KEY>'
    ),
    body := jsonb_build_object()
  ) as request_id;
  $$
);
```

**Replace:**
- `<YOUR_PROJECT_ID>` with your Supabase project ID (from project settings)
- `<YOUR_ANON_KEY>` with your Supabase anon key (from project settings → API)

**Find your credentials:**
1. Supabase Dashboard → Settings → API
2. Copy `URL` (extract project ID from it)
3. Copy `anon` key (under "Project API keys")

---

## Step 8: Verify It's Working

### Manual Test:

1. Create a test notification:
```sql
INSERT INTO vagin_notifications (
  notification_type, title, message, channel, recipient_type, status
) VALUES (
  'low_inventory',
  '🚨 Test Inventory Alert',
  'This is a test notification to verify the worker is processing.',
  'dashboard',
  'admin',
  'pending'
);
```

2. Invoke the function manually:
   - Go to Functions → process-notifications → Click **Invoke**

3. Check the notification status:
```sql
SELECT status, data->>'last_error' as error 
FROM vagin_notifications 
WHERE title LIKE '%Test%';
```

Expected result: `status = 'sent'`

### Automatic Test:

Wait 5 minutes for the scheduled job to run, then check if pending notifications become "sent".

---

## Step 9: Monitor the Function

### View Invocations & Logs:

1. Go to **Functions** → **process-notifications**
2. Click **Recent Invocations**
3. You should see entries like:
   - ✅ Success (green): Notifications processed
   - ❌ Failed (red): Check error details

### Check Logs:

Each invocation shows:
- Duration
- Status
- Error messages (if any)
- Request/Response

---

## Configuration Reference

### Adjust Processing Frequency

Change the cron schedule:

| Schedule | Frequency |
|----------|-----------|
| `*/1 * * * *` | Every 1 minute |
| `*/5 * * * *` | Every 5 minutes (default) |
| `*/15 * * * *` | Every 15 minutes |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Every day at midnight |

### Adjust Environment Variables

If you need to update API keys:

1. Go to **Settings** → **Secrets**
2. Find the secret
3. Click the **Update** button
4. Paste new value
5. The change takes effect immediately

---

## Troubleshooting

### Function won't deploy

**Check:**
1. Code syntax is valid (copy exactly from index.ts)
2. No TypeScript errors in the editor
3. File is saved before deploying

**Fix:**
1. Clear any syntax errors
2. Verify all imports exist
3. Try deploying again

### Scheduled job not running

**Check:**
1. Function deployed successfully
2. pgcron extension enabled (should be by default)
3. Secrets are set correctly

**Verify in SQL:**
```sql
-- Check if job exists
SELECT * FROM cron.job WHERE jobname = 'process_pending_notifications';

-- Check recent job logs
SELECT * FROM cron.job_run_details 
ORDER BY end_time DESC 
LIMIT 10;
```

### Function runs but doesn't send notifications

**Check:**
1. Pending notifications exist:
```sql
SELECT COUNT(*) FROM vagin_notifications WHERE status = 'pending';
```

2. Matrons have phone/email:
```sql
SELECT id, name, phone, email FROM vagin_matrons LIMIT 5;
```

3. API keys are valid:
   - Test WhatsApp API endpoint manually with curl
   - Test Resend API key in [Resend Dashboard](https://resend.com/dashboard)

4. Function logs for errors:
   - Check Recent Invocations for error details

---

## Next Steps

Once deployed and working:

1. ✅ Monitor the function logs daily
2. ✅ Check notification processing stats:
```sql
SELECT 
  status, 
  COUNT(*) as count,
  MAX(created_at) as latest
FROM vagin_notifications
GROUP BY status;
```

3. ✅ Set up error alerts (optional):
```sql
-- Alert admin if too many failures
CREATE OR REPLACE FUNCTION check_notification_failures()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM vagin_notifications 
      WHERE status = 'failed' 
      AND data->>'retry_count'::int >= 3) > 5 THEN
    
    INSERT INTO vagin_notifications (
      notification_type, title, message, channel, recipient_type, status
    ) VALUES (
      'alert',
      '🚨 High Notification Failure Rate',
      'More than 5 notifications have failed after 3 retries. Check logs.',
      'dashboard',
      'admin',
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

4. ✅ Scale if needed:
   - Increase batch size in function (`.limit(100)` → `.limit(500)`)
   - Increase frequency (`*/5` → `*/2` for every 2 minutes)
   - Add more retry retries if needed

---

## Getting Help

If the function fails:

1. Check **Recent Invocations** for error details
2. Review the logs for the failed run
3. Common errors:
   - `WHATSAPP_BOT_API_URL not configured` → Add secret
   - `Unauthorized` → Check API key
   - `Network timeout` → API endpoint unreachable

4. Test API endpoints manually:
```bash
# Test WhatsApp API
curl -X POST https://your-api.com/send \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+234XXXXXXXXXX", "message": "Test"}'

# Test Resend API
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from": "test@vagin.org", "to": "user@example.com", "subject": "Test", "html": "<p>Test</p>"}'
```

---

## Summary

✅ **Deployment complete when:**
1. Function deployed and shows in Functions list
2. All 3 environment secrets are set
3. Scheduled job is created and shows in Cron/Scheduler
4. Manual invocation returns success response
5. Test notification changes from `pending` to `sent`

You're ready to process notifications! 🎉

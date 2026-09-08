# Meta WhatsApp Cloud API - Webhook Configuration Guide

## Overview
Configure your Meta WhatsApp Business Account to send messages to the PAD KÓLÓ bot via webhook.

---

## Prerequisites
- ✅ WhatsApp Business Account set up in Meta
- ✅ Business Phone Number registered
- ✅ Access to Meta Business Manager
- ✅ Edge Function deployed to Supabase

---

## Step 1: Get Your Webhook Details

**Webhook URL:**
```
https://xcwgethymuvxcalxukzy.supabase.co/functions/v1/whatsapp-webhook
```

**Verify Token (set this value):**
```
pad_kolo_webhook_2026_secure
```

---

## Step 2: Configure Webhook in Meta Business Manager

### 2.1 Navigate to WhatsApp API Settings
1. Go to [Meta Business Manager](https://business.facebook.com)
2. Select your Business Account
3. Go to **Apps** → Find your WhatsApp App
4. Click **Settings** → **Configuration**
5. Under "Webhooks", click **Edit Webhook**

### 2.2 Set Callback URL
1. In the **Callback URL** field, enter:
   ```
   https://xcwgethymuvxcalxukzy.supabase.co/functions/v1/whatsapp-webhook
   ```

### 2.3 Set Verify Token
1. In the **Verify Token** field, enter:
   ```
   pad_kolo_webhook_2026_secure
   ```

### 2.4 Select Webhook Fields
When Meta prompts to verify the webhook, ensure these fields are selected:
- ✅ **messages** (for receiving incoming messages)
- ✅ **message_status** (for delivery confirmations)
- ✅ **message_template_status_update** (optional)

### 2.5 Subscribe to Webhook
1. Click **Verify and Save**
2. Meta will send a verification request to your webhook
3. Your Edge Function will automatically respond with the challenge

---

## Step 3: Configure Environment Variables

Set these in your Supabase Edge Function environment:

### Via Supabase Dashboard:
1. Go to Supabase Dashboard → Your Project
2. Navigate to **Functions** → **whatsapp-webhook**
3. Click **Environment Variables**
4. Add these secrets:

```
WHATSAPP_WEBHOOK_TOKEN = pad_kolo_webhook_2026_secure
WHATSAPP_ACCESS_TOKEN = <Your Graph API Access Token>
VITE_WHATSAPP_PHONE_ID = <Your Phone Number ID>
VITE_WHATSAPP_APP_SECRET = <Your App Secret>
```

### How to Get These Values:

**WHATSAPP_ACCESS_TOKEN:**
- Go to Meta App Settings → Basic
- Copy "App ID" 
- Go to Settings → Roles → System Users
- Create or use existing system user with "Admin" role
- Generate new access token (valid for 60 days, or create permanent token)

**VITE_WHATSAPP_PHONE_ID:**
- Go to WhatsApp API Settings → Phone Numbers
- Copy the Phone Number ID (not the phone number itself)

**VITE_WHATSAPP_APP_SECRET:**
- Go to Meta App Settings → Basic
- Copy "App Secret" (keep this confidential!)

---

## Step 4: Test Webhook Verification

Once configured, Meta will test the webhook connection:

1. Meta sends: `GET /webhook?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=TOKEN`
2. Your Edge Function verifies the token
3. If correct, responds with the challenge value
4. Meta confirms successful connection ✅

---

## Step 5: Enable Message Delivery

### 5.1 Get Access Token
1. In Meta App Settings, generate a permanent access token for your system user
2. This token is needed in the `WHATSAPP_ACCESS_TOKEN` environment variable

### 5.2 Test Message Send
Your Edge Function will:
1. Receive incoming message from matron
2. Parse the command (CHECK ID, ISSUE PAD, DEPOSIT, REPORT)
3. Execute bot logic against VAGIN database
4. Send response via WhatsApp Graph API

---

## Step 6: Verify Production Setup

### Test Commands:
Send these from a registered matron's WhatsApp number:

```
✓ CHECK ID TPHS-CA-001
✓ ISSUE PAD TPHS-CA-001 FREE
✓ DEPOSIT 5000
✓ REPORT DAILY
```

### Expected Responses:
- ✅ Student info with balance and free pads
- ✅ Confirmation of pad issuance with new balance
- ✅ Confirmation of deposit recorded
- ✅ Summary of today's activity

---

## Troubleshooting

### "Webhook verification failed"
- ✅ Verify token is exactly: `pad_kolo_webhook_2026_secure`
- ✅ Webhook URL is reachable from internet
- ✅ Edge Function is deployed

### "Matron not registered"
- ✅ Add matron to `vagin_matrons` table
- ✅ Sync to `teachers_matrons` table
- ✅ WhatsApp phone number must match (with or without +234 prefix)

### "Student not found"
- ✅ Create students in the matron's school
- ✅ Use correct student_id format: `SCHOOLCODE-INITIALS-SEQ`
- ✅ Example: `TPHS-CA-001`

### "Pad not issued / Error"
- ✅ Check VAGIN database tables exist
- ✅ Verify school and student have valid IDs
- ✅ Check Edge Function logs in Supabase dashboard

---

## Security Notes

⚠️ **Important:**
- Store `VITE_WHATSAPP_APP_SECRET` in environment variables only
- Never commit secrets to GitHub
- Use Supabase's secure environment variable storage
- Webhook verification ensures only Meta can call your function
- Row Level Security (RLS) policies protect database access

---

## Monitoring

### View Webhook Activity:
1. Supabase Dashboard → Functions → whatsapp-webhook
2. Click **View Logs** tab
3. See all incoming messages and responses in real-time

### Sample Log Output:
```
[Webhook] GET request received
[Webhook] Verification successful
[Webhook] Message from +2348038838094: ISSUE PAD TPHS-CA-001 FREE
[Webhook] Command execution successful
[Webhook] Message sent to +2348038838094
```

---

## Webhook Flow Diagram

```
Meta WhatsApp Cloud API
        ↓
Sends POST to Webhook URL
        ↓
Supabase Edge Function
        ├─ Verify signature (HMAC-SHA256)
        ├─ Parse message
        ├─ Lookup matron by phone
        ├─ Parse command (CHECK ID, ISSUE PAD, etc.)
        ├─ Query VAGIN database
        ├─ Record transactions
        ├─ Update balances
        └─ Send response via Graph API
        ↓
Response delivered to matron's WhatsApp
```

---

## Environment Variables Summary

| Variable | Value | From |
|----------|-------|------|
| `WHATSAPP_WEBHOOK_TOKEN` | `pad_kolo_webhook_2026_secure` | This guide |
| `WHATSAPP_ACCESS_TOKEN` | Graph API Token | Meta App Settings |
| `VITE_WHATSAPP_PHONE_ID` | Phone Number ID | WhatsApp API Settings |
| `VITE_WHATSAPP_APP_SECRET` | App Secret | Meta App Settings → Basic |
| `SUPABASE_URL` | `https://xcwgethymuvxcalxukzy.supabase.co` | Supabase Dashboard |
| `SUPABASE_ANON_KEY` | Published Key | Supabase Dashboard → Settings → API |

---

## Next Steps

1. ✅ Deploy Edge Function to Supabase
2. ✅ Get Meta API credentials
3. ✅ Configure webhook in Meta Business Manager
4. ✅ Set environment variables in Supabase
5. ✅ Test webhook verification
6. ✅ Send test commands from WhatsApp
7. ✅ Monitor logs in real-time
8. ✅ Launch to matrons!

---

## Support

For issues:
1. Check Supabase Function logs
2. Verify Meta webhook configuration
3. Ensure environment variables are set
4. Test matron phone number is registered
5. Confirm students exist in correct school


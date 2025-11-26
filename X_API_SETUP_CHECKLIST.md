# X API Setup Checklist

## ⚠️ Error: "Can't log you in right now"

This error means your X API app configuration needs to be updated.

## Required Steps in X Developer Portal

### 1. Go to X Developer Portal
Visit: https://developer.twitter.com/en/portal/dashboard

### 2. Select Your App
- Click on your app (the one with Client ID: `Abtts1thnK0P83pjJsNesyF8f`)

### 3. Configure OAuth 2.0 Settings

#### App Settings → User Authentication Settings

Click **"Set up"** or **"Edit"** and configure:

**✅ App permissions:**
- Select: **Read and write**
- Or at minimum: **Read** (for followers, following, profile)

**✅ Type of App:**
- Select: **Web App, Automated App or Bot**

**✅ App info:**

**Callback URI / Redirect URL:**
```
http://localhost:5000/api/auth/x/callback
```

**Website URL:**
```
http://localhost:3001
```
(Or any valid URL, can be your github repo)

### 4. Required Scopes

Make sure these scopes are enabled:
- ✅ `tweet.read` - Read tweets
- ✅ `users.read` - Read user profile
- ✅ `follows.read` - Read followers/following
- ✅ `follows.write` - Unfollow functionality
- ✅ `offline.access` - Refresh tokens

### 5. OAuth 2.0 Settings

**Client Type:** 
- Select: **Confidential** (since you have a client secret)

**Callback URL:** 
- Must be: `http://localhost:5000/api/auth/x/callback`

### 6. Save Changes

Click **Save** at the bottom of the page.

---

## Common Issues & Fixes

### Issue 1: "Invalid redirect_uri"
**Fix:** Make sure callback URL in X Developer Portal exactly matches:
```
http://localhost:5000/api/auth/x/callback
```
(No trailing slash, exactly as shown)

### Issue 2: "Invalid client_id"
**Fix:** 
1. Verify Client ID in `.env` matches X Developer Portal
2. Current: `Abtts1thnK0P83pjJsNesyF8f`

### Issue 3: "Invalid scope"
**Fix:** Enable all required scopes in App Permissions:
- tweet.read
- users.read  
- follows.read
- follows.write
- offline.access

### Issue 4: "App not set up for OAuth 2.0"
**Fix:** 
1. Go to App Settings → User Authentication Settings
2. Click "Set up"
3. Complete OAuth 2.0 configuration

### Issue 5: "Can't log in right now"
**Causes:**
- App permissions not configured
- Callback URL mismatch
- App not approved/activated
- OAuth 2.0 not enabled

**Fix:** Complete steps 1-6 above

---

## Test Your Configuration

### 1. Verify Credentials
Check `backend/.env`:
```env
X_API_CLIENT_ID=Abtts1thnK0P83pjJsNesyF8f
X_API_CLIENT_SECRET=Na37MGlEUaiRXsqE6kuNvtNKIDaDO6tBy3BvC8gLSCVnZzlKON
X_API_CALLBACK_URL=http://localhost:5000/api/auth/x/callback
```

### 2. Restart Backend
After changing X app settings:
```bash
# Backend will auto-reload with nodemon
# Or manually restart if needed
```

### 3. Test OAuth Flow
1. Visit: http://localhost:3001
2. Click "Sign in with X (Twitter)"
3. Should redirect to X authorization page
4. Authorize the app
5. Should redirect back to dashboard

---

## X Developer Portal Navigation

1. **Login:** https://developer.twitter.com/
2. **Dashboard:** Portal → Projects & Apps → Your App
3. **App Settings:** Click app name → Settings tab
4. **User Authentication:** Settings → User authentication settings → Set up/Edit
5. **Keys and Tokens:** Keys and tokens tab

---

## If Still Not Working

### Check X App Status
- Go to X Developer Portal
- Check if app is **Active**
- Check if project is in **Production** mode (not in review)

### Enable Development Mode
If app is new:
1. You might be in "Restricted" mode
2. Request "Elevated" access if needed
3. Or use app in development with your own account first

### Verify OAuth 2.0 is Enabled
1. Go to App Settings
2. Look for "OAuth 2.0 Settings" section
3. Should show Client ID and redirect URIs
4. If missing, click "Set up" to enable OAuth 2.0

---

## Production Setup (Later)

When deploying to production:

**Update Callback URL:**
```
https://yourdomain.com/api/auth/x/callback
```

**Update Website URL:**
```
https://yourdomain.com
```

**Update .env:**
```env
X_API_CALLBACK_URL=https://yourdomain.com/api/auth/x/callback
FRONTEND_URL=https://yourdomain.com
```

---

## Need Help?

**X API Documentation:**
- OAuth 2.0: https://developer.twitter.com/en/docs/authentication/oauth-2-0
- App Setup: https://developer.twitter.com/en/docs/apps/overview

**Common Error Codes:**
- 400: Invalid request (check callback URL, scopes)
- 401: Invalid credentials (check client ID/secret)
- 403: App not authorized (enable OAuth 2.0)

---

**Next Step:** Go to X Developer Portal and complete the OAuth 2.0 setup! 🚀

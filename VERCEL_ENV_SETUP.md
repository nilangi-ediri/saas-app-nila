# Vercel Environment Variables Setup

## Required Environment Variables

To ensure your companion form works correctly in production, you need to configure the following environment variables in your Vercel project dashboard.

### 1. Navigate to Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `nila_saas_app`
3. Click on **Settings** tab
4. Click on **Environment Variables** in the sidebar

### 2. Add the Following Variables

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Where to find these:**
- Log in to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings** > **API**
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Where to find these:**
- Log in to [Clerk Dashboard](https://dashboard.clerk.com)
- Select your application
- Go to **API Keys**
- Copy **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Copy **Secret Key** → `CLERK_SECRET_KEY`

### 3. Important Notes

- **Environment Scope**: Set all variables for **Production**, **Preview**, and **Development** environments
- **Redeploy Required**: After adding/updating environment variables, you must **redeploy** your application for changes to take effect
- **Security**: Never commit `.env` files with real credentials to your repository

### 4. Verify Setup

After adding environment variables and redeploying:

1. Go to your deployed app: `https://your-app.vercel.app`
2. Try to navigate to the companion form: `/companions/new`
3. Try creating a new companion
4. Check Vercel Function Logs for any errors:
   - Go to your project in Vercel
   - Click on **Deployments** tab
   - Click on the latest deployment
   - Click on **Functions** tab to see logs

### 5. Troubleshooting

If the form still doesn't work:

**Check Browser Console:**
```bash
# Open browser DevTools (F12)
# Look for errors in the Console tab
# Common issues:
# - "Failed to fetch" → Check API routes
# - "Unauthorized" → Check Clerk keys
# - "Invalid token" → Check Supabase keys
```

**Check Vercel Function Logs:**
1. Go to Vercel Dashboard → Your Project
2. Click **Logs** tab
3. Look for errors related to `createCompanion` function
4. Common issues:
   - Missing environment variables
   - Supabase connection errors
   - Authentication errors

**Test Environment Variables:**
Add a temporary test API route to verify env vars are loaded:

```typescript
// app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    clerkPublic: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing',
    clerkSecret: process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing',
  });
}
```

Then visit: `https://your-app.vercel.app/api/test-env`

### 6. Code Changes Made

The following fixes were applied to resolve the production deployment issue:

**File: [components/ui/CompanionForm.tsx](components/ui/CompanionForm.tsx)**

1. **Replaced `redirect()` with `useRouter()`**
   - Changed from server-side redirect to client-side navigation
   - This fixes the timing issue in production environments

2. **Added Error Handling**
   - Wrapped form submission in try-catch
   - Display user-friendly error messages
   - Console logging for debugging

3. **Added Loading State**
   - Disabled submit button during submission
   - Shows "Creating Companion..." text while processing
   - Prevents duplicate submissions

**Before:**
```typescript
const onSubmit = async (data) => {
    const companion = await createCompanion(data);
    if (companion) {
        redirect(`/companions/${companion.id}`);  // ❌ Problematic in production
    }
}
```

**After:**
```typescript
const onSubmit = async (data) => {
    try {
        setIsSubmitting(true);
        setError(null);

        const companion = await createCompanion(data);

        if (companion && companion.id) {
            router.push(`/companions/${companion.id}`);  // ✅ Client-side navigation
        } else {
            setError("Failed to create companion. Please try again.");
            setIsSubmitting(false);
        }
    } catch (err) {
        console.error("Error creating companion:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        setIsSubmitting(false);
    }
}
```

### 7. Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Redeploy your application
3. ✅ Test the companion form in production
4. ✅ Monitor Vercel logs for any errors
5. ✅ Remove the test API route if you created one

---

**Questions or Issues?**
If you continue to experience issues after following these steps, check:
- Supabase database permissions
- Clerk application settings
- Next.js app router configuration
- Browser network tab for failed requests

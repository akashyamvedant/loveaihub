# LoveAIHub Troubleshooting Guide

## Common Architecture Issues

### 1. Root URL (`/`) Shows Wrong Page After Authentication Changes

**Symptom:** After login/logout, the root URL shows the wrong page (landing instead of dashboard or vice versa).

**Root Cause:** LoveAIHub uses a **shared URL architecture** where both the landing page and dashboard exist at the same URL (`/`). The authentication state determines which component renders.

**Solution:**
- Check authentication state in browser developer tools (localStorage and cookies)
- Ensure `client/src/App.tsx` logic: `hasAuth = authStorage.hasAuth() && (isAuthenticated || isLoading)`
- After logout, force complete page reload with `window.location.replace('/')`
- Clear all auth tokens: localStorage and cookies

### 2. Logout Issues

**Multiple Logout Buttons:** The app has two logout locations:
- Profile dropdown (top-right corner) - in `dashboard-header.tsx`
- Sidebar logout - in `dashboard-layout.tsx`

**Proper Logout Implementation:**
```javascript
const handleLogout = async () => {
  try {
    // Clear local auth data first
    localStorage.removeItem('supabase-auth-token');
    document.cookie = 'supabase-auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.loveaihub.com';
    
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Force complete page reload to reset all state
    window.location.replace('/');
  } catch (error) {
    console.error('Logout error:', error);
    // Force reload even on error to clear state
    window.location.replace('/');
  }
};
```

**Legacy Support:** The app also handles GET `/api/logout` requests for backward compatibility.

### 3. OAuth Redirect Issues

**Correct OAuth Flow:**
- Login redirects to: `https://www.loveaihub.com/` (root URL)
- Do NOT redirect to `/home` or other paths
- OAuth callbacks are handled in both development and production:
  - Development: `server/supabaseAuth.ts`
  - Production: `api/index.ts` (Vercel serverless function)

### 4. Authentication State Management

**Key Files:**
- `client/src/App.tsx` - Main routing logic
- `client/src/lib/authStorage.ts` - Token management
- `client/src/hooks/useAuth.ts` - Authentication hooks

**Authentication Flow:**
1. User authenticates via Supabase
2. Token stored in localStorage + cookies
3. `hasAuth` condition determines page rendering
4. Logout clears tokens + forces page reload

## File Structure Reference

```
Key Authentication Files:
├── client/src/App.tsx                     # Main routing logic (CRITICAL)
├── client/src/lib/authStorage.ts          # Token management
├── client/src/hooks/useAuth.ts            # Auth hooks
├── client/src/components/dashboard/dashboard-header.tsx  # Profile dropdown logout
├── client/src/components/layout/dashboard-layout.tsx    # Sidebar logout
├── server/supabaseAuth.ts                 # Development auth endpoints
└── api/index.ts                           # Production auth endpoints
```

## Quick Fixes

### Fix "Cannot GET /api/logout" Error:
Add GET route handlers in both `server/supabaseAuth.ts` and `api/index.ts`.

### Fix Logout Not Redirecting to Landing Page:
Ensure logout implementation clears auth tokens AND uses `window.location.replace('/')`.

### Fix OAuth 404 Errors:
Check all redirect URLs point to root URL (`/`) not `/home`.

## Important Notes for Developers

1. **Never change the shared URL structure** without updating the entire authentication flow
2. **Always test both logout buttons** (profile dropdown and sidebar)
3. **Use `window.location.replace('/')` not `window.location.href`** for logout redirects
4. **Remember authentication state is managed by React + localStorage + cookies**
5. **Page reload is required after logout** to reset React component state
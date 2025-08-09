# Password Reset Debugging Guide

## Current Issue
The "auth session missing" error occurs when trying to update passwords through the reset flow.

## Key Findings

### Authentication Flow Issues
1. **Token Type**: Password reset tokens from Supabase need to be handled with `setSession()` method, not just authorization headers
2. **Environment Variables**: Production and development use different variable names
3. **Token Format**: Reset tokens come as URL hash fragments (`#access_token=...&type=recovery`)

### API Endpoint Fixes Applied
- **Development** (`server/supabaseAuth.ts`): Updated to use `setSession()` method
- **Production** (`api/index.ts`): Updated to use `setSession()` method with fallback environment variables

### Testing Steps
1. Send real password reset email via `/api/auth/reset-password`
2. Extract token from email link hash fragment 
3. Use token with `/api/auth/update-password` endpoint
4. Verify session is established before updating password

### Expected Token Flow
```
Email Link: .../reset-password#access_token=ABC123&type=recovery&refresh_token=XYZ
Client: Extracts token from hash, stores in state
API Call: POST /api/auth/update-password with Authorization: Bearer ABC123
Server: Uses setSession() to authenticate, then updateUser()
```

## Test File Created
- `test-reset-flow.html` - Comprehensive testing interface for the reset flow
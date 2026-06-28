# Temporary Hotel Dashboard Mock Auth Guide

## Overview

You can now temporarily display hotels from the database **without needing login to be integrated**. The solution uses mock authentication that mimics the real JWT token format, so **zero changes are needed to your backend**.

## How It Works

The system has three layers:

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Hotel Dashboard                                   │
│ - useHotels() hook calls API with Authorization header     │
└──────────────┬──────────────────────────────────────────────┘
               │ JWT Token in Header
┌──────────────▼──────────────────────────────────────────────┐
│ Mock Auth Layer (mock-auth.ts) [TEMPORARY]                 │
│ - Generates fake JWT with correct format                   │
│ - Stores in localStorage automatically                     │
│ - Easy to enable/disable                                   │
└──────────────┬──────────────────────────────────────────────┘
               │ Looks exactly like real JWT
┌──────────────▼──────────────────────────────────────────────┐
│ Backend API: /api/v1/owner/hotels                           │
│ - Reads JWT from Authorization header                      │
│ - Extracts email from JWT (sub field)                      │
│ - Filters hotels by owner email                            │
│ - Returns only that owner's hotels                         │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Run the Database Script

Execute this SQL to assign `owner_id` to all hotels:

```sql
-- File: /Users/jathuja/TravelHUB/backend/assign_hotel_owners.sql

-- Assign hotels to owners (alternating pattern)
UPDATE hotels 
SET owner_id = CASE 
  WHEN (id % 2) = 0 THEN 40
  ELSE 42
END
WHERE owner_id IS NULL;

-- Verify
SELECT owner_id, COUNT(*) as hotel_count FROM hotels GROUP BY owner_id;
```

### 2. Start the Dashboard

The mock auth is **automatically enabled** in development. When you start the app:

```bash
cd frontend/hotelownerfrontend/hotelwelcome
npm run dev
```

The mock auth will:
- Detect that no token exists
- Create a fake JWT for the default mock user (Hotel Owner 40)
- Store it in localStorage automatically
- Dashboard displays hotels for that owner

## Configuration

### Switch Between Mock Users

Edit [src/lib/mock-auth.ts](src/lib/mock-auth.ts):

```typescript
// 🔧 TEMPORARY: Set to false when real login is ready
const MOCK_MODE = true;

// 🔧 TEMPORARY: Change this to test different hotel owners
export const MOCK_USER_ID = 40; // Change to 42 to test other owner
export const MOCK_USER_EMAIL = `hotelowner${MOCK_USER_ID}@test.com`;
```

**To test different owners:**
1. Edit `MOCK_USER_ID` (change from 40 to 42)
2. Clear browser storage: `localStorage.removeItem('token')`
3. Reload page
4. Dashboard now shows Hotel Owner 42's hotels

### Disable Mock Auth (When Real Login is Ready)

Change one flag in [src/lib/mock-auth.ts](src/lib/mock-auth.ts):

```typescript
// 🔧 TEMPORARY: Set to false when real login is ready
const MOCK_MODE = false; // ← Change this to false
```

That's it! No other changes needed. When you disable mock mode:
- Real JWT tokens from login will be used automatically
- Backend code stays the same
- Frontend code stays the same
- System seamlessly switches to real auth

## What Data You'll See

Once you run the database script above, your dashboard will show:

### Hotel Owner 40's Hotels
- ~17 hotels assigned to user ID 40
- Mixed Approved and Pending status
- All filtered automatically by owner

### Hotel Owner 42's Hotels
- ~17 hotels assigned to user ID 42
- Mixed Approved and Pending status
- All filtered automatically by owner

## Testing the Welcome Page Features

✓ **Status Filtering**
- See Approved hotels count
- See Pending hotels count
- See Rejected hotels count
- Switch between tabs to filter

✓ **Hotel Information**
- Hotel name, destination, location
- Price range
- Amenities
- Contact information
- Application status badge

✓ **Locked Features**
- Pending/Rejected hotels show lock overlay
- Edit button disabled for non-approved hotels
- Only Approved hotels fully editable

✓ **Search & Filter**
- Search by hotel name
- Filter by district
- Real-time filtering

## Behind the Scenes

### Mock Token Format

The system creates JWT tokens like this:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
.
{
  "sub": "hotelowner40@test.com",      // Spring Security uses this as principal
  "userId": 40,
  "iat": 1234567890,
  "exp": 1234654290,                   // 24 hours later
  "email": "hotelowner40@test.com"
}
.
"mock-signature"
```

Your backend reads the `sub` field to identify the user, which matches exactly what the real login would provide.

### Files Modified

When you enable mock auth, these files are involved:

- **New:** `src/lib/mock-auth.ts` - Mock auth service (TEMPORARY)
- **Updated:** `src/routes/__root.tsx` - Initialize mock auth on app startup
- **Unchanged:** `src/lib/hotels-store.ts` - Uses Authorization header (works with both mock and real auth)
- **Unchanged:** Backend - No changes needed!

## Migration Path (When Login is Ready)

When your teammate finishes login functionality:

### Before (Current State)
```typescript
// mock-auth.ts
const MOCK_MODE = true;  // Using fake tokens
```

### After (Real Auth Ready)
```typescript
// mock-auth.ts
const MOCK_MODE = false;  // Using real JWT from login
```

### What Happens
- User logs in with real credentials
- Real JWT stored in localStorage
- `getMockOrRealEmail()` automatically returns real email
- Backend still uses same Principal extraction logic
- **Zero other changes needed!**

## Troubleshooting

### Dashboard Shows "No hotels found"

**Problem:** Hotels aren't showing for the mock user

**Solution:**
1. Verify you ran the SQL script to assign owner_ids
2. Check which user ID you set in mock-auth.ts
3. Verify that user has hotels in the database:
   ```sql
   SELECT * FROM hotels WHERE owner_id = 40;
   ```

### Getting 401 Unauthorized Errors

**Problem:** API returns 401

**Solution:**
1. Check that token exists: `console.log(localStorage.getItem('token'))`
2. Verify mock mode is enabled: 
   ```typescript
   import { isUsingMockAuth } from '@/lib/mock-auth';
   console.log(isUsingMockAuth()); // Should be true
   ```
3. Clear storage and reload: `localStorage.clear(); location.reload()`

### "Test Owner" User Issue

The user "Test Owner" isn't specifically tied to hotels. To include them:

1. Create a role change in the database:
   ```sql
   UPDATE users SET role = 'HOTEL_OWNER' WHERE name = 'Test Owner';
   ```

2. Then assign hotels to them:
   ```sql
   UPDATE hotels SET owner_id = (SELECT id FROM users WHERE name = 'Test Owner')
   WHERE owner_id IS NULL;
   ```

3. Add them to mock-auth.ts to test:
   ```typescript
   export const MOCK_USER_EMAIL = 'tesowner@email.com';
   ```

## Summary

**Current Setup:**
- ✅ Hotel data displayed by owner
- ✅ Approved/Pending status shows
- ✅ Welcome page fully functional
- ✅ Zero backend changes needed
- ✅ Easy to test different users
- ✅ Clean migration path

**Next Steps for Your Teammate:**
- Implement real login that stores JWT in localStorage
- Token must have `sub` field with user email
- Everything else works automatically!

---

**Questions?**
- Mock auth logic: See `src/lib/mock-auth.ts`
- API calls: See `src/lib/hotels-store.ts`
- Integration point: `src/routes/__root.tsx`

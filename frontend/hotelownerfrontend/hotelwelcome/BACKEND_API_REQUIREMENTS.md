# Backend API Requirements for Hotel Owner Dashboard

## Current Implementation (Verified ✓)

Your backend already has the correct structure based on the previous analysis. Here's what the dashboard expects:

### 1. **GET** `/api/v1/owner/hotels?status={status}`

**Purpose:** Fetch hotels for the logged-in owner, filtered by status

**Authentication:** 
- Required: `Authorization: Bearer {JWT_TOKEN}`
- JWT must contain `sub` field with user email (Spring Security principal)

**Query Parameters:**
- `status` - "Approved" | "Pending" | "Rejected"

**Response:** Array of Hotel objects
```json
[
  {
    "id": 1,
    "hotelName": "Hotel A",
    "destination": "Kandy",
    "location": "Downtown Kandy",
    "district": "Kandy District",
    "description": "A beautiful hotel...",
    "priceFrom": 100.0,
    "priceTo": 500.0,
    "imageUrl": "https://...",
    "hotelEmail": "hotel@example.com",
    "hotelContactNumber": "+94...",
    "phoneNumber": "+94...",
    "hotlineNumber": "+94...",
    "amenities": "WiFi,Pool,Restaurant",
    "applicationStatus": "Approved",
    "owner_id": 40,
    "number_of_rooms": 25,
    "rating": 4.5,
    "review_count": 120
  }
]
```

**Implementation Notes:**
- Extract user email from JWT `sub` field
- Query: `SELECT * FROM hotels WHERE owner.email = ? AND application_status = ?`
- Order by: Most recently created first
- Return empty array if no matches (don't error)

### 2. **GET** `/api/v1/owner/profile`

**Purpose:** Fetch the logged-in owner's profile

**Authentication:** Required (same JWT as above)

**Response:** Profile object
```json
{
  "id": 40,
  "name": "Hotel Owner",
  "email": "hotelowner40@test.com",
  "telephone": "+94...",
  "profileImage": "https://...",
  "hotel_name": "My Hotel Group",
  "business_registration_id": "BRN...",
  "business_address": "123 Main St",
  "district": "Colombo District"
}
```

### 3. **DELETE** `/api/v1/owner/hotels/{hotelId}`

**Purpose:** Delete a hotel (with approval checks)

**Authentication:** Required

**Path Parameters:**
- `hotelId` - The hotel ID to delete

**Response:** 
- 204 No Content - Success
- 403 Forbidden - Not the hotel owner
- 404 Not Found - Hotel doesn't exist

**Implementation Notes:**
- Verify that user (from JWT) owns this hotel
- Check if hotel is in "Approved" status before allowing delete
- Set `deleted_at` timestamp instead of hard delete (soft delete pattern)

### 4. **PUT** `/api/v1/owner/profile`

**Purpose:** Update owner profile (name, phone, etc.)

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Name",
  "telephone": "+94..."
}
```

**Response:** Updated Profile object

### 5. **POST** `/api/v1/owner/profile/image`

**Purpose:** Upload profile image

**Authentication:** Required

**Request:** Form-data with `file` field

**Response:** Updated Profile object

---

## What Your Frontend Sends

### Mock Auth Headers (During Testing)

```javascript
const token = localStorage.getItem('token');
// During mock mode, this is a fake JWT created by mock-auth.ts
// Format: header.payload.signature
// Payload contains: { sub: "hotelowner40@test.com", userId: 40, ... }

fetch('/api/v1/owner/hotels?status=Approved', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### When Real Login is Integrated

```javascript
// After real login completes, token is stored in same place
const token = localStorage.getItem('token');
// This is now a real JWT from your auth provider

// SAME CODE CONTINUES TO WORK - no frontend changes needed!
fetch('/api/v1/owner/hotels?status=Approved', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Testing the Setup

### Step 1: Assign owner_ids (SQL)
```sql
-- From: /Users/jathuja/TravelHUB/backend/assign_hotel_owners.sql
UPDATE hotels 
SET owner_id = CASE 
  WHEN (id % 2) = 0 THEN 40
  ELSE 42
END
WHERE owner_id IS NULL;
```

### Step 2: Start Backend
```bash
cd backend
mvn spring-boot:run
# Should start on http://localhost:8080
```

### Step 3: Start Frontend
```bash
cd frontend/hotelownerfrontend/hotelwelcome
npm run dev
# Mock auth initializes automatically with user 40
```

### Step 4: Test API Directly
```bash
# Get token from browser console
# localStorage.getItem('token')

# Test the endpoint
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8080/api/v1/owner/hotels?status=Approved

# Should return hotels for owner 40
```

---

## Database Verification

Before running the dashboard, verify:

```sql
-- 1. Check hotel owners exist
SELECT id, name, role FROM users WHERE id IN (40, 42);

-- 2. Check hotels have owner_ids
SELECT COUNT(*) FROM hotels WHERE owner_id IS NULL;
-- Should return 0 (after running assign script)

-- 3. Check distribution
SELECT owner_id, COUNT(*) FROM hotels GROUP BY owner_id;
-- Should show something like: 40 → 17 hotels, 42 → 17 hotels
```

---

## Error Handling

### If Dashboard Shows "No hotels"

1. Check database: `SELECT * FROM hotels WHERE owner_id = 40;`
2. Check API response: Open browser DevTools → Network tab → look for `/owner/hotels` request
3. Check JWT token: `localStorage.getItem('token')`

### If Getting 401 Unauthorized

1. Verify JWT exists and is valid
2. Verify backend is running on port 8080
3. Check CORS configuration in backend (should allow localhost:5173 or frontend origin)

### If Hotels Show But Status Wrong

Check database: 
```sql
SELECT id, hotel_name, application_status FROM hotels WHERE owner_id = 40;
```

---

## Future: When Real Login is Ready

Your login team needs to:

1. Store JWT in `localStorage.setItem('token', realToken)`
2. JWT must include `sub` field with user email
3. Everything else works automatically

No other changes needed. The frontend doesn't care if the JWT is fake or real - it just sends it to the backend, and the backend validates it the same way.

---

## Summary

**Current Testing Approach:**
- ✅ Mock JWT in localStorage
- ✅ Backend uses Principal from JWT
- ✅ Same workflow for real JWT later

**No Changes Needed To:**
- Backend code
- API contracts
- Database schema

**Easy Migration When Login Ready:**
- Change `MOCK_MODE = false` in mock-auth.ts
- Rest happens automatically

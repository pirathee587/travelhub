# Quick Start Guide - Admin API

## 📦 What Was Created

### 1. **API Layer** (`src/api/`)
- ✅ `axios.js` - Base configuration with interceptors
- ✅ `authApi.js` - Authentication endpoints
- ✅ `admin/` folder with 8 specialized API files
- ✅ Barrel exports for clean imports

### 2. **Custom Hooks** (`src/hooks/admin/`)
- ✅ `useAdminDashboard` - Dashboard data
- ✅ `useAdminUsers` - User management
- ✅ `useAdminHotels` - Hotel management
- ✅ `useAdminPackages` - Package management
- ✅ `useAdminAgents` - Agent management
- ✅ `useAdminBookings` - Booking management
- ✅ `useAdminPayments` - Payment management
- ✅ Barrel export for clean imports

### 3. **Configuration**
- ✅ `.env` file - API URL configuration
- ✅ `package.json` - axios dependency added

---

## 🚀 Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure API URL
Edit `.env`:
```env
VITE_API_URL=http://localhost:8080
```

### Step 3: Start Using in Components

#### Dashboard Example:
```jsx
import { useAdminDashboard } from '@/hooks/admin';

const Dashboard = () => {
    const { dashboard, loading, error } = useAdminDashboard();
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    
    return <div>Total Users: {dashboard?.totalUsers}</div>;
};
```

#### Agent Management Example:
```jsx
import { useAdminAgents } from '@/hooks/admin';

const AgentApprovals = () => {
    const { agents, approveAgent, rejectAgent, loading } = useAdminAgents();
    
    return (
        <div>
            {agents?.map(agent => (
                <div key={agent.id}>
                    <h3>{agent.name}</h3>
                    <button onClick={() => approveAgent(agent.id)}>Approve</button>
                    <button onClick={() => rejectAgent(agent.id, 'Not qualified')}>
                        Reject
                    </button>
                </div>
            ))}
        </div>
    );
};
```

---

## 📚 Available Hooks

| Hook | Methods | Use Case |
|------|---------|----------|
| `useAdminDashboard` | `refetch` | Dashboard stats & charts |
| `useAdminUsers` | `approveAgent`, `rejectAgent`, `toggleActive`, `deleteUser`, `refetch` | User management |
| `useAdminHotels` | `approveHotel`, `rejectHotel`, `deleteHotel`, `refetch` | Hotel approvals |
| `useAdminPackages` | `approvePackage`, `rejectPackage`, `deletePackage`, `refetch` | Package management |
| `useAdminAgents` | `approveAgent`, `rejectAgent`, `toggleActive`, `deleteAgent`, `refetch` | Agent management |
| `useAdminBookings` | `updateBookingStatus`, `refetch` | Booking management |
| `useAdminPayments` | `updatePaymentStatus`, `refetch` | Payment management |

---

## 🎯 All API Methods

### Authentication
```javascript
authApi.login(email, password)
authApi.register(data)
authApi.getMe()
authApi.forgotPassword(email)
authApi.resetPassword(token, newPassword)
```

### Dashboard
```javascript
adminDashboardApi.getDashboard()
```

### Users
```javascript
adminUserApi.getAllUsers()
adminUserApi.getUserById(id)
adminUserApi.getUsersByRole(role)
adminUserApi.searchUsers(keyword)
adminUserApi.getPendingAgents()
adminUserApi.approveAgent(id)
adminUserApi.rejectAgent(id, reason)
adminUserApi.toggleUserActive(id)
adminUserApi.deleteUser(id)
```

### Hotels
```javascript
adminHotelApi.getAllHotels()
adminHotelApi.getHotelsByStatus(status)
adminHotelApi.getHotelDetail(id)
adminHotelApi.approveHotel(id)
adminHotelApi.rejectHotel(id, reason)
adminHotelApi.deleteHotel(id)
adminHotelApi.viewNicPhotocopy(imageUrl)
```

### Packages
```javascript
adminPackageApi.getAllPackages()
adminPackageApi.getPackagesByStatus(status)
adminPackageApi.getPackageDetail(id)
adminPackageApi.approvePackage(id)
adminPackageApi.rejectPackage(id, reason)
adminPackageApi.togglePackageActive(id)
adminPackageApi.deletePackage(id)
```

### Agents
```javascript
adminAgentApi.getAllAgents()
adminAgentApi.getAgentsByStatus(status)
adminAgentApi.searchAgents(keyword)
adminAgentApi.getAgentDetail(id)
adminAgentApi.getAgentPackages(id)
adminAgentApi.getAgentStats(id)
adminAgentApi.getAgentRevenue(id, year)
adminAgentApi.getAgentTripStatus(id)
adminAgentApi.approveAgent(id)
adminAgentApi.rejectAgent(id, reason)
adminAgentApi.toggleAgentActive(id)
adminAgentApi.deleteAgent(id)
adminAgentApi.viewAgentNIC(imageUrl)
```

### Bookings
```javascript
adminBookingApi.getAllBookings()
adminBookingApi.getBookingById(id)
adminBookingApi.getBookingsByStatus(status)
adminBookingApi.updateBookingStatus(id, status)
```

### Payments
```javascript
adminPaymentApi.getPaymentStats()
adminPaymentApi.getAllPayments(type, status)
adminPaymentApi.getPaymentById(id)
adminPaymentApi.getPaymentsByStatus(status)
adminPaymentApi.getTotalRevenue()
adminPaymentApi.getPaymentsByBooking(bookingId)
adminPaymentApi.updatePaymentStatus(id, status)
```

### Analytics
```javascript
adminAnalyticsApi.getAgentStats(agentId)
adminAnalyticsApi.getAgentMonthlyRevenue(agentId, year)
adminAnalyticsApi.getAgentTripStatus(agentId)
```

---

## 🔑 Key Features

✅ **Automatic Authentication**: Token automatically added to all requests  
✅ **Error Handling**: Centralized error management with auto-logout on 401  
✅ **Loading States**: All hooks return loading state  
✅ **Error Messages**: Specific error messages from API  
✅ **Refetch**: Manual refresh with `refetch()` function  
✅ **TypeScript Ready**: Can be easily converted to TypeScript  
✅ **Barrel Exports**: Clean import statements  

---

## 💡 Import Patterns

```javascript
// Option 1: From barrel exports (Recommended)
import { useAdminDashboard, useAdminUsers } from '@/hooks/admin';
import { adminDashboardApi, adminUserApi } from '@/api/admin';

// Option 2: Direct imports
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';
import adminDashboardApi from '@/api/admin/adminDashboardApi';
```

---

## 🧪 Testing

Each hook returns:
- `data` / `{items}` - The fetched data
- `loading` - Boolean indicating loading state
- `error` - Error message if any
- `refetch()` - Function to manually refresh data
- Action methods (approve, reject, delete, etc.)

---

## 📖 Full Documentation

See `API_SETUP.md` for comprehensive documentation with examples.

---

## ✨ You're Ready!

Your API layer is now fully set up. Start building your admin features! 🎉

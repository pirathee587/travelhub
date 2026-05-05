# Frontend Admin API Setup

Complete API layer implementation for the Admin Portal with Axios integration, custom hooks, and centralized state management.

## 📁 Project Structure

```
src/
├── api/
│   ├── axios.js                    # Base axios config with interceptors
│   ├── authApi.js                  # Authentication endpoints
│   ├── index.js                    # API barrel export
│   └── admin/
│       ├── adminDashboardApi.js    # Dashboard data
│       ├── adminUserApi.js         # User management
│       ├── adminHotelApi.js        # Hotel management
│       ├── adminPackageApi.js      # Package management
│       ├── adminAgentApi.js        # Agent management
│       ├── adminBookingApi.js      # Booking management
│       ├── adminPaymentApi.js      # Payment management
│       ├── adminAnalyticsApi.js    # Analytics data
│       └── index.js                # Admin API barrel export
│
└── hooks/
    └── admin/
        ├── useAdminDashboard.js    # Dashboard data fetching
        ├── useAdminUsers.js        # User management hook
        ├── useAdminHotels.js       # Hotel management hook
        ├── useAdminPackages.js     # Package management hook
        ├── useAdminAgents.js       # Agent management hook
        ├── useAdminBookings.js     # Booking management hook
        ├── useAdminPayments.js     # Payment management hook
        └── index.js                # Hooks barrel export
```

## 🚀 Installation

### 1. Install Dependencies

Axios is already added to `package.json`. Install all dependencies:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

## 📋 API Layer Features

### Base Axios Configuration (`src/api/axios.js`)

- ✅ Centralized API endpoint configuration
- ✅ Automatic token injection in request headers
- ✅ Response error handling with 401 redirect
- ✅ 10-second timeout for all requests

**Key Features:**
```javascript
// Automatic Bearer token injection
api.interceptors.request.use(...) 

// Auto logout on 401 Unauthorized
api.interceptors.response.use(...)
```

### Authentication API (`src/api/authApi.js`)

```javascript
import authApi from '@/api/authApi';

// Login
const result = await authApi.login(email, password);

// Register
await authApi.register(userData);

// Get current user
const user = await authApi.getMe();

// Password reset
await authApi.forgotPassword(email);
await authApi.resetPassword(token, newPassword);
```

### Admin APIs (`src/api/admin/`)

#### Dashboard API
```javascript
import { adminDashboardApi } from '@/api/admin';

const dashboard = await adminDashboardApi.getDashboard();
```

#### User Management API
```javascript
import { adminUserApi } from '@/api/admin';

// Fetch
await adminUserApi.getAllUsers();
await adminUserApi.getUserById(id);
await adminUserApi.getUsersByRole('AGENT');
await adminUserApi.searchUsers(keyword);
await adminUserApi.getPendingAgents();

// Actions
await adminUserApi.approveAgent(id);
await adminUserApi.rejectAgent(id, reason);
await adminUserApi.toggleUserActive(id);
await adminUserApi.deleteUser(id);
```

#### Hotel Management API
```javascript
import { adminHotelApi } from '@/api/admin';

await adminHotelApi.getAllHotels();
await adminHotelApi.getHotelsByStatus('Pending');
await adminHotelApi.getHotelDetail(id);
await adminHotelApi.approveHotel(id);
await adminHotelApi.rejectHotel(id, reason);
await adminHotelApi.deleteHotel(id);
adminHotelApi.viewNicPhotocopy(imageUrl);
```

#### Package Management API
```javascript
import { adminPackageApi } from '@/api/admin';

await adminPackageApi.getAllPackages();
await adminPackageApi.getPackagesByStatus('Pending');
await adminPackageApi.getPackageDetail(id);
await adminPackageApi.approvePackage(id);
await adminPackageApi.rejectPackage(id, reason);
await adminPackageApi.togglePackageActive(id);
await adminPackageApi.deletePackage(id);
```

#### Agent Management API
```javascript
import { adminAgentApi } from '@/api/admin';

await adminAgentApi.getAllAgents();
await adminAgentApi.getAgentsByStatus('Pending');
await adminAgentApi.searchAgents(keyword);
await adminAgentApi.getAgentDetail(id);
await adminAgentApi.getAgentPackages(id);
await adminAgentApi.getAgentStats(id);
await adminAgentApi.getAgentRevenue(id, year);
await adminAgentApi.getAgentTripStatus(id);
await adminAgentApi.approveAgent(id);
await adminAgentApi.rejectAgent(id, reason);
await adminAgentApi.toggleAgentActive(id);
await adminAgentApi.deleteAgent(id);
adminAgentApi.viewAgentNIC(imageUrl);
```

#### Booking Management API
```javascript
import { adminBookingApi } from '@/api/admin';

await adminBookingApi.getAllBookings();
await adminBookingApi.getBookingById(id);
await adminBookingApi.getBookingsByStatus('pending');
await adminBookingApi.updateBookingStatus(id, 'confirmed');
```

#### Payment Management API
```javascript
import { adminPaymentApi } from '@/api/admin';

await adminPaymentApi.getPaymentStats();
await adminPaymentApi.getAllPayments(type, status);
await adminPaymentApi.getPaymentById(id);
await adminPaymentApi.getPaymentsByStatus('Completed');
await adminPaymentApi.getTotalRevenue();
await adminPaymentApi.getPaymentsByBooking(bookingId);
await adminPaymentApi.updatePaymentStatus(id, status);
```

#### Analytics API
```javascript
import { adminAnalyticsApi } from '@/api/admin';

await adminAnalyticsApi.getAgentStats(agentId);
await adminAnalyticsApi.getAgentMonthlyRevenue(agentId, year);
await adminAnalyticsApi.getAgentTripStatus(agentId);
```

## 🎣 Custom Hooks

### useAdminDashboard

```javascript
import { useAdminDashboard } from '@/hooks/admin';

const Dashboard = () => {
    const { dashboard, loading, error, refetch } = useAdminDashboard();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Total Users: {dashboard?.totalUsers}</h2>
            <h2>Total Agents: {dashboard?.totalAgents}</h2>
            <button onClick={refetch}>Refresh</button>
        </div>
    );
};
```

### useAdminUsers

```javascript
import { useAdminUsers } from '@/hooks/admin';

const UserManagement = () => {
    const {
        users,
        loading,
        error,
        approveAgent,
        rejectAgent,
        toggleActive,
        deleteUser,
        refetch
    } = useAdminUsers();

    const handleApprove = async (id) => {
        await approveAgent(id);
    };

    return (
        <div>
            {users?.map(user => (
                <div key={user.id}>
                    <span>{user.name}</span>
                    <button onClick={() => handleApprove(user.id)}>
                        Approve
                    </button>
                </div>
            ))}
        </div>
    );
};
```

### useAdminHotels

```javascript
import { useAdminHotels } from '@/hooks/admin';

const HotelManagement = () => {
    const {
        hotels,
        loading,
        error,
        approveHotel,
        rejectHotel,
        deleteHotel,
        refetch
    } = useAdminHotels();

    return (
        <div>
            {hotels?.map(hotel => (
                <div key={hotel.id}>
                    <h3>{hotel.name}</h3>
                    <button onClick={() => approveHotel(hotel.id)}>
                        Approve
                    </button>
                </div>
            ))}
        </div>
    );
};
```

### useAdminPackages

```javascript
import { useAdminPackages } from '@/hooks/admin';

const PackageManagement = () => {
    const {
        packages,
        loading,
        error,
        approvePackage,
        rejectPackage,
        deletePackage,
        refetch
    } = useAdminPackages();

    return (
        // Similar implementation
    );
};
```

### useAdminAgents

```javascript
import { useAdminAgents } from '@/hooks/admin';

const AgentManagement = () => {
    const {
        agents,
        loading,
        error,
        approveAgent,
        rejectAgent,
        toggleActive,
        deleteAgent,
        refetch
    } = useAdminAgents();

    return (
        // Similar implementation
    );
};
```

### useAdminBookings

```javascript
import { useAdminBookings } from '@/hooks/admin';

const BookingManagement = () => {
    const {
        bookings,
        loading,
        error,
        updateBookingStatus,
        refetch
    } = useAdminBookings();

    return (
        // Similar implementation
    );
};
```

### useAdminPayments

```javascript
import { useAdminPayments } from '@/hooks/admin';

const PaymentManagement = () => {
    const {
        payments,
        stats,
        loading,
        error,
        updatePaymentStatus,
        refetch
    } = useAdminPayments();

    return (
        <div>
            <div>Revenue: {stats?.totalRevenue}</div>
            <div>Pending: {stats?.pendingPayments}</div>
            {payments?.map(payment => (
                <div key={payment.id}>
                    {payment.amount}
                </div>
            ))}
        </div>
    );
};
```

## 💡 Usage Examples

### Example 1: Dashboard Page

```javascript
// pages/Dashboard.jsx
import { useAdminDashboard } from '@/hooks/admin';

const Dashboard = () => {
    const { dashboard, loading, error } = useAdminDashboard();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-6">
            <div className="grid grid-cols-4 gap-4">
                <StatsCard 
                    title="Total Users" 
                    value={dashboard?.totalUsers} 
                />
                <StatsCard 
                    title="Total Agents" 
                    value={dashboard?.totalAgents} 
                />
                <StatsCard 
                    title="Total Hotels" 
                    value={dashboard?.totalHotels} 
                />
                <StatsCard 
                    title="Monthly Revenue" 
                    value={`$${dashboard?.monthlyRevenue}`} 
                />
            </div>

            {/* Pending Approvals */}
            <div className="mt-6">
                <h2 className="text-xl font-bold">Pending Approvals</h2>
                <div className="grid grid-cols-4 gap-4">
                    <Badge label="Pending Agents" count={dashboard?.pendingAgents} />
                    <Badge label="Pending Hotels" count={dashboard?.pendingHotels} />
                    <Badge label="Pending Packages" count={dashboard?.pendingPackages} />
                    <Badge label="Pending Bookings" count={dashboard?.pendingBookings} />
                </div>
            </div>

            {/* Charts */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <Chart data={dashboard?.trendData} />
                <Chart data={dashboard?.revenueData} />
            </div>
        </div>
    );
};
```

### Example 2: Agent Approval Page

```javascript
// pages/AgentApprovals.jsx
import { useAdminUsers } from '@/hooks/admin';
import { useState } from 'react';

const AgentApprovals = () => {
    const { users, loading, approveAgent, rejectAgent } = useAdminUsers();
    const [rejectReason, setRejectReason] = useState('');

    const pendingAgents = users.filter(u => u.status === 'pending');

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Agent Approvals</h1>
            
            {pendingAgents.map(agent => (
                <div key={agent.id} className="border p-4 rounded mb-4">
                    <h3>{agent.name}</h3>
                    <p>{agent.email}</p>
                    
                    <button 
                        onClick={() => approveAgent(agent.id)}
                        className="bg-green-500 px-4 py-2 rounded"
                    >
                        Approve
                    </button>
                    
                    <button 
                        onClick={() => rejectAgent(agent.id, rejectReason)}
                        className="bg-red-500 px-4 py-2 rounded ml-2"
                    >
                        Reject
                    </button>
                </div>
            ))}
        </div>
    );
};
```

## 🔒 Authentication Flow

1. **Login** → Token stored in localStorage
2. **Axios Interceptor** → Automatically adds Bearer token to requests
3. **API Call** → Request includes Authorization header
4. **401 Response** → Auto logout and redirect to login
5. **New Login** → New token retrieved

## 🛠️ Development Tips

### Import Patterns

```javascript
// Option 1: Direct import
import adminDashboardApi from '@/api/admin/adminDashboardApi';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

// Option 2: Barrel export (cleaner)
import { adminDashboardApi } from '@/api/admin';
import { useAdminDashboard } from '@/hooks/admin';
```

### Error Handling

All hooks return an `error` state that contains error messages from the API:

```javascript
const { users, error } = useAdminUsers();

if (error) {
    showNotification(error, 'error');
}
```

### Manual Refetch

All hooks provide a `refetch` function for manual data refresh:

```javascript
const { dashboard, refetch } = useAdminDashboard();

const handleRefresh = async () => {
    await refetch();
};
```

## 📝 Notes

- All API calls include automatic Bearer token authentication
- Unauthorized requests (401) trigger automatic logout
- All errors are centralized through the axios interceptor
- Custom hooks handle loading states and error management
- Token is stored in localStorage under the key `token`

## 🔄 Next Steps

1. Run `npm install` to install dependencies
2. Configure your backend API URL in `.env`
3. Import hooks in your components
4. Start building your admin features!

# 📚 Frontend Admin API - Complete Reference

## 🎯 Start Here

**New to this setup?** → Read `QUICK_START.md`  
**Need comprehensive docs?** → Read `API_SETUP.md`  
**Want code examples?** → See `EXAMPLES.jsx`  
**Have problems?** → Check `TROUBLESHOOTING.md`  
**Need verification?** → See `VERIFICATION_CHECKLIST.md`  

---

## 📖 Documentation Guide

| Document | Purpose | Audience |
|----------|---------|----------|
| **QUICK_START.md** | 5-minute overview | Everyone |
| **API_SETUP.md** | Complete API reference | Developers |
| **EXAMPLES.jsx** | Real-world usage | Component developers |
| **TROUBLESHOOTING.md** | Problem solving | Debugging |
| **VERIFICATION_CHECKLIST.md** | Setup validation | Verification |
| **SETUP_COMPLETE.md** | Overview of changes | Project managers |

---

## 🚀 Quick Start (30 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Configure backend URL
# Edit .env: VITE_API_URL=http://localhost:8080

# 3. Use in component
import { useAdminDashboard } from '@/hooks/admin';

const Dashboard = () => {
    const { dashboard, loading } = useAdminDashboard();
    return <div>{dashboard?.totalUsers}</div>;
};
```

---

## 📦 What's Included

### **API Layer** (8 + 2 files)
- Authentication API
- 8 Admin APIs (Dashboard, Users, Hotels, Packages, Agents, Bookings, Payments, Analytics)

### **Custom Hooks** (7 files)
- All hooks return: `{ data, loading, error, actions, refetch }`

### **Configuration**
- `.env` - Backend URL
- `package.json` - Dependencies (axios added)

### **Documentation** (5 guides)
- Setup, examples, troubleshooting, verification

---

## 🎯 Common Tasks

### Fetch Data
```javascript
import { useAdminUsers } from '@/hooks/admin';

const { users, loading, error } = useAdminUsers();
```

### Perform Action
```javascript
const { approveAgent } = useAdminAgents();
await approveAgent(agentId);
```

### Handle Errors
```javascript
if (error) {
    console.error(error);
    showNotification(error);
}
```

### Refresh Data
```javascript
const { refetch } = useAdminDashboard();
await refetch();
```

---

## 📋 File Structure

```
Frontend Admin/
├── src/
│   ├── api/
│   │   ├── axios.js                 (Base config)
│   │   ├── authApi.js               (Auth endpoints)
│   │   ├── index.js                 (Barrel export)
│   │   └── admin/                   (8 admin APIs)
│   │
│   ├── hooks/
│   │   └── admin/                   (7 custom hooks)
│   │
│   └── (existing files)
│
├── .env                             (API URL config)
├── package.json                     (axios added)
│
├── QUICK_START.md                   (⭐ Start here)
├── API_SETUP.md                     (Complete reference)
├── EXAMPLES.jsx                     (Code examples)
├── TROUBLESHOOTING.md               (Problem solving)
├── VERIFICATION_CHECKLIST.md        (Setup validation)
└── SETUP_COMPLETE.md                (Overview)
```

---

## 🎨 Import Patterns

### Pattern 1: Barrel Exports (Recommended)
```javascript
import { 
    useAdminDashboard, 
    useAdminUsers,
    useAdminAgents 
} from '@/hooks/admin';

import { 
    adminDashboardApi, 
    adminUserApi 
} from '@/api/admin';
```

### Pattern 2: Direct Imports
```javascript
import useAdminDashboard from '@/hooks/admin/useAdminDashboard';
import adminDashboardApi from '@/api/admin/adminDashboardApi';
```

---

## 🔑 Features

✅ **Automatic Authentication** - Token auto-injected into requests  
✅ **Error Handling** - Centralized error management  
✅ **Loading States** - Built-in loading indicators  
✅ **Auto Logout** - 401 redirects to login  
✅ **Refetch** - Manual data refresh capability  
✅ **Clean Exports** - Barrel exports for readability  
✅ **TypeScript Ready** - Easy to add types  
✅ **Production Ready** - Follows best practices  

---

## 📊 API Overview

| Endpoint | Methods | Status |
|----------|---------|--------|
| Authentication | 5 | ✅ Ready |
| Dashboard | 1 | ✅ Ready |
| Users | 8 | ✅ Ready |
| Hotels | 7 | ✅ Ready |
| Packages | 7 | ✅ Ready |
| Agents | 11 | ✅ Ready |
| Bookings | 4 | ✅ Ready |
| Payments | 7 | ✅ Ready |
| Analytics | 3 | ✅ Ready |
| **Total** | **53** | **✅ Ready** |

---

## 🎯 Common Use Cases

### Dashboard
```javascript
import { useAdminDashboard } from '@/hooks/admin';

const Dashboard = () => {
    const { dashboard, loading } = useAdminDashboard();
    return <div>Stats: {dashboard?.totalUsers}</div>;
};
```

### Approvals
```javascript
import { useAdminAgents } from '@/hooks/admin';

const { agents, approveAgent, rejectAgent } = useAdminAgents();
await approveAgent(id);
await rejectAgent(id, reason);
```

### Payments
```javascript
import { useAdminPayments } from '@/hooks/admin';

const { payments, stats, updatePaymentStatus } = useAdminPayments();
await updatePaymentStatus(id, 'Completed');
```

---

## 🔧 Setup Checklist

- [ ] Run `npm install`
- [ ] Configure `.env` with API URL
- [ ] Start dev server: `npm run dev`
- [ ] Import first hook in a component
- [ ] Verify data loads in DevTools
- [ ] Check Network tab for Authorization header
- [ ] Test an action (approve, delete, etc.)

---

## 🚀 Next Steps

1. **Read** → `QUICK_START.md` (5 mins)
2. **Review** → `EXAMPLES.jsx` (code patterns)
3. **Implement** → Start using hooks in components
4. **Debug** → Use `TROUBLESHOOTING.md` if needed
5. **Reference** → `API_SETUP.md` for complete API docs

---

## 📞 Need Help?

1. **Simple question?** → Check `QUICK_START.md`
2. **Need details?** → See `API_SETUP.md`
3. **Got an error?** → Check `TROUBLESHOOTING.md`
4. **Code examples?** → See `EXAMPLES.jsx`
5. **Still stuck?** → Review `VERIFICATION_CHECKLIST.md`

---

## ✨ You're Ready!

Everything is configured and ready to use.  
**Start building amazing admin features!** 🎉

---

## 📝 Quick Reference

**All Hooks:** `useAdminDashboard`, `useAdminUsers`, `useAdminHotels`, `useAdminPackages`, `useAdminAgents`, `useAdminBookings`, `useAdminPayments`

**All APIs:** `adminDashboardApi`, `adminUserApi`, `adminHotelApi`, `adminPackageApi`, `adminAgentApi`, `adminBookingApi`, `adminPaymentApi`, `adminAnalyticsApi`, `authApi`

**Key Method Pattern:**
```javascript
const { data, loading, error, actionMethod, refetch } = useCustomHook();
```

**Action Pattern:**
```javascript
await actionMethod(id, ...args);  // Auto refetches data
```

---

🚀 **Happy Coding!**

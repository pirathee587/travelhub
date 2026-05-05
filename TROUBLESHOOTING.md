# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## 🚨 Import Errors

### Issue: "Module not found: @/hooks/admin"
**Cause:** Vite alias not configured for `@` symbol

**Solution:**
1. Check your `vite.config.mjs` has resolve alias configured:
```javascript
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

2. Or use relative imports:
```javascript
import { useAdminDashboard } from '../../../hooks/admin'
```

---

### Issue: "Cannot find module 'axios'"
**Cause:** Axios not installed

**Solution:**
```bash
npm install axios
```

Verify in `package.json`:
```json
"dependencies": {
  "axios": "^1.6.0"
}
```

---

## 🔐 Authentication Issues

### Issue: "401 Unauthorized - Always redirect to login"
**Cause:** Token not being stored or sent correctly

**Solution:**
1. Check that login API stores token in localStorage:
```javascript
// After successful login
localStorage.setItem('token', response.data.token);
```

2. Verify token format in DevTools:
```javascript
localStorage.getItem('token')
// Should return: eyJhbGciOiJIUzI1NiIs...
```

3. Check Authorization header in Network tab:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### Issue: "Token keeps getting cleared"
**Cause:** Server returning 401 status

**Solution:**
1. Check backend is issuing valid tokens
2. Verify token hasn't expired
3. Check backend CORS settings
4. Ensure Authorization header format is exactly: `Bearer <token>`

---

### Issue: "Login works but hooks show 401 error"
**Cause:** Token stored but not sent by axios

**Solution:**
Verify axios interceptor in `src/api/axios.js`:
```javascript
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
```

---

## 🌐 API Connection Issues

### Issue: "Cannot reach API - CORS error"
**Cause:** Backend not configured for CORS

**Solution:**
1. Add CORS headers on backend:
```python
# If using Express.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

2. Or verify `.env` URL is correct:
```env
VITE_API_URL=http://localhost:8080
```

---

### Issue: "Cannot GET /api/admin/dashboard"
**Cause:** Wrong API URL or missing endpoint

**Solution:**
1. Check `.env` configuration:
```env
VITE_API_URL=http://localhost:8080
# Not: http://localhost:8080/api
# Not: http://localhost:8080/
```

2. Verify backend has `/api/admin/dashboard` endpoint

3. Check Network tab to see actual URL being called:
```
GET http://localhost:8080/api/admin/dashboard
```

---

### Issue: "Request timeout after 10 seconds"
**Cause:** Backend is slow or not responding

**Solution:**
1. Check backend is running
2. Increase timeout in `src/api/axios.js`:
```javascript
const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 30000,  // Increased from 10000
});
```

3. Check backend logs for errors

---

## 💾 State & Data Issues

### Issue: "Hook returns null/empty data"
**Cause:** Data not loaded yet or API returned empty

**Solution:**
1. Always check loading state first:
```javascript
const { data, loading, error } = useAdminUsers();

if (loading) return <p>Loading...</p>;
if (!data || data.length === 0) return <p>No data</p>;
```

2. Check error state:
```javascript
if (error) {
    console.log('Error:', error);
    return <p>Error: {error}</p>;
}
```

---

### Issue: "Data doesn't update after action"
**Cause:** Not calling refetch after action

**Solution:**
Most hooks automatically refetch after actions, but if not:
```javascript
const { users, refetch, deleteUser } = useAdminUsers();

const handleDelete = async (id) => {
    await deleteUser(id);
    // Data automatically refetches, but you can also:
    await refetch();
};
```

---

### Issue: "Old data showing after refresh"
**Cause:** Cache not cleared

**Solution:**
1. Clear browser cache
2. Use hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check DevTools → Application → Clear All

---

## 🐛 Development Issues

### Issue: "Changes not reflecting in browser"
**Cause:** Hot reload not working

**Solution:**
1. Check Vite is running: `npm run dev`
2. Restart development server:
```bash
npm run dev
```

3. Hard refresh browser: `Ctrl+Shift+R`

---

### Issue: "Hooks not re-rendering"
**Cause:** Component not properly consuming hook

**Solution:**
1. Ensure hook is called at component level (not conditionally):
```javascript
// ❌ Wrong
if (someCondition) {
    const { data } = useAdminUsers();
}

// ✅ Correct
const { data } = useAdminUsers();
if (someCondition) {
    // use data
}
```

2. Check component is actually using the returned data

---

### Issue: "Console errors about missing dependencies"
**Cause:** Dependencies not installed

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📊 Specific Hook Issues

### useAdminDashboard returning null
**Solution:**
```javascript
const { dashboard, loading, error, refetch } = useAdminDashboard();

console.log('Loading:', loading);
console.log('Error:', error);
console.log('Dashboard:', dashboard);

// If null, check if endpoint returns data
// Expected format: { data: { totalUsers: 100, ... } }
```

---

### useAdminUsers not showing pending agents
**Solution:**
```javascript
const { users, loading } = useAdminUsers();

// Filter pending agents yourself
const pendingAgents = users?.filter(u => u.status === 'pending');

// Or verify API returns correct status values
// Expected: { status: 'pending', role: 'AGENT' }
```

---

### useAdminPayments not filtering
**Solution:**
Make sure to call with correct parameters:
```javascript
const { payments, refetch } = useAdminPayments();

// Call with explicit filters
await refetch('Payment', 'Completed');

// Check Network tab to verify query params:
// GET /api/admin/payments?type=Payment&status=Completed
```

---

## 🛠️ Debugging Tips

### Enable Verbose Logging
Add this to your component:
```javascript
const { data, loading, error } = useAdminUsers();

useEffect(() => {
    console.log('Data:', data);
    console.log('Loading:', loading);
    console.log('Error:', error);
}, [data, loading, error]);
```

### Check API Response Format
In DevTools Network tab:
1. Find API call
2. Click on it
3. Go to Response tab
4. Verify structure matches expected format

Expected format:
```json
{
    "success": true,
    "data": {
        "items": [...]
    }
}
```

### Monitor localStorage
```javascript
// In DevTools Console
localStorage.getItem('token')
localStorage.getItem('user')

// Clear if needed
localStorage.removeItem('token')
localStorage.clear()
```

### Check Interceptor Working
```javascript
// Add to axios.js
api.interceptors.request.use((config) => {
    console.log('Request URL:', config.url);
    console.log('Headers:', config.headers);
    return config;
});
```

---

## 🔄 Reset & Recovery

### Complete Reset
```bash
# Stop dev server (Ctrl+C)
npm install  # Reinstall dependencies
npm run dev  # Start fresh
```

### Clear All Data
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Test API Connection
```javascript
// In browser console
import api from './src/api/axios.js'
api.get('/admin/dashboard').then(r => console.log(r))
```

---

## 📞 When All Else Fails

### Checklist:
1. ✅ Is dev server running? (`npm run dev`)
2. ✅ Is backend running? (Check URL in `.env`)
3. ✅ Is token stored? (`localStorage.getItem('token')`)
4. ✅ Are dependencies installed? (`npm install`)
5. ✅ Are there console errors? (DevTools F12)
6. ✅ Are there network errors? (Network tab)
7. ✅ Is API endpoint correct? (Network tab URL)
8. ✅ Is response format correct? (Response tab)

### Still Not Working?
1. Clear browser cache
2. Restart dev server
3. Restart backend
4. Check backend logs
5. Verify network connectivity
6. Try in incognito mode (bypasses cache)

---

## 🆘 Getting Help

When reporting issues, include:
- Console errors (full error message)
- Network tab screenshot
- `.env` configuration (sanitized)
- Component code that's failing
- Backend response (if available)
- Steps to reproduce

---

Good luck! 🚀

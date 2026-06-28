# Chatbot Dynamic Data - Deployment Checklist

## Pre-Deployment Verification

### Backend (Spring Boot)
- [ ] `ChatbotSyncListener.java` file exists in `backend/src/main/java/com/travelhub/backend/listener/`
- [ ] `PackageController.java` has `getChatbotData()` endpoint
- [ ] `HotelController.java` has `getChatbotData()` endpoint
- [ ] `PackageService.java` has `getChatbotPackages()` method
- [ ] `HotelService.java` has `getChatbotHotels()` method
- [ ] `application.properties` includes `chatbot.service.url=http://localhost:8001`
- [ ] RestTemplate is configured (RestTemplateConfig.java exists)
- [ ] No compilation errors: `mvn clean compile`

### Python Chatbot
- [ ] `main.py` has `@app.post("/notify-update")` endpoint
- [ ] `main.py` imports `datetime` module
- [ ] Auto-sync interval is **5 minutes** (not 30)
- [ ] `data_sync.py` has improved error handling with `.raise_for_status()`
- [ ] `data_sync.py` calls `/api/packages/chatbot-data` endpoint
- [ ] `data_sync.py` calls `/api/hotels/chatbot-data` endpoint
- [ ] No dependencies need to be added (all in requirements.txt)

---

## Deployment Steps

### Step 1: Deploy Backend
```bash
cd backend

# Verify compilation
mvn clean compile

# Build package
mvn clean package -DskipTests

# Deploy (redeploy Spring Boot application)
# Restart service if necessary
```

**Verify:**
```bash
curl http://localhost:8080/api/packages/chatbot-data | head -c 200
curl http://localhost:8080/api/hotels/chatbot-data | head -c 200
```

Expected: JSON array with package/hotel data

### Step 2: Restart Python Chatbot
```bash
cd chatbot-service

# Stop current service
pkill -f "uvicorn main:app"

# Start service
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

**Verify:**
```bash
curl http://localhost:8001/health
```

Expected: `{"status":"ok","service":"TravelHUB Chatbot"}`

### Step 3: Verify Real-Time Integration
1. Open admin panel
2. Create a new package or update a hotel
3. Watch backend logs for:
   ```
   [ChatbotSync] ✅ Chatbot notified
   ```
4. Watch Python logs for:
   ```
   [Notify] Real-time update received
   [Sync] ✅ Fetched X packages from database
   ```
5. Ask chatbot about the new/updated item → should know about it ✅

---

## Production Configuration

### Change `chatbot.service.url` for Production

**Local Development:**
```properties
chatbot.service.url=http://localhost:8001
```

**Docker/Kubernetes:**
```properties
chatbot.service.url=http://chatbot-service:8001
```

**Production (Remote):**
```properties
chatbot.service.url=https://chatbot.yourdomain.com
```

Or use environment variable:
```bash
export CHATBOT_SERVICE_URL=http://chatbot-service:8001
```

In `application.properties`:
```properties
chatbot.service.url=${CHATBOT_SERVICE_URL:http://localhost:8001}
```

---

## Rollback Plan

If issues occur after deployment:

### Quick Rollback (Keep running with fallback)
1. No deployment needed - system has built-in fallback
2. If push notifications fail, auto-sync will run every 5 minutes
3. Chatbot will still have fresh data (just slightly delayed)

### Full Rollback
1. Disable ChatbotSyncListener: Comment out `@Component` annotation
2. Restart backend
3. System falls back to 5-minute auto-sync only
4. No loss of functionality, just less real-time

### Revert to Original (30-min sync)
1. In `main.py`, change `minutes=5` back to `minutes=30`
2. Restart Python service
3. System operates as before

---

## Monitoring

### Key Metrics to Monitor

1. **Sync Success Rate**
   - Expected: ~99%+ successful syncs
   - Location: Backend logs `[ChatbotSync]` and Python logs `[Sync]`

2. **Sync Latency**
   - Push-based: Should be < 2 seconds
   - Auto-sync: Every 5 minutes maximum
   - Location: Timestamp in logs

3. **Data Freshness**
   - Expected: Chatbot always has latest data
   - Verify: Ask chatbot about recently created/updated item

### Log Locations

**Backend:**
```bash
# Watch real-time push notifications
tail -f application.log | grep "[ChatbotSync]"
```

**Python:**
```bash
# Watch sync operations
tail -f chatbot.log | grep "[Sync]"
tail -f chatbot.log | grep "[Notify]"
```

---

## Troubleshooting

### Push Notifications Not Working

**Check:**
```bash
# Backend can reach Python service
curl -X POST http://localhost:8001/notify-update -H "Content-Type: application/json" -d '{"test": "data"}'

# Expected: {"status":"Update synced immediately","timestamp":"..."}
```

**If fails:**
1. Verify Python service is running: `curl http://localhost:8001/health`
2. Check firewall allows port 8001
3. Check network connectivity between servers
4. Review backend logs for error details

### Chatbot Not Finding New Data

**Check:**
```bash
# Test endpoint directly
curl http://localhost:8080/api/packages/chatbot-data | jq '.[] | .packageName'

# Expected: Your recently created package should be in list
```

**If not found:**
1. Verify package is approved/active in admin panel
2. Check database directly
3. Restart backend to clear any caching

### Sync Takes Too Long

**Expected times:**
- Push-based: < 2 seconds
- Auto-sync: Runs instantly if on schedule
- Embedding: 5-30 seconds depending on data volume

**If slower:**
1. Monitor network latency between backend and Python
2. Check Python service CPU/memory
3. Check embedding model performance (`sentence-transformers`)

---

## Success Criteria

After deployment, verify:

✅ Backend endpoints exist:
- GET `/api/packages/chatbot-data` returns JSON
- GET `/api/hotels/chatbot-data` returns JSON

✅ Python service running:
- POST `/notify-update` triggers sync
- GET `/health` returns ok status

✅ Real-time integration working:
- Create new package → backend logs show notification
- Backend logs show notification → Python logs show sync
- Chatbot immediately knows about new package

✅ Fallback working:
- Disable push notifications (restart without ChatbotSyncListener)
- Wait 5 minutes
- Verify chatbot has latest data

✅ Performance acceptable:
- Real-time push < 2 seconds latency
- Auto-sync every 5 minutes
- No data older than 5 minutes in chatbot

---

## Support

For issues, check:
1. `CHATBOT_DYNAMIC_DATA_IMPLEMENTATION.md` - Full technical guide
2. Backend logs: `[ChatbotSync]` and `[Sync]` tags
3. Python logs: Same tags
4. Verify all files from "Backend (Spring Boot)" section are deployed


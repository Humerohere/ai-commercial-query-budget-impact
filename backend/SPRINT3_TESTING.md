# Sprint 3 Testing Guide: Commercial Query Review Workflow

This guide provides comprehensive testing instructions for Sprint 3 features.

## Prerequisites

1. **Backend Running:**
   ```bash
   cd backend
   python -m app.main
   ```
   Backend should be running on `http://localhost:8000`

2. **Frontend Running:**
   ```bash
   cd frontend
   pnpm run dev
   ```
   Frontend should be running on `http://localhost:5173`

3. **User Account:**
   - Create an account at `http://localhost:5173/login`
   - Or use existing credentials from Sprint 1

## Backend API Testing

### Test 1: Update Single Query Status

**Endpoint:** `PATCH /api/v1/scripts/{script_id}/queries/{query_id}`

**Steps:**
1. First, create a script and analyze it (from Sprint 2):
   ```bash
   # Login
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=test@example.com&password=testpass123"
   
   # Save the access_token from response
   
   # Create script
   curl -X POST http://localhost:8000/api/v1/scripts \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "John walks into a coffee shop and orders a latte. He opens his laptop and starts working.",
       "params": {
         "targetProductionBudget": 50000,
         "targetAudience": "millennials",
         "creativeFlexibility": "minor-dialogue-changes"
       }
     }'
   
   # Save the script id from response
   
   # Analyze script
   curl -X POST http://localhost:8000/api/v1/scripts/SCRIPT_ID/analyze \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Save a query id from response
   ```

2. Update query status to "accepted":
   ```bash
   curl -X PATCH http://localhost:8000/api/v1/scripts/SCRIPT_ID/queries/QUERY_ID \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "accepted"}'
   ```

**Expected Response:**
```json
{
  "id": "query_id",
  "script_id": "script_id",
  "term": "coffee",
  "type": "product",
  "reason": "CPG category; high advertiser demand",
  "estimated_revenue": 5000.0,
  "status": "accepted",
  "script_excerpt": "...walks into a coffee shop and orders...",
  "start_index": 15,
  "end_index": 21,
  "confidence_score": 85,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:05:00Z"
}
```

**Error Cases to Test:**
- Invalid script ID → 400 Bad Request
- Non-existent script → 404 Not Found
- Script owned by another user → 403 Forbidden
- Invalid query ID → 400 Bad Request
- Non-existent query → 404 Not Found
- Query doesn't belong to script → 404 Not Found
- Invalid status value → 400 Bad Request
- Missing auth token → 401 Unauthorized

### Test 2: Bulk Update Query Statuses

**Endpoint:** `PATCH /api/v1/scripts/{script_id}/queries/bulk`

**Steps:**
1. Using the script from Test 1 (should have multiple queries):
   ```bash
   curl -X PATCH http://localhost:8000/api/v1/scripts/SCRIPT_ID/queries/bulk \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "updates": [
         {"id": "QUERY_ID_1", "status": "accepted"},
         {"id": "QUERY_ID_2", "status": "rejected"},
         {"id": "QUERY_ID_3", "status": "accepted"}
       ]
     }'
   ```

**Expected Response:**
```json
{
  "updated_count": 3,
  "queries": [
    {
      "id": "query_id_1",
      "script_id": "script_id",
      "term": "coffee",
      "status": "accepted",
      ...
    },
    {
      "id": "query_id_2",
      "script_id": "script_id",
      "term": "laptop",
      "status": "rejected",
      ...
    },
    {
      "id": "query_id_3",
      "script_id": "script_id",
      "term": "shop",
      "status": "accepted",
      ...
    }
  ]
}
```

**Error Cases to Test:**
- Invalid script ID → 400 Bad Request
- Non-existent script → 404 Not Found
- Script owned by another user → 403 Forbidden
- Empty updates array → Returns `{"updated_count": 0, "queries": []}`
- Invalid query IDs in updates → Skips those queries, updates valid ones
- Missing auth token → 401 Unauthorized

**Resilience Test:**
```bash
# Test with mix of valid and invalid query IDs
curl -X PATCH http://localhost:8000/api/v1/scripts/SCRIPT_ID/queries/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"id": "VALID_QUERY_ID", "status": "accepted"},
      {"id": "INVALID_QUERY_ID", "status": "rejected"},
      {"id": "ANOTHER_VALID_ID", "status": "accepted"}
    ]
  }'
```
Should update only valid queries and skip invalid ones.

## Frontend End-to-End Testing

### Test 3: Complete Workflow

**Steps:**

1. **Login:**
   - Navigate to `http://localhost:5173/login`
   - Login with your credentials
   - Should redirect to main page

2. **Submit Script:**
   - Enter a script with commercial terms:
     ```
     Sarah walks into a coffee shop and orders a latte. She opens her laptop 
     and starts working on her presentation. Her phone rings - it's about the 
     wedding planning meeting. She needs to pick up makeup from the store later.
     ```
   - Set parameters:
     - Target Budget: $50,000
     - Target Audience: "millennials"
     - Creative Flexibility: "Minor dialogue changes"
   - Click "Analyze Script"
   - Should show loading spinner
   - Should transition to review stage

3. **Review Queries:**
   - Should see detected queries (coffee, laptop, phone, wedding, makeup)
   - Toggle some queries to "accepted" (green checkmark)
   - Leave some as "rejected" (red X)
   - Click "Calculate Budget Impact"
   - Should show loading spinner
   - Should transition to dashboard

4. **View Dashboard:**
   - Should see budget impact calculations
   - Should see only accepted queries in the list
   - Revenue should reflect only accepted queries

5. **Test Persistence:**
   - Refresh the page during review stage
   - Should reload queries from backend
   - Query statuses should persist

### Test 4: Error Handling

**Test 4.1: Session Expiration**
1. Login and submit a script
2. Clear localStorage auth_token manually (browser dev tools)
3. Try to review queries
4. Should show "Session expired" error
5. Should redirect to login page

**Test 4.2: Network Errors**
1. Stop the backend server
2. Try to submit a script
3. Should show error message
4. Should stay on input stage
5. Restart backend and try again - should work

**Test 4.3: Invalid Data**
1. Submit a script with no commercial terms
2. Should still work, but show 0 queries
3. Should be able to proceed to dashboard with 0 revenue

### Test 5: Loading States

**Verify loading indicators appear during:**
1. Script submission (after clicking "Analyze Script")
2. Query analysis (waiting for backend)
3. Bulk update (after clicking "Calculate Budget Impact")

**Verify buttons are disabled during loading:**
1. Cannot submit script twice
2. Cannot click "Calculate Budget Impact" twice

### Test 6: Data Flow Verification

**Using Browser DevTools Network Tab:**

1. **Script Submission:**
   - Should see POST to `/api/v1/scripts`
   - Response should include `id`, `title`, `created_at`
   - Should see POST to `/api/v1/scripts/{id}/analyze`
   - Response should include `queries` array

2. **Query Review:**
   - Should see PATCH to `/api/v1/scripts/{id}/queries/bulk`
   - Request body should include `updates` array
   - Response should include `updated_count` and `queries` array

3. **Auth Token:**
   - All requests should include `Authorization: Bearer TOKEN` header
   - Verify in Network tab → Headers

## Success Criteria Checklist

### Backend
- [ ] Single query update endpoint works correctly
- [ ] Bulk update endpoint updates multiple queries efficiently
- [ ] Ownership verification prevents unauthorized access
- [ ] Invalid query IDs are skipped gracefully
- [ ] Status validation works (only accepts valid statuses)
- [ ] Timestamps are updated correctly

### Frontend
- [ ] Script submission uses real API (no mock data)
- [ ] Query analysis fetches from backend
- [ ] Bulk update sends all query statuses
- [ ] Error messages are user-friendly
- [ ] Loading states prevent duplicate submissions
- [ ] Auth token automatically added to requests
- [ ] 401 errors redirect to login
- [ ] 403/404/500 errors show appropriate messages
- [ ] Query statuses persist in database
- [ ] End-to-end workflow is functional

### Integration
- [ ] Frontend and backend data formats match
- [ ] No console errors during normal operation
- [ ] localStorage cleared on reset
- [ ] Page refresh maintains state (when appropriate)

## Common Issues and Solutions

### Issue: "Session expired" immediately after login
**Solution:** Check that auth token is being stored in localStorage and included in requests

### Issue: Queries not updating
**Solution:** Verify script_id and query_ids are correct, check backend logs

### Issue: CORS errors
**Solution:** Ensure backend CORS middleware is configured correctly

### Issue: 404 on API calls
**Solution:** Verify API_BASE_URL is correct in frontend config

### Issue: Queries show as pending after update
**Solution:** Check that bulk update response is being used to update state

## Next Steps

After completing Sprint 3 testing:
1. Verify all success criteria are met
2. Document any bugs found
3. Proceed to Sprint 4 (Budget Dashboard enhancements)
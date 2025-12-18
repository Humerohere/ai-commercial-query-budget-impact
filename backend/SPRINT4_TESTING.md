# Sprint 4 Testing Guide: Budget Calculation & Report

This guide provides testing instructions for Sprint 4 features (Budget Analysis).

## Prerequisites

1. **Backend Running:**
   ```bash
   cd backend
   python -m app.main
   ```
   Backend should be running on `http://localhost:8000`

2. **User Account & Script:**
   - You need a valid JWT token (login).
   - You need a script ID that has analyzed queries.
   - You need to have accepted some queries for that script.

## Backend API Testing

### Test 1: Calculate Budget Impact

**Endpoint:** `POST /api/v1/scripts/{script_id}/budget`

**Steps:**
1. **Login** to get a token.
2. **Create a script** (if not exists).
3. **Analyze the script** to generate queries.
4. **Accept** at least one query (using the PATCH endpoint from Sprint 3 or manually via mongo/frontend).
5. **Run Calculation:**

   ```bash
   curl -X POST http://localhost:8000/api/v1/scripts/SCRIPT_ID/budget \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json"
   ```

**Expected Response (200 OK):**
```json
{
  "id": "budget_id",
  "script_id": "script_id",
  "baseline_adsense_revenue": 50000.0,
  "potential_sponsorship_revenue": 5000.0,
  "total_projected_revenue": 55000.0,
  "production_budget": 100000.0,
  "net_impact": -45000.0,
  "created_at": "...",
  "updated_at": "..."
}
```

*Note: `potential_sponsorship_revenue` should be the sum of `estimated_revenue` of all **accepted** queries.*

### Test 2: Retrieve Budget Calculation

**Endpoint:** `GET /api/v1/scripts/{script_id}/budget`

**Steps:**
1. Run the GET request for the same script.

   ```bash
   curl -X GET http://localhost:8000/api/v1/scripts/SCRIPT_ID/budget \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

**Expected Response (200 OK):**
- Should return the same JSON object as the POST request.

**Error Cases:**
- **404 Not Found**: If no budget calculation exists for the script (before running POST).
- **403 Forbidden**: If accessing another user's script budget.

## Integration Testing (Frontend)

1. **Navigate to a Script:** Open a script that has been analyzed.
2. **Accept Queries:** In the "Commercial Query Review" section, click the checkmark on a few detected terms.
3. **Calculate:** Click the "Calculate Budget Impact" (or similar) button.
   - Verify a loading state appears.
4. **View Dashboard:**
   - Ensure the "Budget Impact Dashboard" component displays the data.
   - Verify "Potential Sponsorship Revenue" matches the sum of accepted items.
   - Verify "Net Impact" is `Total Revenue - Production Budget`.

## Verification Checklist

- [ ] `POST /budget` calculates correctly based on *accepted* queries only.
- [ ] `GET /budget` retrieves the persisted calculation.
- [ ] Logic correctly distinguishes audience types for baseline AdSense (Young/Tech vs Default).
- [ ] Net impact calculation is correct (`Baseline + Sponsorship - Cost`).
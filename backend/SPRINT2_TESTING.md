# Sprint 2: Script Management & AI Analysis - Testing Guide

## Overview
Sprint 2 has been successfully implemented with all 8 tasks completed:
1. ✅ Script Pydantic Models
2. ✅ Scripts Router with POST Endpoint
3. ✅ GET Script by ID
4. ✅ List User Scripts
5. ✅ Commercial Query Pydantic Models
6. ✅ AI Detection Logic
7. ✅ Analyze Script Endpoint
8. ✅ GET Queries for Script

## Files Created/Modified

### New Files
- `backend/app/models/script.py` - Script Pydantic models
- `backend/app/models/commercial_query.py` - Commercial query models
- `backend/app/routers/scripts.py` - Scripts API endpoints
- `backend/app/services/__init__.py` - Services package init
- `backend/app/services/ai_detection.py` - AI detection service

### Modified Files
- `backend/app/main.py` - Added scripts router registration

## API Endpoints

### 1. Create Script
**POST** `/api/v1/scripts`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Coffee Shop Scene",
  "text": "INT. COFFEE SHOP - DAY\n\nSARAH enters the coffee shop and orders a latte. She pulls out her laptop and starts working. Her smartphone rings.",
  "params": {
    "target_production_budget": 100000,
    "target_audience": "Young Adults (18-34)",
    "creative_flexibility": "minor-dialogue-changes",
    "creative_direction_notes": "Urban lifestyle focus"
  }
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Coffee Shop Scene",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### 2. Get Script by ID
**GET** `/api/v1/scripts/{script_id}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "user_id": "507f1f77bcf86cd799439012",
  "title": "Coffee Shop Scene",
  "text": "INT. COFFEE SHOP - DAY\n\nSARAH enters...",
  "params": {
    "target_production_budget": 100000,
    "target_audience": "Young Adults (18-34)",
    "creative_flexibility": "minor-dialogue-changes",
    "creative_direction_notes": "Urban lifestyle focus"
  },
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### 3. List User Scripts
**GET** `/api/v1/scripts`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Coffee Shop Scene",
    "created_at": "2024-01-01T12:00:00Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "title": "Another Script",
    "created_at": "2024-01-01T11:00:00Z"
  }
]
```

### 4. Analyze Script
**POST** `/api/v1/scripts/{script_id}/analyze`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "queries": [
    {
      "id": "507f1f77bcf86cd799439013",
      "script_id": "507f1f77bcf86cd799439011",
      "term": "coffee",
      "type": "product",
      "reason": "CPG category; high advertiser demand",
      "estimated_revenue": 5000.0,
      "status": "pending",
      "script_excerpt": "...enters the coffee shop and orders a latte...",
      "start_index": 15,
      "end_index": 21,
      "confidence_score": 85,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "script_id": "507f1f77bcf86cd799439011",
      "term": "laptop",
      "type": "product",
      "reason": "Tech product; premium sponsorship potential",
      "estimated_revenue": 8000.0,
      "status": "pending",
      "script_excerpt": "...She pulls out her laptop and starts working...",
      "start_index": 65,
      "end_index": 71,
      "confidence_score": 90,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 5. Get Script Queries
**GET** `/api/v1/scripts/{script_id}/queries`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "script_id": "507f1f77bcf86cd799439011",
    "term": "coffee",
    "type": "product",
    "reason": "CPG category; high advertiser demand",
    "estimated_revenue": 5000.0,
    "status": "pending",
    "script_excerpt": "...enters the coffee shop and orders a latte...",
    "start_index": 15,
    "end_index": 21,
    "confidence_score": 85,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

## Testing with cURL

### 1. First, login to get JWT token:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser@example.com&password=testpassword123"
```

Save the `access_token` from the response.

### 2. Create a script:
```bash
curl -X POST http://localhost:8000/api/v1/scripts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "INT. COFFEE SHOP - DAY\n\nSARAH enters the coffee shop and orders a latte. She pulls out her laptop and starts working. Her smartphone rings.",
    "params": {
      "target_production_budget": 100000,
      "target_audience": "Young Adults (18-34)",
      "creative_flexibility": "minor-dialogue-changes",
      "creative_direction_notes": "Urban lifestyle focus"
    }
  }'
```

Save the `id` from the response.

### 3. Analyze the script:
```bash
curl -X POST http://localhost:8000/api/v1/scripts/SCRIPT_ID_HERE/analyze \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get script details:
```bash
curl -X GET http://localhost:8000/api/v1/scripts/SCRIPT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. List all scripts:
```bash
curl -X GET http://localhost:8000/api/v1/scripts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Get script queries:
```bash
curl -X GET http://localhost:8000/api/v1/scripts/SCRIPT_ID_HERE/queries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:8000`
   - `token`: (will be set after login)
   - `script_id`: (will be set after creating script)

3. **Test Sequence**:
   - Login → Save token
   - Create Script → Save script_id
   - Analyze Script
   - Get Script Details
   - List Scripts
   - Get Script Queries

## AI Detection Features

### Commercial Terms Database
The AI detection service includes 30+ commercial terms across 4 categories:

**Products:**
- coffee, laptop, smartphone, phone, car, vehicle, watch, sneakers, shoes, beer, wine, soda

**Environments:**
- kitchen, office, gym, restaurant, cafe, store, mall, airport, hotel

**Situations:**
- wedding, travel, vacation, party, meeting, date, shopping

**Thematic:**
- luxury, technology, fashion, fitness, adventure

### Revenue Calculation
Revenue is adjusted based on creative flexibility:
- **no-changes**: base_revenue × 0.7
- **minor-dialogue-changes**: base_revenue × 1.0
- **scene-level-changes**: base_revenue × 1.3

### Confidence Score Adjustment
Confidence scores are adjusted based on creative flexibility:
- **no-changes**: base_confidence - 10
- **minor-dialogue-changes**: base_confidence (no change)
- **scene-level-changes**: base_confidence + 5

### Detection Features
- Case-insensitive matching
- Whole word boundaries (avoids partial matches)
- Duplicate prevention (same term at same position)
- Context extraction (50 chars before/after)
- Position tracking (start_index, end_index)

## Error Handling

### 400 Bad Request
- Invalid script ID format
- Validation errors (text too short, budget negative, etc.)

### 401 Unauthorized
- Missing or invalid JWT token
- Expired token

### 403 Forbidden
- User doesn't own the script

### 404 Not Found
- Script not found

### 422 Unprocessable Entity
- Invalid request body
- Missing required fields

### 500 Internal Server Error
- Database errors
- Analysis errors

## Success Criteria Verification

✅ **Script creation endpoint stores scripts with user association**
- Scripts are stored in `scripts` collection with `user_id`

✅ **Script retrieval endpoints verify ownership**
- All endpoints check `script["user_id"] == current_user_id`

✅ **AI detection finds commercial terms in script text**
- Regex-based detection with 30+ terms

✅ **Revenue calculations adjust based on creative flexibility**
- Multipliers: 0.7, 1.0, 1.3

✅ **Confidence scores are within 0-100 range**
- Clamped with `max(0, min(100, confidence_score))`

✅ **Script excerpts show context around detected terms**
- 50 chars before/after with ellipsis

✅ **All endpoints protected with JWT authentication**
- `get_current_user` dependency on all routes

✅ **Proper error handling (404, 403, 422)**
- Comprehensive error handling throughout

## MongoDB Collections

### scripts
```json
{
  "_id": ObjectId,
  "user_id": "string",
  "title": "string",
  "text": "string",
  "params": {
    "target_production_budget": 100000,
    "target_audience": "string",
    "creative_flexibility": "enum",
    "creative_direction_notes": "string"
  },
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### commercial_queries
```json
{
  "_id": ObjectId,
  "script_id": "string",
  "term": "string",
  "type": "enum",
  "reason": "string",
  "estimated_revenue": 5000.0,
  "status": "enum",
  "script_excerpt": "string",
  "start_index": 15,
  "end_index": 21,
  "confidence_score": 85,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

## Next Steps

After testing Sprint 2, proceed to Sprint 3:
- Query management (accept/reject)
- Budget impact calculations
- Report generation
- Frontend integration

## Notes

- All timestamps are in UTC
- Script text must be at least 10 characters
- Target audience must be at least 3 characters
- Production budget must be >= 0
- Re-analyzing a script deletes previous queries
- Queries are sorted by creation date (newest first for scripts list)
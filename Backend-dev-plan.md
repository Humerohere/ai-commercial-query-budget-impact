
# Backend Development Plan
## AI Commercial Query Detection & Budget Impact Tool

---

## 1️⃣ Executive Summary

### What Will Be Built
A FastAPI backend that powers the AI Commercial Query Detection & Budget Impact Tool, enabling creators to:
- Upload and analyze scripts for commercial opportunities
- Review AI-detected sponsorship integration points
- Calculate budget impact and revenue projections
- Generate downloadable reports

### Technical Constraints
- **Runtime:** Python 3.13 with FastAPI (async)
- **Database:** MongoDB Atlas using Motor (async driver) and Pydantic v2 models
- **No Docker:** Direct Python execution
- **Testing:** Manual validation via frontend UI after each task
- **Git:** Single branch `main` only
- **API Base:** `/api/v1/*`

### Sprint Structure
Dynamic sprint plan (S0 → S4) covering:
- S0: Environment setup and frontend connection
- S1: Basic authentication (signup/login/logout)
- S2: Script management and analysis
- S3: Commercial query review workflow
- S4: Budget calculation and report generation

---

## 2️⃣ In-Scope & Success Criteria

### In-Scope Features
- User authentication (JWT-based signup/login/logout)
- Script upload and storage (text content)
- AI-powered commercial query detection
- Accept/reject workflow for detected opportunities
- Budget impact calculation (AdSense baseline + sponsorship potential)
- Report generation and retrieval
- Session persistence via localStorage integration

### Success Criteria
- All frontend features functional end-to-end
- User can complete full workflow: signup → upload script → review queries → view budget dashboard
- All task-level manual tests pass via UI
- Each sprint's code pushed to `main` after verification
- Frontend displays live backend data (no mock data)

---

## 3️⃣ API Design

### Base Path
`/api/v1`

### Error Envelope
```json
{
  "error": "Human-readable error message"
}
```

### Endpoints

#### Health Check
- **GET** `/healthz`
- **Purpose:** Verify backend and MongoDB Atlas connection
- **Response:** `{ "status": "ok", "database": "connected" }`

#### Authentication
- **POST** `/api/v1/auth/signup`
  - **Purpose:** Create new user account
  - **Request:** `{ "email": "string", "password": "string" }`
  - **Response:** `{ "message": "User created successfully" }`
  - **Validation:** Email format, password min 8 chars

- **POST** `/api/v1/auth/login`
  - **Purpose:** Authenticate user and issue JWT
  - **Request:** `{ "email": "string", "password": "string" }`
  - **Response:** `{ "access_token": "jwt_string", "token_type": "bearer" }`
  - **Validation:** Credentials match, password hashed with Argon2

- **POST** `/api/v1/auth/logout`
  - **Purpose:** Client-side token invalidation (no server action needed)
  - **Response:** `{ "message": "Logged out successfully" }`

- **GET** `/api/v1/auth/me`
  - **Purpose:** Get current user info
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** `{ "id": "string", "email": "string" }`

#### Scripts
- **POST** `/api/v1/scripts`
  - **Purpose:** Create new script with parameters
  - **Headers:** `Authorization: Bearer <token>`
  - **Request:**
    ```json
    {
      "title": "string",
      "text": "string",
      "params": {
        "targetProductionBudget": 100000,
        "targetAudience": "Young Adults (18-34)",
        "creativeFlexibility": "minor-dialogue-changes",
        "creativeDirectionNotes": "optional string"
      }
    }
    ```
  - **Response:** `{ "id": "string", "title": "string", "created_at": "ISO8601" }`
  - **Validation:** Text min 10 chars, budget >= 0

- **GET** `/api/v1/scripts/{script_id}`
  - **Purpose:** Retrieve script details
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** Full script object with params

- **GET** `/api/v1/scripts`
  - **Purpose:** List user's scripts
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** `{ "scripts": [{ "id": "string", "title": "string", "created_at": "ISO8601" }] }`

#### Commercial Queries
- **POST** `/api/v1/scripts/{script_id}/analyze`
  - **Purpose:** Trigger AI analysis and detect commercial queries
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:**
    ```json
    {
      "queries": [
        {
          "id": "string",
          "term": "coffee",
          "type": "product",
          "reason": "CPG category; high advertiser demand",
          "estimatedRevenue": 5000.00,
          "status": "pending",
          "scriptExcerpt": "...context around term...",
          "startIndex": 123,
          "endIndex": 129,
          "confidenceScore": 85
        }
      ]
    }
    ```

- **GET** `/api/v1/scripts/{script_id}/queries`
  - **Purpose:** Retrieve all queries for a script
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** Array of commercial query objects

- **PATCH** `/api/v1/scripts/{script_id}/queries/{query_id}`
  - **Purpose:** Update query status (accept/reject)
  - **Headers:** `Authorization: Bearer <token>`
  - **Request:** `{ "status": "accepted" | "rejected" }`
  - **Response:** Updated query object

- **PATCH** `/api/v1/scripts/{script_id}/queries/bulk`
  - **Purpose:** Update multiple query statuses at once
  - **Headers:** `Authorization: Bearer <token>`
  - **Request:** `{ "updates": [{ "id": "string", "status": "accepted" }] }`
  - **Response:** `{ "updated_count": 5 }`

#### Budget Analysis
- **POST** `/api/v1/scripts/{script_id}/budget`
  - **Purpose:** Calculate budget impact based on accepted queries
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:**
    ```json
    {
      "baselineAdsenseRevenue": 50000.00,
      "potentialSponsorshipRevenue": 180000.00,
      "totalProjectedRevenue": 230000.00,
      "productionBudget": 200000.00,
      "netImpact": 30000.00
    }
    ```

- **GET** `/api/v1/scripts/{script_id}/budget`
  - **Purpose:** Retrieve existing budget calculation
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** Budget model object

---

## 4️⃣ Data Model (MongoDB Atlas)

### Collection: `users`
- **Fields:**
  - `_id`: ObjectId (auto-generated)
  - `email`: string (unique, required)
  - `password_hash`: string (required, Argon2 hashed)
  - `created_at`: datetime (default: now)
  - `updated_at`: datetime (default: now)

- **Example:**
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "email": "creator@example.com",
    "password_hash": "$argon2id$v=19$m=65536...",
    "created_at": "2023-10-26T10:00:00Z",
    "updated_at": "2023-10-26T10:00:00Z"
  }
  ```

### Collection: `scripts`
- **Fields:**
  - `_id`: ObjectId (auto-generated)
  - `user_id`: ObjectId (required, references users)
  - `title`: string (required)
  - `text`: string (required, min 10 chars)
  - `params`: object (embedded)
    - `target_production_budget`: float (required, >= 0)
    - `target_audience`: string (required)
    - `creative_flexibility`: string (enum: no-changes, minor-dialogue-changes, scene-level-changes)
    - `creative_direction_notes`: string (optional)
  - `created_at`: datetime (default: now)
  - `updated_at`: datetime (default: now)

- **Example:**
  ```json
  {
    "_id": "507f1f77bcf86cd799439012",
    "user_id": "507f1f77bcf86cd799439011",
    "title": "Coffee Shop Romance - Act 1",
    "text": "INT. COFFEE SHOP - DAY\n\nSARAH enters...",
    "params": {
      "target_production_budget": 100000.0,
      "target_audience": "Young Adults (18-34)",
      "creative_flexibility": "minor-dialogue-changes",
      "creative_direction_notes": "Focus on urban lifestyle"
    },
    "created_at": "2023-10-26T10:05:00Z",
    "updated_at": "2023-10-26T10:05:00Z"
  }
  ```

### Collection: `commercial_queries`
- **Fields:**
  - `_id`: ObjectId (auto-generated)
  - `script_id`: ObjectId (required, references scripts)
  - `term`: string (required)
  - `type`: string (enum: product, environment, situation, thematic)
  - `reason`: string (required)
  - `estimated_revenue`: float (required, >= 0)
  - `status`: string (enum: pending, accepted, rejected, default: pending)
  - `script_excerpt`: string (required)
  - `start_index`: int (required)
  - `end_index`: int (required)
  - `confidence_score`: int (required, 0-100)
  - `created_at`: datetime (default: now)
  - `updated_at`: datetime (default: now)

- **Example:**
  ```json
  {
    "_id": "507f1f77bcf86cd799439013",
    "script_id": "507f1f77bcf86cd799439012",
    "term": "coffee",
    "type": "product",
    "reason": "CPG category; high advertiser demand",
    "estimated_revenue": 5000.00,
    "status": "accepted",
    "script_excerpt": "...SARAH orders a coffee at the counter...",
    "start_index": 123,
    "end_index": 129,
    "confidence_score": 85,
    "created_at": "2023-10-26T10:06:00Z",
    "updated_at": "2023-10-26T10:10:00Z"
  }
  ```

### Collection: `budget_models`
- **Fields:**
  - `_id`: ObjectId (auto-generated)
  - `script_id`: ObjectId (required, unique, references scripts)
  - `baseline_adsense_revenue`: float (required)
  - `potential_sponsorship_revenue`: float (required)
  - `total_projected_revenue`: float (required)
  - `production_budget`: float (required)
  - `net_impact`: float (required)
  - `created_at`: datetime (default: now)
  - `updated_at`: datetime (default: now)

- **Example:**
  ```json
  {
    "_id": "507f1f77bcf86cd799439014",
    "script_id": "507f1f77bcf86cd799439012",
    "baseline_adsense_revenue": 50000.00,
    "potential_sponsorship_revenue": 180000.00,
    "total_projected_revenue": 230000.00,
    "production_budget": 100000.00,
    "net_impact": 130000.00,
    "created_at": "2023-10-26T10:15:00Z",
    "updated_at": "2023-10-26T10:15:00Z"
  }
  ```

---

## 5️⃣ Frontend Audit & Feature Map

### Screen: Login Page (`/login`)
- **Route:** `/login`
- **Purpose:** User authentication entry point
- **Data Needed:** None (form input only)
- **Backend Endpoints:**
  - `POST /api/v1/auth/login`
- **Auth:** None (public)

### Screen: Main Application (`/`)
- **Route:** `/`
- **Purpose:** Protected main workflow (script input → review → dashboard)
- **Data Needed:** User session, scripts, queries, budget
- **Backend Endpoints:**
  - `GET /api/v1/auth/me` (verify session)
  - `POST /api/v1/scripts` (create script)
  - `POST /api/v1/scripts/{id}/analyze` (detect queries)
  - `PATCH /api/v1/scripts/{id}/queries/bulk` (update statuses)
  - `POST /api/v1/scripts/{id}/budget` (calculate impact)
- **Auth:** Required (JWT in Authorization header)

### Component: ScriptInputForm
- **Purpose:** Collect script text and parameters
- **Data Needed:** Form defaults
- **Backend Endpoints:**
  - `POST /api/v1/scripts`
- **Auth:** Required

### Component: CommercialQueryDisplay
- **Purpose:** Show detected queries with accept/reject toggles
- **Data Needed:** Script text, commercial queries array
- **Backend Endpoints:**
  - `GET /api/v1/scripts/{id}/queries`
  - `PATCH /api/v1/scripts/{id}/queries/bulk`
- **Auth:** Required

### Component: BudgetImpactDashboard
- **Purpose:** Display budget analysis and download report
- **Data Needed:** Budget model, script, queries
- **Backend Endpoints:**
  - `GET /api/v1/scripts/{id}/budget`
- **Auth:** Required

---

## 6️⃣ Configuration & ENV Vars

### Core Environment Variables
- `APP_ENV` — Environment (development, production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string (required)
- `JWT_SECRET` — Token signing key (required, min 32 chars)
- `JWT_EXPIRES_IN` — Token expiry in seconds (default: 86400 = 24 hours)
- `CORS_ORIGINS` — Comma-separated allowed frontend URLs (e.g., `http://localhost:5173`)

### Example `.env` File
```
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai_budget_tool?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_EXPIRES_IN=86400
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 7️⃣ Background Work

**Not Required:** All operations are synchronous and complete within request lifecycle. No background tasks, queues, or async job processing needed.

---

## 8️⃣ Integrations

**Not Required:** No external integrations (payment processors, file storage services, email providers) needed for P0 scope. AI detection uses rule-based logic with predefined commercial terms.

---

## 9️⃣ Testing Strategy (Manual via Frontend)

### Validation Approach
- All testing performed through frontend UI
- Every task includes:
  - **Manual Test Step:** Exact UI action + expected result
  - **User Test Prompt:** Copy-paste friendly instruction

### Sprint Completion Flow
1. Complete all tasks in sprint
2. Run manual test for each task via frontend
3. Verify expected results
4. If all tests pass → commit and push to `main`
5. If any fail → fix and retest before pushing

### Test Data Requirements
- Valid email/password combinations
- Sample script text (min 10 chars, contains commercial terms)
- Various creative flexibility options

---

## 🔟 Dynamic Sprint Plan & Backlog

---

## 🧱 S0 – Environment Setup & Frontend Connection

### Objectives
- Create FastAPI skeleton with `/api/v1` base path and `/healthz` endpoint
- Connect to MongoDB Atlas using `MONGODB_URI`
- Enable CORS for frontend origin
- Initialize Git repository with `main` branch
- Create `.gitignore` at root
- Push initial code to GitHub

### User Stories
- As a developer, I need a working FastAPI server so I can build endpoints
- As a developer, I need MongoDB Atlas connection so I can store data
- As a developer, I need CORS enabled so frontend can make requests
- As a developer, I need Git initialized so I can track changes

### Tasks

#### Task 1: Initialize FastAPI Project Structure
- Create project root directory structure:
  - `app/` (main application code)
  - `app/main.py` (FastAPI app entry point)
  - `app/config.py` (environment configuration)
  - `app/database.py` (MongoDB connection)
  - `requirements.txt` (Python dependencies)
  - `.env.example` (template for environment variables)
  - `.gitignore` (ignore patterns)

**Manual Test Step:**
- Run `python -m app.main` → server starts on port 8000 without errors

**User Test Prompt:**
> "Start the backend with `python -m app.main` and confirm it runs without errors on port 8000."

#### Task 2: Install Core Dependencies
- Add to `requirements.txt`:
  - `fastapi==0.115.0`
  - `uvicorn[standard]==0.32.0`
  - `motor==3.6.0` (async MongoDB driver)
  - `pydantic==2.9.0`
  - `pydantic-settings==2.6.0`
  - `python-dotenv==1.0.0`
  - `argon2-cffi==23.1.0` (password hashing)
  - `python-jose[cryptography]==3.3.0` (JWT)
  - `python-multipart==0.0.9` (form data)

**Manual Test Step:**
- Run `pip install -r requirements.txt` → all packages install successfully

**User Test Prompt:**
> "Install dependencies with `pip install -r requirements.txt` and verify no errors."

#### Task 3: Configure Environment Variables
- Create `.env.example` with all required variables
- Create `app/config.py` using Pydantic Settings
- Load configuration from `.env` file

**Manual Test Step:**
- Copy `.env.example` to `.env`, fill values → app loads config without errors

**User Test Prompt:**
> "Copy `.env.example` to `.env`, add your MongoDB URI and JWT secret, then start the app to verify config loads."

#### Task 4: Setup MongoDB Atlas Connection
- Implement `app/database.py` with Motor async client
- Create connection function with ping test
- Handle connection errors gracefully

**Manual Test Step:**
- Start app → logs show "Connected to MongoDB Atlas" message

**User Test Prompt:**
> "Start the backend and check logs for successful MongoDB Atlas connection message."

#### Task 5: Create Health Check Endpoint
- Implement `GET /healthz` in `app/main.py`
- Perform MongoDB ping to verify connection
- Return JSON: `{ "status": "ok", "database": "connected" }`

**Manual Test Step:**
- Open browser to `http://localhost:8000/healthz` → see `{"status":"ok","database":"connected"}`

**User Test Prompt:**
> "Navigate to `http://localhost:8000/healthz` in your browser and confirm you see the health check response."

#### Task 6: Enable CORS for Frontend
- Add CORS middleware to FastAPI app
- Allow origins from `CORS_ORIGINS` env var
- Allow credentials, all methods, all headers

**Manual Test Step:**
- Start frontend, open DevTools Network tab → requests to backend show CORS headers

**User Test Prompt:**
> "Start both frontend and backend, open browser DevTools Network tab, and verify CORS headers are present in API responses."

#### Task 7: Initialize Git Repository
- Run `git init` at project root (only once)
- Set default branch to `main`: `git branch -M main`
- Create `.gitignore` with:
  - `__pycache__/`
  - `*.pyc`
  - `.env`
  - `venv/`
  - `.vscode/`

**Manual Test Step:**
- Run `git status` → see untracked files, `.env` not listed

**User Test Prompt:**
> "Run `git status` and confirm `.env` is not listed (it should be ignored)."

#### Task 8: Initial Commit and Push to GitHub
- Create GitHub repository (empty, no README)
- Add remote: `git remote add origin <repo-url>`
- Stage all files: `git add .`
- Commit: `git commit -m "Initial FastAPI setup with MongoDB Atlas"`
- Push: `git push -u origin main`

**Manual Test Step:**
- Visit GitHub repo URL → see committed files on `main` branch

**User Test Prompt:**
> "Visit your GitHub repository and confirm the initial commit is visible on the `main` branch."

### Definition of Done
- FastAPI server runs on port 8000
- `/healthz` endpoint returns success with DB status
- MongoDB Atlas connection established
- CORS enabled for frontend origin
- Git initialized with `main` branch
- Code pushed to GitHub

---

## 🧩 S1 – Basic Auth (Signup / Login / Logout)

### Objectives
- Implement JWT-based authentication
- Create signup endpoint with password hashing
- Create login endpoint issuing JWT tokens
- Create logout endpoint (client-side token clearing)
- Protect one test endpoint with JWT verification

### User Stories
- As a creator, I can sign up with email/password so I can create an account
- As a creator, I can log in to access my scripts and analyses
- As a creator, I can log out to end my session
- As a developer, I can protect endpoints requiring authentication

### Tasks

#### Task 1: Create User Pydantic Model
- Create `app/models/user.py`
- Define `UserCreate` (email, password)
- Define `UserInDB` (id, email, password_hash, created_at, updated_at)
- Define `UserResponse` (id, email, created_at)

**Manual Test Step:**
- Import models in Python shell → no errors

**User Test Prompt:**
> "Run `python -c 'from app.models.user import UserCreate'` and verify no import errors."

#### Task 2: Implement Password Hashing Utilities
- Create `app/utils/security.py`
- Implement `hash_password(password: str) -> str` using Argon2
- Implement `verify_password(plain: str, hashed: str) -> bool`

**Manual Test Step:**
- Test in Python shell: hash password, verify correct/incorrect passwords

**User Test Prompt:**
> "In Python shell, import security utils and test hashing/verifying a password."

#### Task 3: Implement JWT Token Functions
- Add to `app/utils/security.py`
- Implement `create_access_token(data: dict) -> str` using python-jose
- Implement `verify_token(token: str) -> dict` to decode and validate
- Use `JWT_SECRET` and `JWT_EXPIRES_IN` from config

**Manual Test Step:**
- Test in Python shell: create token, decode token, verify expiry

**User Test Prompt:**
> "In Python shell, create a JWT token and decode it to verify it contains the expected data."

#### Task 4: Create Auth Router and Signup Endpoint
- Create `app/routers/auth.py`
- Implement `POST /api/v1/auth/signup`
- Validate email format and password length (min 8 chars)
- Check if user exists (return 400 if duplicate)
- Hash password and store user in `users` collection
- Return success message

**Manual Test Step:**
- Open frontend, click "Mock Login" → redirected to main page (still mock)
- Use Postman/curl to POST signup with valid data → 200 response

**User Test Prompt:**
> "Use Postman to POST to `/api/v1/auth/signup` with `{\"email\":\"test@example.com\",\"password\":\"password123\"}` and verify success response."

#### Task 5: Implement Login Endpoint
- Implement `POST /api/v1/auth/login` in `app/routers/auth.py`
- Validate credentials (user exists, password matches)
- Generate JWT token with user_id in payload
- Return `{ "access_token": "...", "token_type": "bearer" }`

**Manual Test Step:**
- Use Postman to POST login with correct credentials → receive JWT token
- Try incorrect password → receive 401 error

**User Test Prompt:**
> "Use Postman to POST to `/api/v1/auth/login` with your signup credentials and verify you receive an access token."

#### Task 6: Implement Logout Endpoint
- Implement `POST /api/v1/auth/logout` in `app/routers/auth.py`
- Return success message (no server-side action needed)
- Frontend will clear token from localStorage

**Manual Test Step:**
- Use Postman to POST logout → receive success message

**User Test Prompt:**
> "Use Postman to POST to `/api/v1/auth/logout` and verify you receive a success message."

#### Task 7: Create Auth Dependency for Protected Routes
- Create `app/dependencies/auth.py`
- Implement `get_current_user(token: str = Depends(oauth2_scheme))` dependency
- Extract token from Authorization header
- Verify token and extract user_id
- Return user_id or raise 401 error

**Manual Test Step:**
- Test dependency in Python shell with valid/invalid tokens

**User Test Prompt:**
> "Test the auth dependency by importing it and calling with a valid JWT token."

#### Task 8: Implement /auth/me Endpoint
- Implement `GET /api/v1/auth/me` in `app/routers/auth.py`
- Protect with `get_current_user` dependency
- Fetch user from database by user_id
- Return user info (id, email)

**Manual Test Step:**
- Use Postman with Authorization header (Bearer token) → receive user info
- Try without token → receive 401 error

**User Test Prompt:**
> "Use Postman to GET `/api/v1/auth/me` with Authorization header `Bearer <your-token>` and verify you receive your user info."

#### Task 9: Update Frontend to Use Real Auth Endpoints
- Modify `frontend/src/context/AuthContext.tsx`
- Replace mock login with API call to `/api/v1/auth/login`
- Store JWT token in localStorage
- Add token to all API requests via interceptor
- Implement real logout (clear token + call logout endpoint)

**Manual Test Step:**
- Open frontend, sign up new account → success message
- Log in with credentials → redirected to main page
- Refresh page → still logged in (token persists)
- Log out → redirected to login page

**User Test Prompt:**
> "In the frontend, sign up with a new account, log in, refresh the page to verify session persistence, then log out and confirm you're redirected to login."

### Definition of Done
- Signup endpoint creates users with hashed passwords
- Login endpoint issues valid JWT tokens
- Logout endpoint returns success
- `/auth/me` endpoint returns user info when authenticated
- Frontend uses real auth endpoints (no more mock)
- Auth flow works end-to-end in UI

**Post-Sprint:**
- Commit: `git commit -m "Implement JWT authentication (signup/login/logout)"`
- Push: `git push origin main`

---

## 🧱 S2 – Script Management & AI Analysis

### Objectives
- Implement script creation endpoint
- Store scripts in MongoDB with user association
- Implement AI commercial query detection
- Return detected queries to frontend

### User Stories
- As a creator, I can upload my script text with parameters
- As a creator, I can see AI-detected commercial opportunities
- As a creator, I can retrieve my script details

### Tasks

#### Task 1: Create Script Pydantic Models
- Create `app/models/script.py`
- Define `ScriptParams` (target_production_budget, target_audience, creative_flexibility, creative_direction_notes)
- Define `ScriptCreate` (title, text, params)
- Define `ScriptInDB` (id, user_id, title, text, params, created_at, updated_at)
- Define `ScriptResponse` (id, title, created_at)

**Manual Test Step:**
- Import models in Python shell → no errors

**User Test Prompt:**
> "Run `python -c 'from app.models.script import ScriptCreate'` and verify no import errors."

#### Task 2: Create Scripts Router and POST Endpoint
- Create `app/routers/scripts.py`
- Implement `POST /api/v1/scripts`
- Protect with `get_current_user` dependency
- Validate script text (min 10 chars) and budget (>= 0)
- Generate title from first 50 chars if not provided
- Store in `scripts` collection with user_id
- Return script ID and title

**Manual Test Step:**
- Use Postman with auth token to POST script → receive script ID
- Try without token → 401 error
- Try with invalid data → 422 validation error

**User Test Prompt:**
> "Use Postman to POST to `/api/v1/scripts` with Authorization header and script data, verify you receive a script ID."

#### Task 3: Implement GET Script by ID
- Implement `GET /api/v1/scripts/{script_id}` in `app/routers/scripts.py`
- Protect with auth dependency
- Verify script belongs to current user (403 if not)
- Return full script object

**Manual Test Step:**
- Use Postman to GET script by ID → receive full script data
- Try with another user's script ID → 403 error

**User Test Prompt:**
> "Use Postman to GET `/api/v1/scripts/{your-script-id}` and verify you receive the full script details."

#### Task 4: Implement List User Scripts
- Implement `GET /api/v1/scripts` in `app/routers/scripts.py`
- Protect with auth dependency
- Return array of user's scripts (id, title, created_at only)
- Sort by created_at descending

**Manual Test Step:**
- Use Postman to GET scripts list → receive array of scripts
- Create multiple scripts → list shows all in correct order

**User Test Prompt:**
> "Use Postman to GET `/api/v1/scripts` and verify you see a list of your scripts."

#### Task 5: Create Commercial Query Pydantic Models
- Create `app/models/commercial_query.py`
- Define `CommercialQueryInDB` (id, script_id, term, type, reason, estimated_revenue, status, script_excerpt, start_index, end_index, confidence_score, created_at, updated_at)
- Define `CommercialQueryResponse` (all fields except internal IDs)

**Manual Test Step:**
- Import models in Python shell → no errors

**User Test Prompt:**
> "Run `python -c 'from app.models.commercial_query import CommercialQueryInDB'` and verify no import errors."

#### Task 6: Implement AI Detection Logic
- Create `app/services/ai_detection.py`
- Define list of commercial terms with metadata (term, type, reason, base_revenue, base_confidence)
- Implement `detect_commercial_queries(script_text: str, params: ScriptParams) -> List[CommercialQuery]`
- Use regex to find terms in script (case-insensitive, whole words)
- Calculate estimated revenue based on creative flexibility multiplier
- Calculate confidence score with flexibility adjustment
- Extract script excerpt (50 chars before/after)
- Return list of detected queries

**Manual Test Step:**
- Test function in Python shell with sample script → returns queries
- Verify revenue multipliers work correctly
- Verify confidence scores are in 0-100 range

**User Test Prompt:**
> "In Python shell, import detection function and test with a script containing 'coffee' and 'laptop' to verify queries are detected."

#### Task 7: Implement Analyze Script Endpoint
- Implement `POST /api/v1/scripts/{script_id}/analyze` in `app/routers/scripts.py`
- Protect with auth dependency
- Verify script belongs to user
- Call AI detection service
- Store detected queries in `commercial_queries` collection
- Return array of queries

**Manual Test Step:**

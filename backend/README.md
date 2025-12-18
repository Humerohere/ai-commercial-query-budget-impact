# AI Commercial Query Detection API - Backend

Backend API for the AI Commercial Query Detection & Budget Impact Tool. Built with FastAPI, MongoDB Atlas, and Python 3.13.

## Overview

This FastAPI backend provides REST API endpoints for:
- Commercial query detection in video scripts
- Budget impact analysis and reporting
- User authentication and authorization
- Data persistence with MongoDB Atlas

## Tech Stack

- **Framework:** FastAPI 0.115.0 (async)
- **Database:** MongoDB Atlas with Motor (async driver)
- **Validation:** Pydantic v2
- **Authentication:** JWT with argon2 password hashing
- **Python Version:** 3.13+

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   └── database.py          # MongoDB connection management
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore patterns
└── README.md               # This file
```

## Setup Instructions

### 1. Create Virtual Environment

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your MongoDB Atlas credentials:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string (minimum 32 characters)

**Example `.env` file:**
```env
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_budget_tool?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-characters-long-change-this
JWT_EXPIRES_IN=86400
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Run the Server

```bash
python -m app.main
```

The server will start on `http://localhost:8000` with auto-reload enabled.

## API Documentation

Once the server is running, you can access:

- **Interactive API Docs (Swagger UI):** http://localhost:8000/docs
- **Alternative API Docs (ReDoc):** http://localhost:8000/redoc
- **Health Check Endpoint:** http://localhost:8000/healthz

## Available Endpoints

### Health Check
- **GET** `/healthz` - Check API and database connectivity status
  - Returns: `{"status": "ok", "database": "connected"}` on success
  - Returns: `{"status": "error", "database": "disconnected"}` on failure

### Root
- **GET** `/` - API information and available endpoints

## Development

### Running in Development Mode

The server runs with auto-reload enabled by default when using `python -m app.main`. Any changes to the code will automatically restart the server.

### Environment Variables

All configuration is managed through environment variables loaded from the `.env` file:

- `APP_ENV`: Application environment (development/production)
- `PORT`: Server port (default: 8000)
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time in seconds
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins

### Database Connection

The application uses Motor (async MongoDB driver) for database operations. The connection is established during application startup and closed during shutdown. All database operations are asynchronous.

## Testing the Setup

1. Start the server: `python -m app.main`
2. Visit http://localhost:8000/healthz in your browser
3. You should see: `{"status": "ok", "database": "connected"}`
4. Visit http://localhost:8000/docs to explore the API documentation

## Troubleshooting

### Database Connection Issues

If you see `"database": "disconnected"` in the health check:
1. Verify your MongoDB Atlas connection string in `.env`
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Check that your database user has proper permissions
4. Verify network connectivity to MongoDB Atlas

### Import Errors

If you encounter import errors:
1. Ensure you're in the `backend` directory
2. Verify the virtual environment is activated
3. Reinstall dependencies: `pip install -r requirements.txt`

### Port Already in Use

If port 8000 is already in use:
1. Change the `PORT` variable in `.env`
2. Or stop the process using port 8000

## Next Steps

This is Sprint 0 - the foundation setup. Future sprints will add:
- User authentication endpoints
- Script analysis endpoints
- Budget calculation endpoints
- Report generation endpoints
- Admin dashboard endpoints

## License

Proprietary - All rights reserved
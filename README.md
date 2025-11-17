# Memory Match Madness - RESTful API

![API Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Express](https://img.shields.io/badge/express-4.18.2-orange.svg)
![Firebase](https://img.shields.io/badge/firebase-admin-yellow.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

A vibrant cognitive training game that reimagines the classic memory card match experience.

---
## Repositories
 
[![Main Repository](https://img.shields.io/badge/GitHub-Part%203%20Main%20Repo-181717?logo=github&logoColor=white)](https://github.com/VCDN-2025/prog7314-poe-part-2-st10251759.git)

---
##  App Demo
[![Watch Demo](https://img.shields.io/badge/Watch_Demo-YouTube-red?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/7-EZwXnZNXY)
---
## Table of Contents

- [Overview](#overview)
- [Team Details](#team-details)
- [API Purpose](#api-purpose)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Part 3 Updates](#part-3-updates)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Memory Match Madness is a mobile cognitive training application featuring a comprehensive RESTful API backend that supports user authentication, game mechanics, achievement tracking, and multi-language content delivery. This API serves as the crucial communication bridge between the Android client application and Firebase backend services, enabling seamless synchronization of gameplay data while maintaining offline functionality.

The API implements a stateless, client-server communication model using standard HTTP methods (GET, POST, PUT, DELETE) with JSON data exchange, making it platform-independent and highly scalable.

---

## Team Details

| Role | Name | Student Number | Email |
|------|------|----------------|-------|
| Developer | Alyssia Sookdeo | ST10266994 | ST10266994@vcconnect.edu.za |
| Developer | Arshad Bhula | ST10343093 | ST10343093@vcconnect.edu.za |
| Developer | Cameron Chetty | ST10251749 | ST10251749@vcconnect.edu.za |
| Developer | Jordan Gardiner | ST10304100 | ST10304100@vcconnect.edu.za |
| Developer | Theshara Narain | ST10252746 | ST10252746@vcconnect.edu.za |

**Course:** BCAD Year 3  
**Module:** Programming 3D (PROG7314)  
**Assessment:** Portfolio of Evidence (POE) Part 3  
**Academic Year:** 2025

---

## API Purpose

The Memory Match Madness RESTful API serves as the backbone for the mobile application, providing comprehensive data management across multiple domains:

### Authentication & User Management
- Secure user registration and login through Google Single Sign-On (SSO)
- Token-based authentication verification
- User profile management and settings synchronization
- Password reset functionality

### Game Mechanics
- Real-time game result submission and validation
- Level progress tracking with star ratings
- Leaderboard management for competitive gameplay
- Performance metrics calculation and storage

### Content Delivery
- Multi-themed card data distribution (Animals, Pokemon, Fruits, Harry Potter, F1 Logos, Flags)
- Dynamic difficulty adaptation based on user performance
- Multi-language support (English, isiZulu, Afrikaans)

### Achievement System
- Achievement unlocking and progress tracking
- Real-time notification triggers for milestones
- Comprehensive achievement analytics

### Multiplayer Support
- Local multiplayer game result management
- Player statistics and match history
- Winner determination algorithms

The API receives data including user credentials, game completion results with timing and accuracy metrics, language preference settings, and biometric authentication tokens. In return, it provides themed card data, updated leaderboard rankings, achievement notifications, and synchronized user progress across devices.

---

## Architecture

The Memory Match Madness API implements a four-layer client-server architecture:

### Layer 1: Client Layer (Android App)
- Local Game Engine for card matching mechanics
- Authentication Manager for Google SSO and biometric login
- Local Storage using RoomDB for offline game results
- Sync Manager for cloud synchronization

### Layer 2: RESTful API Layer
- Express.js server handling HTTPS requests
- Endpoint routing for all service modules
- Request validation and error handling
- CORS configuration for cross-origin requests

### Layer 3: Web Server Layer
- Firebase Functions for serverless computing
- Firebase Hosting for static content delivery via CDN
- Cloud Messaging for push notifications
- Firebase Authentication for identity verification

### Layer 4: Database Layer
- Firestore Database for user profiles and game statistics
- Firebase Storage for themed card images and educational content
- Real-time data synchronization capabilities

This architecture ensures the application can operate offline during local multiplayer sessions while automatically synchronizing progress when internet connectivity is restored.

---

## Features

### Core Functionality
- **User Authentication:** Google SSO integration with Firebase Authentication
- **Profile Management:** User settings, preferences, and profile updates
- **Game Result Processing:** Score calculation, validation, and storage
- **Level Progress Tracking:** Star ratings, completion status, and unlock management
- **Leaderboard System:** Global rankings with filtering by game mode
- **Achievement Management:** Unlock tracking, progress updates, and notifications
- **Theme Management:** Multiple card themes with dynamic content delivery
- **Multiplayer Support:** Local multiplayer result tracking and history

### Technical Features
- **RESTful Design:** Stateless API following REST principles
- **JSON Data Exchange:** Standardized request/response format
- **Error Handling:** Comprehensive error messages and status codes
- **Request Logging:** Detailed logging for debugging and monitoring
- **CORS Support:** Cross-origin resource sharing configuration
- **Rate Limiting:** Protection against abuse (configurable)
- **Data Validation:** Input validation and sanitization
- **Scalable Architecture:** Serverless deployment with auto-scaling

---

## Technology Stack

### Backend Framework
- **Node.js:** v18.0.0 or higher
- **Express.js:** v4.18.2
- **Body-Parser:** v1.20.2

### Cloud Services
- **Firebase Admin SDK:** v11.5.0
- **Firestore Database:** NoSQL document database
- **Firebase Storage:** Blob storage for media assets
- **Firebase Authentication:** User identity management
- **Firebase Hosting:** CDN for static content

### Development Tools
- **dotenv:** Environment variable management
- **nodemon:** Development server with auto-reload
- **CORS:** Cross-origin resource sharing middleware

### API Design
- **REST Architecture:** Resource-based URL structure
- **HTTP Methods:** GET, POST, PUT, DELETE
- **Status Codes:** Standard HTTP status code implementation
- **JSON Format:** Request/response data format

---

## Prerequisites

Before installing and running the Memory Match Madness API, ensure you have the following:

### Required Software
- **Node.js:** Version 18.0.0 or higher
- **npm:** Version 8.0.0 or higher (comes with Node.js)
- **Git:** For version control and cloning the repository

### Firebase Project Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database in Native mode
3. Enable Firebase Storage
4. Enable Firebase Authentication with Google Sign-In provider
5. Generate a service account key (JSON file) from Project Settings > Service Accounts

### System Requirements
- **Operating System:** Windows 10/11, macOS 10.15+, or Linux
- **RAM:** Minimum 4GB
- **Storage:** Minimum 500MB free space
- **Internet Connection:** Required for Firebase services

---

## Installation

Follow these steps to install and set up the Memory Match Madness API:

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-team/memory-match-madness-api.git
cd memory-match-madness-api
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`:
- express
- firebase-admin
- body-parser
- cors
- dotenv

### Step 3: Verify Installation

```bash
npm list
```

Ensure all dependencies are installed without errors.

---

## Configuration

### Step 1: Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"

# API Configuration
API_VERSION=2.0.0
ALLOWED_ORIGINS=*
```

### Step 2: Firebase Service Account

1. Download your Firebase service account JSON file
2. Save it as `serviceAccountKey.json` in the project root
3. Ensure this file is listed in `.gitignore` to prevent accidental commits

**Alternative:** Use environment variables (recommended for production):
- Extract values from the JSON file
- Add them to your `.env` file as shown above

### Step 3: Firebase Collections Setup

The API expects the following Firestore collections:
- `users` - User profiles and settings
- `games` - Game results and statistics
- `levelProgress` - Level completion data
- `achievements` - User achievements
- `themes` - Card theme configurations
- `multiplayerGames` - Multiplayer match results

These collections will be created automatically when data is first inserted.

### Step 4: Verify Configuration

```bash
node -e "require('dotenv').config(); console.log(process.env.PORT)"
```

Should output: `3000`

---

## Running the API

### Development Mode

Start the server with auto-reload on file changes:

```bash
npm run dev
```

Expected output:
```
Server running on port 3000
Firebase Admin initialized successfully
Memory Match Madness API v2.0.0 - READY
```

### Production Mode

Start the server in production mode:

```bash
npm start
```

### Verify the API is Running

Open a browser or use curl:

```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "message": "Memory Match Madness API",
  "version": "2.0.0",
  "status": "running",
  "timestamp": "2025-01-16T10:30:00.000Z",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "games": "/api/games",
    "achievements": "/api/achievements",
    "themes": "/api/themes",
    "multiplayer": "/api/multiplayer",
    "health": "/api/health"
  }
}
```

### Health Check

Monitor API health:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-16T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 45678901,
    "heapTotal": 12345678,
    "heapUsed": 8765432,
    "external": 1234567
  }
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "PlayerOne"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "firebase-uid-here",
  "message": "User registered successfully"
}
```


---

#### POST /api/auth/login
Authenticate user and receive session token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "firebase-uid-here",
  "email": "user@example.com",
  "username": "PlayerOne"
}
```


---

#### POST /api/auth/verify
Verify authentication token validity.

**Request:**
```json
{
  "token": "firebase-custom-token"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "firebase-uid-here",
  "message": "Token is valid"
}
```

---

#### GET /api/auth/user/:userId
Retrieve user information by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "firebase-uid-here",
    "email": "user@example.com",
    "username": "PlayerOne",
    "emailVerified": true,
    "createdAt": "2025-01-15T08:30:00Z",
    "lastSignIn": "2025-01-16T10:15:00Z"
  }
}
```

**Screenshot:**
![Get User Info Endpoint](images/api_user_info.png)

---

#### POST /api/auth/reset-password
Generate password reset link for user.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "resetLink": "https://firebase-reset-link",
  "message": "Password reset link generated"
}
```


---

### User Management Endpoints

#### GET /api/users/:userId
Retrieve complete user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "firebase-uid-here",
    "email": "user@example.com",
    "username": "PlayerOne",
    "settings": {
      "language": "en",
      "soundEnabled": true,
      "musicEnabled": true,
      "notificationsEnabled": true
    },
    "stats": {
      "gamesPlayed": 150,
      "totalScore": 45000,
      "averageAccuracy": 87.5
    }
  }
}
```

**Screenshot:**
![Get User Profile Endpoint](images/screenshots/api_user_profile.png)

---

#### POST /api/users/:userId
Create or update user profile.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "PlayerOne",
  "settings": {
    "language": "en",
    "soundEnabled": true,
    "musicEnabled": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile updated successfully"
}
```


---

#### GET /api/users/:userId/progress
Retrieve user's level progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "levels": [
      {
        "levelNumber": 1,
        "stars": 3,
        "bestScore": 1500,
        "bestTime": 45,
        "isUnlocked": true,
        "isCompleted": true
      }
    ],
    "totalStars": 48,
    "completedCount": 16
  }
}
```

**Screenshot:**
![Get Level Progress Endpoint](images/screenshots/api_level_progress.png)

---

#### PUT /api/users/:userId/settings
Update user settings and preferences.

**Request:**
```json
{
  "language": "zu",
  "soundEnabled": false,
  "notificationsEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated"
}
```


---

## API Endpoints

### Authentication Endpoints (`/api/auth`)


```

#### GET /api/auth/user/:userId
Retrieve user information by user ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "firebase-uid-here",
    "email": "user@example.com",
    "username": "PlayerOne",
    "emailVerified": true,
    "createdAt": "2025-01-15T08:30:00Z",
    "lastSignIn": "2025-01-16T10:15:00Z"
  }
}
```

**Screenshot:**
![Get User Info Endpoint](images/api_user_info.png)



### User Management Endpoints (`/api/users`)

#### GET /api/users/:userId
Retrieve complete user profile from Firestore.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "firebase-uid-here",
    "email": "user@example.com",
    "username": "PlayerOne",
    "settings": {
      "language": "en",
      "soundEnabled": true,
      "musicEnabled": true,
      "notificationsEnabled": true
    },
    "totalGamesPlayed": 150,
    "gamesWon": 95,
    "lastUpdated": "2025-01-16T10:30:00Z"
  }
}
```

**Screenshot:**
![Get User Profile Endpoint](images/api_user_profile.png)


---

#### GET /api/users/:userId/level-progress
Retrieve user's level progression data (sorted by level number).

**Response:**
```json
{
  "success": true,
  "data": {
    "levels": [
      {
        "levelNumber": 1,
        "stars": 3,
        "bestScore": 1500,
        "bestTime": 45,
        "bestMoves": 12,
        "isUnlocked": true,
        "isCompleted": true
      }
    ],
    "totalStars": 48,
    "completedCount": 16
  }
}
```

**Screenshot:**
![Get Level Progress Endpoint](images/api_level_progress.png)


---


#### GET /api/games/leaderboard
Retrieve global leaderboard rankings.

**Query Parameters:**
- `mode` (optional): Game mode filter - ARCADE or ADVENTURE (default: ARCADE)
- `limit` (optional): Number of entries to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user-id-1",
      "username": "TopPlayer",
      "score": 5000,
      "timeTaken": 120,
      "completedAt": "2025-01-16T10:30:00Z"
    }
  ]
}
```

**Screenshot:**
![Get Leaderboard Endpoint](images/api_leaderboard.png)

---

### Achievement Endpoints (`/api/achievements`)

#### GET /api/achievements/user/:userId
Retrieve all user achievements with unlock status and progress.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "achievementId": "ach-id-1",
      "userId": "firebase-uid-here",
      "achievementType": "FIRST_WIN",
      "name": "First Victory",
      "description": "Win your first game",
      "isUnlocked": true,
      "progress": 100,
      "unlockedAt": "2025-01-15T12:00:00Z",
      "createdAt": "2025-01-15T11:00:00Z"
    }
  ]
}
```

**Screenshot:**
![Get User Achievements Endpoint](images/api_achievements.png)

---


### Theme Management Endpoints (`/api/themes`)

#### GET /api/themes
Retrieve all available card themes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "animals",
      "displayName": "Animals",
      "previewImageUrl": null,
      "cardImageUrls": []
    },
    {
      "id": "pokemon",
      "displayName": "Pokémon",
      "previewImageUrl": null,
      "cardImageUrls": []
    },
    {
      "id": "fruits",
      "displayName": "Fruits & Foods",
      "previewImageUrl": null,
      "cardImageUrls": []
    },
    {
      "id": "harry_potter",
      "displayName": "Harry Potter",
      "previewImageUrl": null,
      "cardImageUrls": []
    },
    {
      "id": "f1",
      "displayName": "F1",
      "previewImageUrl": null,
      "cardImageUrls": []
    }
  ]
}
```

**Screenshot:**
![Get All Themes Endpoint](images/api_themes.png)

---


### Multiplayer Endpoints (`/api/multiplayer`)

#### POST /api/multiplayer/result
Submit local multiplayer game result with player scores.

**Request:**
```json
{
  "userId": "firebase-uid-here",
  "theme": "ANIMALS",
  "player1Score": 8,
  "player2Score": 6,
  "timeTaken": 180,
  "totalMoves": 28,
  "timestamp": 1705400000000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Multiplayer result saved successfully",
  "data": {
    "gameId": "multiplayer-doc-id",
    "winner": "player1"
  }
}
```

**Screenshot:**
![Submit Multiplayer Result Endpoint](images/api_multiplayer.png)


---

### Health & Status Endpoint

#### GET /api/health
Check API health status and server information.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-16T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 45678901,
    "heapTotal": 12345678,
    "heapUsed": 8765432,
    "external": 1234567
  }
}
```

**Screenshot:**
![Health Check Endpoint](images/api_health.png)

---


## Database Schema

### Firestore Collections Structure

#### users Collection
```javascript
{
  userId: string,              // Firebase Auth UID
  email: string,               // User email
  username: string,            // Display name
  settings: {
    language: string,          // en, zu, af
    soundEnabled: boolean,
    musicEnabled: boolean,
    notificationsEnabled: boolean
  },
  stats: {
    gamesPlayed: number,
    totalScore: number,
    averageAccuracy: number
  },
  createdAt: timestamp,
  lastUpdated: timestamp
}
```

#### games Collection
```javascript
{
  userId: string,              // Reference to user
  gameMode: string,            // ADVENTURE, ARCADE, MULTIPLAYER
  levelNumber: number,         // Level identifier
  theme: string,               // POKEMON, ANIMALS, etc.
  score: number,               // Final score
  timeTaken: number,           // Seconds
  moves: number,               // Total moves made
  accuracy: number,            // Percentage
  stars: number,               // 0-3 star rating
  completedAt: timestamp,
  isSynced: boolean
}
```

#### levelProgress Collection
```javascript
{
  userId: string,
  levelNumber: number,
  stars: number,               // 0-3
  bestScore: number,
  bestTime: number,
  bestMoves: number,
  isUnlocked: boolean,
  isCompleted: boolean,
  lastPlayed: timestamp
}
```

#### achievements Collection
```javascript
{
  achievementId: string,
  userId: string,
  achievementType: string,     // FIRST_WIN, SPEED_DEMON, etc.
  name: string,
  description: string,
  isUnlocked: boolean,
  progress: number,            // 0-100
  unlockedAt: timestamp,
  createdAt: timestamp,
  isSynced: boolean
}
```

#### themes Collection
```javascript
{
  id: string,                  // POKEMON, ANIMALS, etc.
  displayName: string,
  previewImageUrl: string,
  cardImageUrls: array,        // Array of image URLs
  updatedAt: timestamp
}
```

#### multiplayerGames Collection
```javascript
{
  userId: string,
  gameMode: string,            // Always MULTIPLAYER
  theme: string,
  player1Score: number,
  player2Score: number,
  winner: string,              // player1, player2, or tie
  timeTaken: number,
  totalMoves: number,
  timestamp: number,
  createdAt: timestamp
}
```

---

## Part 3 Updates

### Implementation Summary

Part 3 focused on finalizing the RESTful API with comprehensive endpoint coverage, robust error handling, and production-ready features. All requirements from Parts 1 and 2 have been successfully implemented and integrated.

### Key Achievements

#### 1. Complete API Implementation
- Implemented all 6 endpoint categories (Auth, Users, Games, Achievements, Themes, Multiplayer)
- Total of 20+ functional endpoints
- Comprehensive request validation and error handling
- Standardized JSON response format across all endpoints

#### 2. Firebase Integration
- Firestore Database for all data persistence
- Firebase Authentication for secure user management
- Firebase Storage for themed card images
- Real-time data synchronization capabilities

#### 3. Advanced Features
- Level progress tracking with star ratings
- Global leaderboard system with filtering
- Achievement unlock system with progress tracking
- Multi-theme support with dynamic content delivery
- Multiplayer game result management

#### 4. Production Readiness
- Environment-based configuration
- Comprehensive error handling and logging
- CORS configuration for cross-origin support
- Health check endpoint for monitoring
- Request logging middleware

### Feedback Implementation

#### Part 1 Feedback
**Score:** 100%  
**Action:** No feedback provided - all requirements met excellently

#### Part 2 Feedback
**Score:** 100%  
**Action:** No feedback provided - all features implemented successfully

### Updates Based on Project Requirements

#### Minimum POE Requirements Met
- **Single Sign-On (SSO):** Google authentication via Firebase Auth
- **RESTful API:** Complete implementation with all standard HTTP methods
- **Database Connection:** Firestore NoSQL database integration
- **Offline Mode with Sync:** RoomDB support on Android with API sync endpoints
- **Real-time Notifications:** Achievement unlock triggers and game event notifications
- **Multi-language Support:** English, isiZulu, Afrikaans content delivery

#### Additional Enhancements
- Comprehensive API documentation
- Detailed endpoint testing capabilities
- Scalable serverless architecture
- Professional error handling
- Request validation and sanitization

---

## Testing

### Manual API Testing

#### Using cURL

Test the root endpoint:
```bash
curl http://localhost:3000/
```

Test user registration:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "TestUser"
  }'
```

Test game result submission:
```bash
curl -X POST http://localhost:3000/api/games/result \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "firebase-uid",
    "gameMode": "ADVENTURE",
    "levelNumber": 1,
    "theme": "POKEMON",
    "score": 1500,
    "timeTaken": 60,
    "moves": 15,
    "accuracy": 95,
    "stars": 3
  }'
```

#### Using Postman

1. Import the API endpoint collection
2. Configure environment variables (base URL, auth tokens)
3. Execute test requests for each endpoint
4. Verify response status codes and data structure

### Automated Testing

Create test scripts using Jest or Mocha:

```bash
npm install --save-dev jest supertest
```

Example test file (`tests/api.test.js`):
```javascript
const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  test('GET / should return API info', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.version).toBe('2.0.0');
  });

  test('GET /api/health should return OK status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});
```

Run tests:
```bash
npm test
```

---

## Deployment

### Local Deployment

The API is configured to run on `localhost:3000` by default for development purposes.

### Cloud Deployment Options

#### Option 1: Firebase Functions

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init functions
```

3. Deploy:
```bash
firebase deploy --only functions
```

#### Option 2: Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create memory-match-madness-api
```

3. Deploy:
```bash
git push heroku main
```

4. Set environment variables:
```bash
heroku config:set FIREBASE_PROJECT_ID=your-project-id
```

#### Option 3: Google Cloud Platform

1. Install Google Cloud SDK
2. Create App Engine app:
```bash
gcloud app create
```

3. Deploy:
```bash
gcloud app deploy
```

### Production Considerations

- Enable HTTPS/SSL certificates
- Implement rate limiting
- Set up monitoring and logging
- Configure CORS for production domains
- Implement API authentication tokens
- Set up automated backups for Firestore
- Configure CDN for static assets

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Firebase Connection Error
**Error:** `Firebase Admin SDK not initialized`

**Solution:**
1. Verify `.env` file contains correct Firebase credentials
2. Check `serviceAccountKey.json` file exists and is valid
3. Ensure Firebase project ID matches your actual project

#### Issue 2: Port Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

---

### 🏫 Educational Institution

<div align="center">

**The Independent Institute of Education (Pty) Ltd**

📚 **Module:** PROG7314 - Programming 3D  
📅 **Academic Year:** 2025  
🎓 **Course:** BCAD Year 3

</div>

---




###  Made  by Team J.A.C.T

<p align="center">
  <a href="#top" title="Back to top"
     style="display:inline-block;padding:10px 16px;background:#0ea5e9;color:#ffffff;border-radius:9999px;text-decoration:none;font-weight:600;">
    ⬆️ Back to top
  </a>
</p>


</div>

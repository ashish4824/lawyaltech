# Layler Points Tracking System

## Project Overview
A scalable and flexible points tracking system designed to reward users for completing various tasks and activities, with advanced dashboard capabilities and comprehensive point calculation logic.

## Project Structure

```
layler-backend/
│
├── src/
│   ├── routes/           # Express route definitions
│   ├── controllers/      # Business logic and request handling
│   ├── models/           # Mongoose data models
│   ├── middleware/       # Custom middleware functions
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
│
├── public/               # Static files
├── logs/                 # Application logs
├── tests/                # Unit and integration tests
│
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── index.js              # Application entry point
└── package.json          # Project dependencies and scripts
```

## Technical Architecture
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose ORM
- **Logging**: Custom middleware for structured logging
- **Features**: 
  - Flexible point calculation
  - Milestone-based rewards
  - Comprehensive dashboard endpoints

## Prerequisites
- Node.js (v14 or later)
- npm or Yarn
- MongoDB (v4 or later)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with necessary environment variables

4. Run the application:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Scripts

- `npm start`: Run the application
- `npm run dev`: Run with nodemon for development
- `npm test`: Run tests
- `npm run lint`: Check code quality
- `npm run lint:fix`: Automatically fix linting issues

## MongoDB Setup
1. Install MongoDB Community Edition
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - macOS: Use Homebrew `brew tap mongodb/brew && brew install mongodb-community`
   - Linux: Follow [official MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. Start MongoDB Service
   ```bash
   # Windows
   net start mongodb

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

## Environment Configuration
Create a `.env` file in the project root:
```
# MongoDB Connection String
MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin

# Server Port (default: 3000)
PORT=3000
```

## Running the Application
```bash
# Start the server
npm start

# Development mode with auto-reload
npm run dev
```

## Point System and Dashboard Implementation

## Point Calculation Logic

The point system is designed to reward users for various activities with a flexible and scalable approach.

### Activity Types
- Learning
- Project Completion
- Challenges
- Collaboration
- Milestones

### Difficulty Levels
- Easy: Basic activities
- Medium: Intermediate complexity
- Hard: Advanced tasks
- Expert: Highly complex activities

### Base Point Calculation
Points are calculated based on two primary factors:
1. Activity Type
2. Difficulty Level

Example Point Ranges:
- Learning (Easy): 10 points
- Learning (Expert): 100 points
- Project (Easy): 20 points
- Project (Expert): 250 points

### Bonus Points
Additional points are awarded for:
- Consistent daily activity (streak bonus)
- Completing milestone activities

## Dashboard Endpoints

### GET /api/points/users/dashboard/summary
Returns an overview of user's point system:
- Total points
- Activity progress by type
- Percentage distribution

### GET /api/points/users/dashboard/details
Provides comprehensive activity statistics:
- Recent activities
- Points breakdown by difficulty
- Activity type distribution

### POST /api/activity/activity
Record a new user activity with points calculation

## Example Request
```json
{
  "userId": "Webster30",
  "activityType": "project",
  "difficultyLevel": "medium",
  "description": "Completed backend API implementation"
}
```

## Evaluation Criteria
- Logical point calculation
- Scalable design
- Real-time updates
- Comprehensive tracking

## API Endpoints

### 1. Dashboard Summary
```
GET /api/points/users/dashboard/summary
```
#### Query Parameters
- `userId` (optional): Specific user's dashboard
- `aggregate` (optional): Get system-wide summary
- `top` (optional): Limit number of top users

#### Response Scenarios
1. User-Specific Dashboard
```json
{
  "status": "success",
  "data": {
    "totalPoints": 250,
    "activityProgress": [
      {
        "type": "learning",
        "activities": 5,
        "points": 100,
        "percentage": "40.00"
      },
      {
        "type": "project",
        "activities": 3,
        "points": 150,
        "percentage": "60.00"
      }
    ]
  }
}
```

2. Aggregate Summary
```json
{
  "status": "success", 
  "data": {
    "totalUsers": 500,
    "totalPoints": 50000,
    "averagePoints": 100.50,
    "topUsers": [...]
  }
}
```

### 2. Dashboard Details
```
GET /api/points/users/dashboard/details
```
#### Query Parameters
- `userId` (required): Specific user's details
- `startDate` (optional): Filter activities from this date
- `endDate` (optional): Filter activities up to this date

#### Response Example
```json
{
  "status": "success",
  "data": {
    "recentActivities": [
      {
        "activityType": "project",
        "difficultyLevel": "medium",
        "points": 50,
        "timestamp": "2025-02-11T18:00:00Z"
      }
    ],
    "stats": {
      "totalActivities": 10,
      "pointsByDifficulty": {
        "easy": 100,
        "medium": 200,
        "hard": 150
      },
      "activityTypeBreakdown": {
        "learning": 5,
        "project": 3,
        "challenge": 2
      }
    }
  }
}
```

### 3. Record Activity
```
POST /api/activity/activity
```
#### Request Body
```json
{
  "userId": "user123",
  "activityType": "project",
  "difficultyLevel": "medium",
  "description": "Completed backend API implementation"
}
```

#### Response Example
```json
{
  "status": "success",
  "data": {
    "activity": {
      "userId": "user123",
      "activityType": "project",
      "difficultyLevel": "medium",
      "points": 50
    },
    "basePoints": 50,
    "bonusPoints": 25,
    "totalPoints": 75
  }
}
```

### 4. Get User Activities
```
GET /api/activity/activities
```
#### Query Parameters
- `userId` (required): User ID to fetch activities for
- `activityType` (optional): Filter by specific activity type
- `difficultyLevel` (optional): Filter by difficulty level
- `startDate` (optional): Start date for activity filter
- `endDate` (optional): End date for activity filter
- `limit` (optional, default: 50): Number of activities per page
- `page` (optional, default: 1): Page number for pagination

#### Response Example
```json
{
  "status": "success",
  "data": {
    "activities": [
      {
        "userId": "user123",
        "activityType": "project",
        "difficultyLevel": "medium",
        "points": 50,
        "description": "Completed backend API",
        "timestamp": "2025-02-11T18:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalActivities": 120,
      "limit": 50
    }
  }
}
```

#### Example Request
```
GET /api/activity/activities?userId=user123&activityType=project&startDate=2025-01-01&endDate=2025-02-28&page=1&limit=10
```

## Supported Activity Types
- `learning`: Educational activities
- `project`: Project completions
- `challenge`: Coding challenges
- `collaboration`: Team collaborations
- `milestone`: Major achievements

## Difficulty Levels
- `easy`: Basic activities
- `medium`: Intermediate complexity
- `hard`: Advanced tasks
- `expert`: Highly complex activities

## Bonus Point Rules
- Streak Bonus: 50 points per week of consistent activity
- Milestone Bonus: 100 points per milestone activity
- Difficulty-based point scaling

## Performance Considerations
- Indexed database queries
- Efficient point calculation
- Atomic database transactions
- Comprehensive error handling

## Troubleshooting
- Verify MongoDB connection
- Check firewall settings
- Ensure `.env` configuration
- Review server logs for detailed errors

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License

## Contact
For support or inquiries, please open an issue on GitHub.

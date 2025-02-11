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

## Point System Logic

### Point Calculation Strategy
The system implements a multi-tiered, configurable point allocation mechanism:

#### Base Points
- Regular Tasks: 10 points
- High-Priority Tasks: 20 points
- Activities: 15 points

#### Milestone Bonuses
1. Task Completion Milestones
   - Every 5 tasks completed: +50 bonus points
   - Every 3 high-priority tasks: +30 bonus points

2. Total Points Milestone
   - Reaching 100 total points: Additional 100 points bonus

### Calculation Mechanism
```javascript
function calculatePoints(taskType, userProgress) {
  let points = BASE_POINTS[taskType];
  
  // Milestone bonus logic
  if (isMilestoneReached(taskType, userProgress)) {
    points += MILESTONE_BONUS[taskType];
  }
  
  // Grand milestone bonus
  if (isGrandMilestoneReached(userProgress.totalPoints)) {
    points += GRAND_MILESTONE_BONUS;
  }
  
  return points;
}
```

## API Endpoints

### 1. Dashboard Summary
```
GET /api/users/dashboard/summary
```
#### Query Parameters
- `userId` (optional): Specific user's dashboard
- `aggregate` (optional): Get system-wide summary
- `top` (optional): Limit number of top users

#### Response Scenarios
1. User-Specific Dashboard
```json
{
  "userId": "user123",
  "totalPoints": 100,
  "progress": {
    "tasksCompleted": 5,
    "highPriorityTasksCompleted": 2,
    "activitiesCompleted": 3
  },
  "ranking": 15
}
```

2. Aggregate Summary
```json
{
  "totalUsers": 500,
  "totalPoints": 50000,
  "averagePoints": 100.50,
  "topUsers": [...]
}
```

### 2. Dashboard Details
```
GET /api/users/dashboard/details
```
#### Query Parameters
- `userId` (optional): Specific user's details
- `detailed` (optional): Get comprehensive breakdown
- `timeframe` (optional): Filter by time period

#### Response Scenarios
1. User Details
```json
{
  "userId": "user123",
  "totalPoints": 100,
  "progress": {
    "tasksCompleted": 5,
    "highPriorityTasksCompleted": 2,
    "activitiesCompleted": 3
  }
}
```

2. Detailed Breakdown
```json
{
  "userId": "user123",
  "totalPoints": 100,
  "detailedBreakdown": {
    "taskTypes": {
      "task": { "total": 5, "points": 50 },
      "highPriorityTask": { "total": 2, "points": 40 }
    },
    "milestones": {
      "taskMilestone": { "reached": 1, "bonusPoints": 50 }
    }
  }
}
```

### 3. Update Points
```
POST /api/users/update
```
#### Request Body
```json
{
  "userId": "user123",
  "taskType": "task" | "highPriorityTask" | "activity"
}
```

### 4. Create User
```
POST /api/users/create
```
#### Request Body
```json
{
  "userId": "unique_user_id",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "initialPoints": 0
}
```

## Supported Task Types
- `task`: Regular tasks (10 points)
- `highPriorityTask`: High-priority tasks (20 points)
- `activity`: General activities (15 points)

## Bonus Point Rules
- Every 5 tasks: +50 points
- Every 3 high-priority tasks: +30 points
- Reaching 100 total points: +100 points

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

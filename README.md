# Workout Tracker

A full-stack MERN application for tracking your gym workouts and progress.

## Features

- User authentication (signup/login)
- JWT-based session management
- Secure password encryption with bcrypt
- Create, read, update, and delete workouts
- Track exercises with sets, reps, and weights
- User-specific workout data
- Modern Material-UI interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd workout-tracker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/workout-tracker
JWT_SECRET=your-secret-key
PORT=5000
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/signup - Register a new user
- POST /api/auth/login - Login user

### Workouts
- GET /api/workouts - Get all workouts for the authenticated user
- POST /api/workouts - Create a new workout
- PUT /api/workouts/:id - Update a workout
- DELETE /api/workouts/:id - Delete a workout

## Technologies Used

- MongoDB - Database
- Express.js - Backend framework
- React.js - Frontend framework
- Node.js - Runtime environment
- Material-UI - UI components
- JWT - Authentication
- bcrypt - Password encryption
- Axios - HTTP client 
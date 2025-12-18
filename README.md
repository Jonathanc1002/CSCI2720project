# CSCI2720 Project

A full-stack web application built with React frontend and Express/MongoDB backend featuring user authentication, location management, favorites, comments, and an admin panel.

## Project Structure

```
CSCI2720project/
├── backend/                      # Express.js backend
│   ├── config/
│   │   └── db.js                # MongoDB connection configuration
│   ├── controllers/             # Request handlers
│   │   ├── adminEventController.js
│   │   ├── adminUserController.js
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── favoriteController.js
│   │   ├── locationController.js
│   │   └── userController.js
│   ├── middleware/              # Custom middleware
│   │   ├── adminOnlyMiddleware.js
│   │   └── demoAuthMiddleware.js
│   ├── models/                  # Mongoose schemas
│   │   ├── Comment.js
│   │   ├── Event.js
│   │   ├── User.js
│   │   └── Venue.js
│   ├── preprocess/              # Data fetching and seeding
│   │   ├── fetch/
│   │   │   ├── fetchXML.js
│   │   │   └── xmlParser.js
│   │   ├── areaMapping.js
│   │   ├── parseEventDates.js
│   │   ├── parseEvents.js
│   │   ├── parseVenues.js
│   │   ├── preprocessAll.js
│   │   └── seedUsers.js
│   ├── routes/                  # API route definitions
│   │   ├── adminEventRoutes.js
│   │   ├── adminUserRoutes.js
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── locationRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   └── seedUsers.js
│   ├── services/                # Business logic layer
│   │   ├── commentServices.js
│   │   ├── eventServices.js
│   │   ├── userServices.js
│   │   └── venueServices.js
│   ├── .env.example
│   ├── index.js
│   ├── server.js                # Entry point
│   └── package.json
├── frontend/                    # React frontend
│   ├── public/
│   │   └── index.html           # HTML template with Leaflet CSS
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   ├── ThemeToggle.js
│   │   │   └── ThemeToggle.css
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/               # Page components
│   │   │   ├── AdminPanel.js
│   │   │   ├── AdminPanel.css
│   │   │   ├── Favorites.js
│   │   │   ├── Favorites.css
│   │   │   ├── LocationDetail.js
│   │   │   ├── LocationDetail.css
│   │   │   ├── LocationList.js
│   │   │   ├── LocationList.css
│   │   │   ├── Login.js
│   │   │   ├── Login.css
│   │   │   ├── MapView.js       # OpenStreetMap with Leaflet
│   │   │   └── MapView.css
│   │   ├── services/            # API service layer
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── commentService.js
│   │   │   ├── eventService.js
│   │   │   ├── favoriteService.js
│   │   │   └── locationService.js
│   │   ├── App.css
│   │   ├── App.js               # Main App component with routing
│   │   ├── index.css            # Global styles and theme variables
│   │   └── index.js             # Entry point
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Features

- **User Authentication**: Login/logout with bcrypt password hashing
- **Location Management**: Browse and view detailed location information with events
- **Favorites System**: Add and remove favorite locations
- **Comments**: Post and view comments on locations
- **Admin Panel**: Manage users and events (admin only)
- **Map View**: Interactive map of all locations
- **Dark/Light Theme**: Toggle between dark and light themes with persistent preference

## Technologies Used

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Bcrypt.js (password hashing)
- JWT (authentication)
- CORS

### Frontend
- React 18
- React Router v6
- Axios (API calls)
- Context API (state management)
- CSS3 with theme support

## Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Jonathanc1002/CSCI2720project.git
cd CSCI2720project
```

### Step 2: Set Up MongoDB

**Option A: macOS (with Homebrew)**
```bash
# If MongoDB is not installed:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
mongod --dbpath /opt/homebrew/var/mongodb &
```

**Option B: macOS (manual)**
```bash
# Create data directory if it doesn't exist
mkdir -p ~/mongodb-data

# Start MongoDB with custom data path
mongod --dbpath ~/mongodb-data &
```

**Option C: Windows**
```bash
# Start MongoDB (usually installed as a service)
net start MongoDB

# Or manually:
mongod --dbpath "C:\data\db"
```

**Option D: Linux**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or manually:
mongod --dbpath /var/lib/mongodb
```

**Verify MongoDB is running:**
```bash
# Check if MongoDB is listening on port 27017
lsof -i :27017

# Or try connecting with mongosh
mongosh mongodb://127.0.0.1:27017
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the backend server (runs on port 5001)
node server.js
```

The backend server will:
- Connect to MongoDB at `mongodb://127.0.0.1:27017/csci2720`
- Start listening on `http://localhost:5001`
- Display "Server is running on port 5001" when ready
- Display "MongoDB Connected" when database connection is established

### Step 4: Frontend Setup

**Open a new terminal window** (keep backend running), then:

```bash
# Navigate to frontend directory from project root
cd frontend

# Install dependencies
npm install

# Start the React development server (runs on port 3000)
npm start
```

The frontend will:
- Automatically open in your browser at `http://localhost:3000`
- Hot-reload when you make changes
- Connect to backend API at `http://localhost:5001`

### Step 5: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## Demo Accounts

### Regular User
- **Username**: `demouser`
- **Password**: `password`

### Admin User
- **Username**: `admin`
- **Password**: `password`

## Quick Start Commands

For future use, here's the complete startup sequence:

```bash
# Terminal 1: Start MongoDB
mongod --dbpath /opt/homebrew/var/mongodb &

# Terminal 2: Start Backend
cd backend && node server.js

# Terminal 3: Start Frontend
cd frontend && npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location details with events and comments

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites/:id` - Remove favorite

### Comments
- `GET /api/locations/:id/comments` - Get location comments
- `POST /api/locations/:id/comments` - Post comment

### Admin (Authentication Required)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/events` - Get all events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Check port 27017
lsof -i :27017

# Restart MongoDB
pkill mongod
mongod --dbpath /opt/homebrew/var/mongodb &
```

### Backend Not Starting
```bash
# Check if port 5001 is in use
lsof -i :5001

# Kill process on port 5001
kill -9 $(lsof -t -i:5001)

# Restart backend
cd backend && node server.js
```

### Frontend Not Starting
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process and restart
pkill -f react-scripts
cd frontend && npm start
```

### Database is Empty
The application includes seed data that will be loaded automatically. If you need to reset the database, you can connect via mongosh and drop the collections.

## Development

### Project Structure
```
CSCI2720project/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React Context (Auth, Theme)
│   │   ├── App.js       # Main component
│   │   └── index.js     # Entry point
│   └── package.json
└── README.md
```

## License
This project is for educational purposes as part of CSCI2720 course. 

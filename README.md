"# CSCI2720 Project

A full-stack web application built with React frontend and Express/MongoDB backend.

## Project Structure

```
CSCI2720project/
├── backend/              # Express.js backend
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/            # React frontend
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── App.js      # Main App component
│   │   └── index.js    # Entry point
│   └── package.json
└── README.md
```

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Axios (for external API calls)
- XML2JS (for XML parsing)
- CORS

### Frontend
- React
- React Router
- Axios (for API calls)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/csci2720project
   NODE_ENV=development
   ```

5. Start the backend server:
   ```bash
   npm run dev    # Development mode with nodemon
   npm start      # Production mode
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL:
   ```
   REACT_APP_API_URL=http://localhost:3000
   ```

5. Start the frontend development server:
   ```bash
   npm start
   ```

The application will open in your browser at `http://localhost:3000` (frontend) and the API will run on `http://localhost:3000` (backend).

## API Endpoints

### Example Routes
- `GET /` - API status check
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

## Development

### Running Both Servers
You can run both frontend and backend concurrently by opening two terminal windows:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### Adding New Features
1. Create models in `backend/models/`
2. Create controllers in `backend/controllers/`
3. Define routes in `backend/routes/`
4. Create React components in `frontend/src/components/`
5. Create pages in `frontend/src/pages/`

## License
This project is for educational purposes as part of CSCI2720 course." 

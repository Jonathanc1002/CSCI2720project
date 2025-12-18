const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes")
const preprocessAll = require("./preprocess/preprocessAll");
const seedUsers = require("./preprocess/seedUsers");
const commentRoutes = require("./routes/commentRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes"); 
const adminEventRoutes = require("./routes/adminEventRoutes"); 

const { connectDB } = require('./index');

const app = express();

const PORT = process.env.PORT || 5001;

// DB 
connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/', (req, res) => {
  res.json({ message: 'CSCI2720 Project API' });
});
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api", commentRoutes);
app.use("/api/users", favoriteRoutes);
app.use("/api", adminUserRoutes);  
app.use("/api", adminEventRoutes); 

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const startServer =  async () => {
  try {
    // Seed demo users first
    console.log("Seeding demo users...");
    await seedUsers();
    
    // 🔹 fetch → preprocess → DB insert
    console.log("Running preprocess pipeline...");
    await preprocessAll();
    console.log("Preprocess completed");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

// backend/scripts/seedUsers.js

const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URI = "mongodb://127.0.0.1:27017/csci2720"; // 네 DB 이름 맞게

const run = async () => {
  await mongoose.connect(MONGO_URI);

  await User.deleteMany({});

  const admin = new User({
    username: "admin",
    password: "adminpass",
    isAdmin: true,
    favoriteLocations: []
  });

  const user = new User({
    "username": "anonymous",
    "password": "anonymous",
    "isAdmin": false,
    "favoriteLocations": []
  });

  await admin.save();
  await user.save();

  console.log("Seed users created:");
  console.log("- admin / adminpass");
  console.log("- user1 / password123");

  process.exit(0);
};

run();

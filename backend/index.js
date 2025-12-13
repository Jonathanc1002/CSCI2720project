// backend/index.js
const connectDB = require('./config/db');

// register models (side effects)
require('./models/User');
require('./models/Venue');
require('./models/Event');
require('./models/Comment');

// services
const userServices = require('./services/userServices');
const venueServices = require('./services/venueServices');
const commentServices = require('./services/commentServices');
const eventServices = require('./services/eventServices');

module.exports = {
  connectDB,
  ...userServices,
  ...venueServices,
  ...commentServices,
  ...eventServices
};

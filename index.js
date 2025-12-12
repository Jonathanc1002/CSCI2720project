const connectDB = require('./backend/config/db');

// Services
const userServices = require('./backend/services/userServices');
const venueServices = require('./backend/services/venueServices');
const commentServices = require('./backend/services/commentServices');
const eventServices = require('./backend/services/eventServices');

require("./Venue");
require("./Event");
require("./User");
require("./Comment");


module.exports = {
  connectDatabase: connectDB,
  ...userServices,
  ...venueServices,
  ...commentServices,
  ...eventServices
};


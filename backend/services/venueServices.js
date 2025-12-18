const Venue = require('../models/Venue');
const Event = require('../models/Event');
const Comment = require('../models/Comment');
const User = require('../models/User');
const userServices = require('./userServices');

/**
 * Sample reference points for distance calculation
 */
const CUHK_LAT = 22.4172;
const CUHK_LNG = 114.2079;

/**
 * Load venue based on ._id with events and comments
 */
async function loadVenue(venueObjectId) {
  try {
    const venue = await Venue.findOne({ _id: venueObjectId }).lean();
    if (!venue) return [false, 'nofind'];

    // Fetch events for this venue
    const events = await Event.find({ venue: venueObjectId }).lean();

    // Fetch comments for this venue with user details
    const comments = await Comment.find({ venue: venueObjectId })
      .sort({ createdAt: -1 })
      .lean();

    // Get user details for comments
    const commentsWithUsernames = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findById(comment.user_id).lean();
        return {
          _id: comment._id,
          text: comment.comment,
          username: user ? user.username : 'Unknown',
          createdAt: comment.createdAt
        };
      })
    );

    // Format events
    const formattedEvents = events.map(event => ({
      _id: event._id,
      title: event.title,
      dateTime: event.dates,
      presenter: event.presenter,
      description: event.description,
      dates: event.dates
    }));

    const result = {
      _id: venue._id,
      venue_id: venue.venue_id,
      name: venue.name,
      latitude: venue.latitude,
      longitude: venue.longitude,
      area: venue.area,
      eventsCount: venue.eventCount ?? 0,
      events: formattedEvents,
      comments: commentsWithUsernames
    };

    return [true, result];
  } catch (err) {
    return [false, err.message];
  }
}

/**
 * Creates a new venue, needs admin privileges
 */
function insertVenue(adminID, venueData) {
  return userServices.checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
      if (!isAdmin) return [false, 'noadmin'];

      return new Venue({
        venue_id: venueData.venue_id,
        name: venueData.name,
        latitude: venueData.latitude,
        longitude: venueData.longitude,
        area: venueData.area,
        eventCount: 0
      }).save();
    })
    .then(venueInsert => {
      return [true, venueInsert];
    })
    .catch(err => [false, err.message]);
}

/**
 * If no filter is applied, will load all venue
 */
function loadFilteredVenuesFromDB(filterOptions = {}) {
  return Venue.find({}).lean()
    .then(allVenues => {
      if (allVenues.length === 0) {
        return [true, []];
      }

      let filteredVenues = allVenues;

      // 1. Area filter
      if (filterOptions.area) {
        filteredVenues = filteredVenues.filter(v => v.area === filterOptions.area);
      }

      // 2. Keyword search
      if (filterOptions.keyword) {
        const keyword = filterOptions.keyword.toLowerCase();
        filteredVenues = filteredVenues.filter(v =>
          v.name.toLowerCase().includes(keyword)
        );
      }

      // 3. Distance filter 
      if (filterOptions.distance) {
        if (filterOptions.distance === 0) {
          // Approach 1: show all venues, distance filter is rejected
          // Approach 2: don't show anything -> filteredVenues = [];
        } else {
          const distanceFilter = getDistanceBounds(CUHK_LAT, CUHK_LNG, filterOptions.distance);
          filteredVenues = filteredVenues.filter(v =>
            distanceFilter.haversineDistance(Number(v.latitude), Number(v.longitude)) <= distanceFilter.radiusKm
          );
        }
      }

      const result = filteredVenues.map(v => ({
        _id: v._id,
        venue_id: v.venue_id,
        name: v.name,
        latitude: v.latitude,
        longitude: v.longitude,
        area: v.area,
        eventsCount: v.eventCount ?? 0
      }));

      return [true, result];
    })
    .catch(err => [false, err.message]);
}

/**
 * Get distance filter object (circle bounds only)
 */
function getDistanceBounds(centerLat, centerLng, distanceKm) {
  const R = 6371;

  return {
    centerLat,
    centerLng,
    radiusKm: distanceKm,
    // Haversine distance calculator (closure)
    haversineDistance: (testLat, testLng) => {
      const dLat = (testLat - centerLat) * Math.PI / 180;
      const dLon = (testLng - centerLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(centerLat * Math.PI / 180) * Math.cos(testLat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
  };
}

module.exports = {
  loadVenue,
  insertVenue,
  loadFilteredVenuesFromDB,
  getDistanceBounds,
};


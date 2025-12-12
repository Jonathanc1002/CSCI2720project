const Venue = require('../models/Venue');
const Event = require('../models/Event');
const User = require('../models/User');

const fetchXML = require('../preprocess/fetch/fetchXML');
const parseXML = require('../preprocess/fetch/xmlParser');
const parseVenues = require('../preprocess/parseVenues');
const { filterVenues } = require('../preprocess/parseVenues');
const parseEventDates = require('../preprocess/parseEventDates');
const parseEvents = require('../preprocess/parseEvents');

const VENUES_URL = "https://www.lcsd.gov.hk/datagovhk/event/venues.xml";
const EVENTS_URL = "https://www.lcsd.gov.hk/datagovhk/event/events.xml";
const EVENT_DATES_URL = "https://www.lcsd.gov.hk/datagovhk/event/eventDates.xml";

/**
 * Retrieve venue information by MongoDB ObjectId. Returns venue metadata (venue_id, name, location, area).
 */
function getVenueInfo(venueObjectId) {
  return Venue.findOne({ _id: venueObjectId }).lean()
    .then(result => {
      if (!result) return null;
      return {
        venue_id: result.venue_id,
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        area: result.area
      };
    })
    .catch(() => null);
}

/**
 * Load all venues with user-specific enrichment. Fetches user's favorite locations, returns all venues with
 * is_favorited flag and eventCount. Used to display venue list in frontend with favorite status.
 */
function loadVenueForUser(userID) {
  return User.findOne({ _id: userID }).lean()
    .then(userDoc => {
      if (!userDoc) return [false, 'nofind'];

      // User's favorites are now venue_id strings, not ObjectIds
      const favorites = userDoc.favoriteLocations || [];

      return Venue.find({}).lean()
        .then(venues => {
          if (!venues || venues.length === 0) return [true, []];

          const venueArray = venues.map(v => {
            // Compare by venue_id string instead of _id to survive refreshes
            const isFavorited = favorites.includes(v.venue_id);
            const count =
              v.eventCount !== undefined && v.eventCount !== null
                ? v.eventCount
                : 0;

            return {
              venue_id: v.venue_id,
              name: v.name,
              latitude: v.latitude,
              longitude: v.longitude,
              area: v.area,
              eventCount: count,
              is_favorited: isFavorited
            };
          });

          return [true, venueArray];
        });
    })
    .catch(err => [false, err.message]);
}

/**
 * Create a new venue. Requires admin privileges. Initializes eventCount to 0 for new venue.
 * Accepts venueData from parseVenues function output.
 */
function insertVenue(adminID, venueData, checkAdminFn) {
  return (checkAdminFn ? checkAdminFn(adminID) : Promise.resolve(false))
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
      if (Array.isArray(venueInsert)) return venueInsert;
      return [true, venueInsert];
    })
    .catch(err => [false, err.message]);
}

/**
 * Load filtered venues with events. Fetches XML data, filters venues by area/keyword/distance during parsing,
 * selects top 10 filtered venues, fetches events for each venue, and inserts both venues and events into DB.
 * Requires at least 3 events per venue; venues with fewer events are excluded.
 * Returns [success, result] tuple with inserted counts or error message.
 *
 * @param {Object} filterOptions - Filter criteria { area?, keyword?, latitude?, longitude?, radiusKm? }
 * @returns {Promise<[boolean, Object|string]>} [success, { venuesInserted, eventsInserted } | error]
 */
function loadFilteredVenuesWithEvents(filterOptions = {}) {
  return fetchXML(VENUES_URL)
    .then(venuesXML => parseXML(venuesXML))
    .then(venuesParsed => parseVenues(venuesParsed))
    .then(async allVenues => {
      // 2. Apply filters to venues
      const filteredVenues = filterVenues(allVenues, filterOptions);
      if (filteredVenues.length === 0) {
        return [false, 'novenue'];
      }

      // 3. Fetch and parse events and event dates
      const datesXML = await fetchXML(EVENT_DATES_URL);
      const datesParsed = await parseXML(datesXML);
      const dateMap = parseEventDates(datesParsed);

      const eventsXML = await fetchXML(EVENTS_URL);
      const eventsParsed = await parseXML(eventsXML);
      const rawEvents = parseEvents(eventsParsed, dateMap);

      // 4. Create a map of venue_id to events
      const venueEventsMap = {};
      rawEvents.forEach(e => {
        if (!venueEventsMap[e.venue_id]) {
          venueEventsMap[e.venue_id] = [];
        }
        venueEventsMap[e.venue_id].push(e);
      });

      // 5. Filter venues that have at least 3 events, then take top 10
      const venuesWithEnoughEvents = filteredVenues
        .filter(v => venueEventsMap[v.venue_id] && venueEventsMap[v.venue_id].length >= 3)
        .slice(0, 10);

      if (venuesWithEnoughEvents.length === 0) {
        return [false, 'novenue'];
      }

      // 6. Prepare venue documents and insert into DB
      const venueDocsToInsert = venuesWithEnoughEvents.map(v => ({
        venue_id: v.venue_id,
        name: v.name,
        latitude: v.latitude,
        longitude: v.longitude,
        area: v.area,
        eventCount: venueEventsMap[v.venue_id].length
      }));

      // 7. Clear existing venues and insert new ones (or upsert)
      await Venue.deleteMany({});
      const venueDocs = await Venue.insertMany(venueDocsToInsert);

      // 8. Create venue ID map for event insertion
      const venueMap = {};
      venueDocs.forEach(v => {
        venueMap[v.venue_id] = v._id;
      });

      // 9. Prepare and insert events
      const eventsToInsert = [];
      venuesWithEnoughEvents.forEach(v => {
        (venueEventsMap[v.venue_id] || []).forEach(e => {
          eventsToInsert.push({
            event_id: e.event_id,
            title: e.title,
            description: e.description,
            presenter: e.presenter,
            venue: venueMap[v.venue_id],
            dates: e.dates
          });
        });
      });

      await Event.deleteMany({});
      await Event.insertMany(eventsToInsert);

      return [
        true,
        {
          venuesInserted: venueDocs.length,
          eventsInserted: eventsToInsert.length,
          message: `Loaded ${venueDocs.length} venues with ${eventsToInsert.length} events`
        }
      ];
    })
    .catch(err => [false, err.message]);
}

module.exports = { getVenueInfo, loadVenueForUser, insertVenue, loadFilteredVenuesWithEvents };

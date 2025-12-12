const fetchXML = require("./fetch/fetchXML");
const parseXML = require("./fetch/xmlParser");

const parseVenues = require("./parseVenues");
const parseEventDates = require("./parseEventDates");
const parseEvents = require("./parseEvents");

const Venue = require("../models/Venue");
const Event = require("../models/Event");

const VENUES_URL =
  "https://www.lcsd.gov.hk/datagovhk/event/venues.xml";
const EVENTS_URL =
  "https://www.lcsd.gov.hk/datagovhk/event/events.xml";
const EVENT_DATES_URL =
  "https://www.lcsd.gov.hk/datagovhk/event/eventDates.xml";

async function preprocessAll() {
  console.log("=== Preprocess All Start ===");

  // 1. Venues
  const venuesXML = await fetchXML(VENUES_URL);
  const venuesParsed = await parseXML(venuesXML);
  const venues = parseVenues(venuesParsed);

  await Venue.deleteMany();
  const venueDocs = await Venue.insertMany(venues);

  const venueMap = {};
  venueDocs.forEach(v => {
    venueMap[v.venue_id] = v._id;
  });

  // 2. Event Dates
  const datesXML = await fetchXML(EVENT_DATES_URL);
  const datesParsed = await parseXML(datesXML);
  const dateMap = parseEventDates(datesParsed);

  // 3. Events
  const eventsXML = await fetchXML(EVENTS_URL);
  const eventsParsed = await parseXML(eventsXML);
  const rawEvents = parseEvents(eventsParsed, dateMap);

  const finalEvents = rawEvents
    .filter(e => venueMap[e.venue_id])
    .map(e => ({
      event_id: e.event_id,
      title: e.title,
      description: e.description,
      presenter: e.presenter,
      venue: venueMap[e.venue_id],
      dates: e.dates
    }));

  await Event.deleteMany();
  await Event.insertMany(finalEvents);

  console.log(`Inserted ${finalEvents.length} events`);
  console.log("=== Preprocess All Done ===");
}

module.exports = preprocessAll;

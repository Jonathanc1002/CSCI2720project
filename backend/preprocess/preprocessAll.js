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
  
  // 1. CHECK if DB already has content → SKIP fetch
  const [venueCount, eventCount] = await Promise.all([
    Venue.countDocuments(), 
    Event.countDocuments()
  ]);
  
  if (venueCount > 0 || eventCount > 0) {
    console.log(`DB already populated (${venueCount} venues, ${eventCount} events) - skipping import`);
    console.log("=== Preprocess All Done ===");
    return [true, {
      venuesInserted: venueCount,
      eventsInserted: eventCount,
      message: `Skipped import - DB already has ${venueCount} venues, ${eventCount} events`
    }];
  }

  // 2. DB empty → proceed with fetch/import TOP 10 venues
  try {
    // Fetch venues
    const venuesXML = await fetchXML(VENUES_URL);
    const venuesParsed = await parseXML(venuesXML);
    const allVenues = parseVenues(venuesParsed);

    // Fetch ALL events + dates
    const datesXML = await fetchXML(EVENT_DATES_URL);
    const datesParsed = await parseXML(datesXML);
    const dateMap = parseEventDates(datesParsed);

    const eventsXML = await fetchXML(EVENTS_URL);
    const eventsParsed = await parseXML(eventsXML);
    const rawEvents = parseEvents(eventsParsed, dateMap);

    // 3. Build venue_id → events map
    const venueEventsMap = {};
    rawEvents.forEach(e => {
      if (!venueEventsMap[e.venue_id]) venueEventsMap[e.venue_id] = [];
      venueEventsMap[e.venue_id].push(e);
    });

    // 4. Get TOP 10 venues with ≥3 events (NO FILTERS - global busiest)
    const venuesWithEvents = allVenues
      .filter(v => venueEventsMap[v.venue_id] && venueEventsMap[v.venue_id].length >= 3)
      .map(v => ({
        ...v,
        eventCount: venueEventsMap[v.venue_id].length
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    const topVenues = venuesWithEvents;

    if (topVenues.length === 0) {
      console.log("No venues with ≥3 events found");
      return [false, 'novenue'];
    }

    // 5. Clear DB + insert venues
    await Venue.deleteMany({});
    const venueDocsToInsert = topVenues.map(v => ({
      venue_id: v.venue_id,
      name: v.name,
      latitude: v.latitude,
      longitude: v.longitude,
      area: v.area,
      eventCount: venueEventsMap[v.venue_id].length
    }));
    const venueDocs = await Venue.insertMany(venueDocsToInsert);

    // 6. Map venue_id → Mongo _id for events
    const venueMap = {};
    venueDocs.forEach(v => venueMap[v.venue_id] = v._id);

    // 7. Insert events for these venues only
    const eventsToInsert = [];
    topVenues.forEach(v => {
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

    console.log(`Imported ${topVenues.length} venues with ${eventsToInsert.length} events`);
    console.log("=== Preprocess All Done ===");
    
    return [true, {
      venuesInserted: topVenues.length,
      eventsInserted: eventsToInsert.length,
      message: `Imported top ${topVenues.length} venues with ${eventsToInsert.length} total events`
    }];
  } catch (err) {
    console.error('Import failed:', err.message);
    return [false, err.message];
  }
}

module.exports = preprocessAll;
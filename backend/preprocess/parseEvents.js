const Venue = require("../models/Venue");

function parseEvents(eventsXML, dateMap) {
  const events = eventsXML.events.event;
  const parsedEvents = [];

  events.forEach(e => {
    const eventId = e.$.id;
    const venueId = e.venueid;

    // 날짜 없는 이벤트 skip
    if (!dateMap[eventId]) return;

    parsedEvents.push({
      event_id: eventId,
      title: e.titlee || e.titlec || "Untitled",
      description: e.desc || "N/A",
      presenter: e.presenter || "N/A",
      venue_id: venueId,
      dates: dateMap[eventId]
    });
  });

  return parsedEvents;
}

module.exports = parseEvents;

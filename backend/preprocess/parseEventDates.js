function parseYYYYMMDD(str) {
  if (!/^\d{8}$/.test(str)) return null;
  if (str === "20990101") return null;

  const y = str.slice(0, 4);
  const m = str.slice(4, 6);
  const d = str.slice(6, 8);

  const date = new Date(`${y}-${m}-${d}`);
  return isNaN(date.getTime()) ? null : date;
}

function parseEventDates(eventDatesXML) {
  const events = eventDatesXML.event_dates.event;

  const dateMap = {};

  events.forEach(e => {
    const eventId = e.$.id;
    const inDates = Array.isArray(e.indate)
      ? e.indate
      : [e.indate];

    const dates = inDates
      .map(d => parseYYYYMMDD(d))
      .filter(Boolean);

    if (dates.length > 0) {
      dateMap[eventId] = dates;
    }
  });

  return dateMap;
}

module.exports = parseEventDates;

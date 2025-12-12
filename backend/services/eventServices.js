const Event = require('../models/Event');
const Venue = require('../models/Venue');
const userServices = require('./userServices');

/**
 * Parse YYYYMMDD date string to JavaScript Date object. Validates format and date range.
 * Returns null if input is invalid.
 */
function parseDate(xmlDate) {
  if (typeof xmlDate !== 'string' || xmlDate.length !== 8) return null;

  const year = Number(xmlDate.slice(0, 4));
  const month = Number(xmlDate.slice(4, 6)) - 1;
  const day = Number(xmlDate.slice(6, 8));

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

  return new Date(Date.UTC(year, month, day));
}

/**
 * Convert JavaScript Date object to YYYYMMDD string format. Used for formatting dates in responses.
 * Returns null if input date is invalid.
 */
function formatDate(formattedDate) {
  const d = new Date(formattedDate);
  if (Number.isNaN(d.getTime())) return null;

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

/**
 * Retrieve all events for admin user with nested venue information. Requires admin privileges.
 * Joins Event and Venue collections; returns events with full venue metadata for administrative viewing.
 */
function loadEventForAdmin(adminID) {
  return userServices.checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
      if (!isAdmin) return [false, 'noadmin'];

      return Event.find({}).lean()
        .then(events => {
          if (!events || events.length === 0) return [true, []];

          const venueIdSet = new Set(events.map(ev => String(ev.venue)));
          const venueObjectIds = Array.from(venueIdSet);

          return Venue.find({ _id: { $in: venueObjectIds } }).lean()
            .then(venues => {
              const venueMap = new Map(
                venues.map(v => [
                  String(v._id),
                  {
                    venue_id: v.venue_id,
                    name: v.name,
                    latitude: v.latitude,
                    longitude: v.longitude,
                    area: v.area
                  }
                ])
              );

              const nestedEvents = events.map(ev => {
                const vInfo = venueMap.get(String(ev.venue)) || null;
                return {
                  _id: ev._id,
                  event_id: ev.event_id,
                  title: ev.title,
                  description: ev.description,
                  presenter: ev.presenter,
                  venue: vInfo,
                  dates_compact: (ev.dates || []).map(formatDate)
                };
              });

              return [true, nestedEvents];
            });
        });
    })
    .catch(err => [false, err.message]);
}

/**
 * Create a new event. Requires admin privileges. Validates venue existence, accepts dates as Date objects or YYYYMMDD strings.
 * Atomically increments associated venue's eventCount. Accepts venue_id flat or nested in eventData.
 */
function insertEvent(adminID, eventData) {
  return userServices.checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
      if (!isAdmin) return [false, 'noadmin'];

      const venueId = eventData.venue_id || (eventData.venue && eventData.venue.venue_id);

      return Venue.findOne({ venue_id: venueId }).lean()
        .then(exist => {
          if (!exist) return [false, 'nofind'];

          const dates = eventData.dates || [];
          const parsedDates = dates
            .map(d => {
              if (d instanceof Date) return d;
              if (typeof d === 'string' && d.length === 8) return parseDate(d);
              return null;
            })
            .filter(d => d !== null);

          return new Event({
            event_id: eventData.event_id,
            title: eventData.title,
            description: eventData.description,
            presenter: eventData.presenter,
            venue: exist._id,
            dates: parsedDates
          }).save()
            .then(eventInsert => [true, eventInsert]);
        });
    })
    .catch(err => [false, err.message]);
}

/**
 * Delete an event by event_id. Requires admin privileges. Atomically decrements associated venue's eventCount
 * when event is removed from database.
 */
function deleteEvent(adminID, eventID) {
  return userServices.checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
      if (!isAdmin) return [false, 'noadmin'];

      return Event.findOneAndDelete({ event_id: eventID })
        .then(deleted => {
          if (deleted) return [true, eventID];
          return [false, 'nodelete'];
        });
    })
    .catch(err => [false, err.message]);
}

/**
 * Update event fields (event_id, title, description, presenter, dates, venue). Requires admin privileges.
 * Handles venue reassignment by validating new venue exists. Accepts venue_id flat or nested, dates as Date objects or YYYYMMDD strings.
 */
function updateEvent(adminID, eventID, eventDataNew) {
  return userServices.checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
      if (!isAdmin) return [false, 'noadmin'];

      const updateFields = {};

      if (eventDataNew.event_id !== undefined) updateFields.event_id = eventDataNew.event_id;
      if (eventDataNew.title !== undefined) updateFields.title = eventDataNew.title;
      if (eventDataNew.description !== undefined) updateFields.description = eventDataNew.description;
      if (eventDataNew.presenter !== undefined) updateFields.presenter = eventDataNew.presenter;

      if (eventDataNew.dates !== undefined || eventDataNew.date !== undefined) {
        const src = eventDataNew.dates || eventDataNew.date || [];
        updateFields.dates = src
          .map(d => {
            if (d instanceof Date) return d;
            if (typeof d === 'string' && d.length === 8) return parseDate(d);
            return null;
          })
          .filter(d => d !== null);
      }

      const venueIdNew = eventDataNew.venue_id || (eventDataNew.venue && eventDataNew.venue.venue_id);

      if (!venueIdNew) {
        return Event.findOneAndUpdate(
          { event_id: eventID },
          { $set: updateFields },
          { new: true }
        ).then(change => {
          if (change) return [true, change];
          return [false, 'noupdate'];
        });
      }

      return Venue.findOne({ venue_id: venueIdNew }).lean()
        .then(venueExist => {
          if (!venueExist) return [false, 'nofind'];

          updateFields.venue = venueExist._id;

          return Event.findOneAndUpdate(
            { event_id: eventID },
            { $set: updateFields },
            { new: true }
          ).then(change => {
            if (change) return [true, change];
            return [false, 'noupdate'];
          });
        });
    })
    .catch(err => [false, err.message]);
}

module.exports = { parseDate, formatDate, loadEventForAdmin, insertEvent, deleteEvent, updateEvent };

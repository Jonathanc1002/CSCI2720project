const Event = require('../models/Event');
const Venue = require('../models/Venue');

/**
 * Loads events
 */
function loadEventForAdmin() {
  return Event.find({}).lean()
    .then(events => {
      if (!events || events.length === 0) return [true, []];

      const nestedEvents = events.map(ev => ({
        _id: ev._id,
        event_id: ev.event_id,
        title: ev.title,
        description: ev.description,
        presenter: ev.presenter,
        venue: ev.venue,
        dates: ev.dates || []
      }));

      return [true, nestedEvents];
    })
    .catch(err => {
      console.error(err);
      return [false, 'Error getting event'];
    });
}


/**
 * Create a new event. Validates venue existence, accepts dates as ISO strings.
 */
/**
 * Clean event response - _id first, no __v
 */
function cleanEventResponse(eventDoc) {
  const clean = eventDoc.toObject({ versionKey: false });
  const { _id, ...rest } = clean;
  return { _id, ...rest };
}

/**
 * Create a new event. Validates venue existence, accepts dates as ISO strings.
 */
function insertEvent(eventData) {
  return Venue.findOne({ _id: eventData.venue }).lean()
    .then(exist => {
      if (!exist) return [false, 'Cannot find venue.'];

      return new Event({
        event_id: eventData.event_id,
        title: eventData.title,
        description: eventData.description,
        presenter: eventData.presenter,
        venue: exist._id,
        dates: eventData.dates || []
      }).save()
        .then(eventInsert => [true, cleanEventResponse(eventInsert)]);
    })
    .catch(err => {
      console.error(err);
      return [false, 'Error inserting event'];
    });
}

/**
 * Update event fields (event_id, title, description, presenter, dates, venue).
 */
function updateEvent(eventID, eventDataNew) {
  const updateFields = {};

  if (eventDataNew.event_id !== undefined) updateFields.event_id = eventDataNew.event_id;
  if (eventDataNew.title !== undefined) updateFields.title = eventDataNew.title;
  if (eventDataNew.description !== undefined) updateFields.description = eventDataNew.description;
  if (eventDataNew.presenter !== undefined) updateFields.presenter = eventDataNew.presenter;
  if (eventDataNew.dates !== undefined || eventDataNew.date !== undefined) {
    updateFields.dates = eventDataNew.dates || eventDataNew.date || [];
  }

  const venueIdNew = eventDataNew.venue;

  if (!venueIdNew) {
    return Event.findOneAndUpdate(
      { _id: eventID },
      { $set: updateFields },
      { new: true }
    ).then(change => {
      if (change) return [true, cleanEventResponse(change)];
      return [false, 'Event not found.'];
    })
      .catch(err => {
        console.error(err);
        return [false, 'Error updating event'];
      });
  }

  return Venue.findOne({ _id: venueIdNew }).lean()
    .then(venueExist => {
      if (!venueExist) return [false, 'Cannot find venue.'];

      updateFields.venue = venueExist._id;

      return Event.findOneAndUpdate(
        { _id: eventID },
        { $set: updateFields },
        { new: true }
      ).then(change => {
        if (change) return [true, cleanEventResponse(change)];
        return [false, 'Event not found.'];
      })
        .catch(err => {
          console.error(err);
          return [false, 'Error updating event'];
        });
    })
    .catch(err => {
      console.error(err);
      return [false, 'Error updating event'];
    });
}


/**
 * Delete an event by ObjectId.
 */
function deleteEvent(eventID) {
  return Event.findOneAndDelete({ _id: eventID })
    .then(deleted => {
      if (deleted) return [true, deleted._id];
      return [false, 'Event not found.'];
    })
    .catch(err => {
      console.error(err);
      return [false, 'Error deleting event'];
    });
}
module.exports = { loadEventForAdmin, insertEvent, deleteEvent, updateEvent, cleanEventResponse };

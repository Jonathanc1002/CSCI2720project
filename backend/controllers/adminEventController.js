const eventServices = require('../services/eventServices');

exports.getAllEvents = async (req, res) => {
  try {
    const result = await eventServices.loadEventForAdmin();
    if (result[0]) {
      res.json(result[1]);
    } else {
      res.status(500).json({ message: "Fail getting all events." });
    }
  } catch (err) {
    console.error('getAllEvents ERROR:', err);
    res.status(500).json({ message: "Error occured when getting all events." });
  }
};


exports.createEvent = async (req, res) => {
  try {
    const result = await eventServices.insertEvent(req.body);
    if (result[0]) {
      res.status(201).json(result[1]);
    } else {
      res.status(400).json({ message: result[1] });
    }
  } catch (err) {
    console.error('createEvent ERROR:', err);
    res.status(500).json({ message: "Error occured when inserting event." });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const result = await eventServices.updateEvent(req.params.id, req.body);
    if (result[0]) {
      res.json(result[1]);
    } else {
      res.status(404).json({ message: result[1] });
    }
  } catch (err) {
    console.error('updateEvent ERROR:', err);
    res.status(500).json({ message: "Error occured when updating event." });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const result = await eventServices.deleteEvent(req.params.id);
    if (result[0]) {
      res.json({ message: `Event ${result[1]} deleted successfully` });
    } else {
      res.status(404).json({ message: result[1] });
    }
  } catch (err) {
    console.error('deleteEvent ERROR:', err);
    res.status(500).json({ message: "Error occured when deleting event." });
  }
};

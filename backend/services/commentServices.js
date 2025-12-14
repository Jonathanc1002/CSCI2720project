const User = require('../models/User');
const Venue = require('../models/Venue');
const Comment = require('../models/Comment');
const userServices = require('./userServices');

/**
 * Create a new comment on a venue. Validates user and venue existence, stores comment with user_id and venue reference,
 * and automatically records creation timestamp.
 */
function insertComment(userID, commentData) {
  return User.findOne({ _id: userID }).lean()
    .then(user => {
      if (!user) return [false, 'nofind'];

      return Venue.findOne({ venue_id: commentData.venue.venue_id }).lean()
        .then(exist => {
          if (!exist) return [false, 'nofind'];

          return new Comment({
            user_id: String(user._id),
            venue: exist._id,
            comment: commentData.comment,
            createdAt: new Date()
          }).save()
            .then(commentCreation => [true, commentCreation]);
        });
    })
    .catch(err => [false, err.message]);
}

/**
 * Delete a comment by ID. Requires admin privileges to remove comments from any user.
 * Returns deleted comment if successful.
 */
function deleteComment(adminID, commentID) {
  return userServices.checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
      if (!isAdmin) return [false, 'noadmin'];

      return Comment.findOneAndDelete({ _id: commentID })
        .then(deleted => {
          if (deleted) return [true, deleted];
          return [false, 'nodelete'];
        });
    })
    .catch(err => [false, err.message]);
}

/**
 * Load all comments for a venue, enriched with user information. Joins Comment and User collections to display
 * usernames alongside comments. Returns comments with nested venue metadata including eventCount.
 */
function loadComment(venueID) {
  return Venue.findOne({ venue_id: venueID }).lean()
    .then(result => {
      if (!result) return [false, 'nofind'];

      return Comment.find({ venue: result._id }).lean()
        .then(data => {
          const userIdSet = new Set(
            data.filter(c => c.user_id).map(c => String(c.user_id))
          );
          const userIds = Array.from(userIdSet);

          return User.find({ _id: { $in: userIds } }, { username: 1 }).lean()
            .then(users => {
              const userMap = new Map(users.map(u => [String(u._id), u.username]));

              const nested = data.map(c => ({
                _id: c._id,
                user_id: c.user_id || null,
                username: userMap.get(String(c.user_id)) || null,
                venue: {
                  venue_id: result.venue_id,
                  name: result.name,
                  latitude: result.latitude,
                  longitude: result.longitude,
                  area: result.area
                },
                comment: c.comment,
                date: c.createdAt
              }));

              return [true, nested];
            });
        });
    })
    .catch(err => [false, err.message]);
}

module.exports = { insertComment, deleteComment, loadComment };

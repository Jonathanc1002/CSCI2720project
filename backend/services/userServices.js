const User = require('../models/User');
const Venue = require('../models/Venue');

/**
 * Create a new user. Checks if username is unique, creates user document with provided
 * credentials and empty favorites list, then returns user details.
 */
function addNewUser(userData) {
  return checkWhetherUsernameAvailable(userData.username)
    .then(exists => {
      if (!exists) return [false, 'noduplicates'];

      return new User({
        username: userData.username,
        password: userData.password,
        isAdmin: userData.isAdmin || false,
        favoriteLocations: []
      }).save()
        .then(userCreation => {
          const userDetails = {
            username: userCreation.username,
            isAdmin: userCreation.isAdmin,
            userID: userCreation._id
          };
          return [true, userDetails];
        });
    })
    .catch(err => [false, err.message]);
}

/**
 * Authenticate a user by username and password. Returns user details on match.
 */
function checkAndLoadUser(userInput) {
  return User.findOne({ username: userInput.username }).lean()
    .then(user => {
      if (!user) return [false, 'nofind'];
      if (user.password != userInput.password) return [false, 'nopass'];

      const userDetails = {
        username: user.username,
        isAdmin: user.isAdmin,
        userID: user._id
      };
      return [true, userDetails];
    })
    .catch(err => [false, err.message]);
}

/**
 * Delete a user by ID. Requires admin privileges. Returns deleted user ID.
 */
function deleteUser(adminID, userID) {
  return checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
      if (!isAdmin) return [false, 'noadmin'];

      return User.findOneAndDelete({ _id: userID })
        .then(deleted => {
          if (deleted) return [true, userID];
          return [false, 'nodelete'];
        });
    })
    .catch(err => [false, err.message]);
}

/**
 * Update user fields (username, password, isAdmin). Requires admin privileges.
 * Only updates provided fields; returns updated user details.
 */
function updateUser(adminID, userID, newUserData) {
  return checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
      if (!isAdmin) return [false, 'noadmin'];

      const updateFields = {};
      if (newUserData.username !== undefined) updateFields.username = newUserData.username;
      if (newUserData.password !== undefined) updateFields.password = newUserData.password;
      if (newUserData.isAdmin !== undefined) updateFields.isAdmin = newUserData.isAdmin;

      return User.findOneAndUpdate(
        { _id: userID },
        { $set: updateFields },
        { new: true }
      ).then(change => {
        if (change) {
          const userDetails = {
            username: change.username,
            isAdmin: change.isAdmin,
            userID: change._id
          };
          return [true, userDetails];
        }
        return [false, 'noupdate'];
      });
    })
    .catch(err => [false, err.message]);
}

/**
 * Check if a user exists by ID. Returns boolean.
 */
function checkWhetherIDExist(userID) {
  return User.findOne({ _id: userID }).lean()
    .then(user => !!user)
    .catch(() => false);
}

/**
 * Check if a user is an admin by ID. Returns boolean.
 */
function checkWhetherUserIsAdmin(adminID) {
  return User.findOne({ _id: adminID }, { isAdmin: 1 }).lean()
    .then(user => !!(user && user.isAdmin))
    .catch(() => false);
}

/**
 * Check if a username is available (does not exist). Returns boolean.
 */
function checkWhetherUsernameAvailable(isUsernameExist) {
  return User.findOne({ username: isUsernameExist }).lean()
    .then(user => !user)
    .catch(() => false);
}

/**
 * Add or remove a venue from user's favorite locations. Uses Mongoose $addToSet or $pull
 * to avoid duplicates when adding. Returns updated user document.
 */
function favoriteLocation(userID, venueID, willFavorite) {
  return Venue.findOne({ venue_id: venueID }).lean()
    .then(venue => {
      if (!venue) return [false, 'nofind'];

      // Store venue_id string in favorites to persist across venue refreshes
      const update = willFavorite
        ? { $addToSet: { favoriteLocations: venue.venue_id } }
        : { $pull: { favoriteLocations: venue.venue_id } };

      return User.findOneAndUpdate({ _id: userID }, update, { new: true }).lean()
        .then(change => {
          if (change) return [true, change];
          return [false, 'noupdate'];
        });
    })
    .catch(err => [false, err.message]);
}

module.exports = {
  addNewUser,
  checkAndLoadUser,
  deleteUser,
  updateUser,
  checkWhetherIDExist,
  checkWhetherUserIsAdmin,
  checkWhetherUsernameAvailable,
  favoriteLocation
};

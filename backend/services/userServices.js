const User = require('../models/User');
const Venue = require('../models/Venue');
const bcrypt = require('bcryptjs');


/**
 * Get all users as UserView objects (hide passwords, favorites). Returns array.
 */
function loadAllUsers() {
  return User.find({}, {
    username: 1,
    isAdmin: 1,
    _id: 1
  }).lean()
    .then(users => {
      return [true, users];
    })
    .catch(err => {
      console.error(err);
      return [false, "Error loading users"];
    })
}

/**
 * Create a new user. Checks if username is unique, creates user document with provided
 * credentials and empty favorites list, then returns user details.
 */
function addNewUser(userData) {
  return checkWhetherUsernameAvailable(userData.username)
    .then(exists => {
      if (!exists) return [false, 'No duplicate usernames.'];

      return new User({
        username: userData.username,
        password: userData.password,
        isAdmin: userData.isAdmin || false,
        favoriteLocations: []
      }).save()
        .then(userCreation => {
          const userDetails = {
            _id: userCreation._id,
            username: userCreation.username,
            isAdmin: userCreation.isAdmin,
          };
          return [true, userDetails];
        });
    })
    .catch(err => {
      console.error(err);
      return [false, "Error inserting user"];
    })
}

/**
 * Authenticate a user by username and password. Returns user details on match.
 */
async function checkAndLoadUser(userInput) {
  try {
    const user = await User.findOne({ username: userInput.username }).lean();
    
    if (!user) return [false, 'nofind'];
    
    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(userInput.password, user.password);
    if (!isPasswordValid) return [false, 'nopass'];

    const userDetails = {
      _id: user._id,
      userID: user._id, // Add userID for backward compatibility
      username: user.username,
      isAdmin: user.isAdmin,
    };
    return [true, userDetails];
  } catch (err) {
    console.error('checkAndLoadUser error:', err);
    return [false, "Error checking user"];
  }
}

/**
 * Delete a user by ID. Middleware guarantees admin access.
 */
function deleteUser(userID) {
  return User.findOneAndDelete({ _id: userID })
    .then(deleted => {
      if (deleted) return [true, userID];
      return [false, 'Fail to delete user.'];
    })
    .catch(err => {
      console.error(err);
      return [false, "Error deleting user"];
    })
}

/**
 * Update user fields (username, password, isAdmin). Middleware guarantees admin access.
 */
function updateUser(userID, newUserData) {
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
        _id: change._id,
        username: change.username,
        isAdmin: change.isAdmin,
      };
      return [true, userDetails];
    }
    return [false, 'Fail to update user.'];
  })
    .catch(err => {
      console.error(err);
      return [false, "Error updating user"];
    })
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
    .catch(err => {
      console.error(err);
      return [false, "Error updating user"];
    })
}

module.exports = {
  loadAllUsers,
  addNewUser,
  checkAndLoadUser,
  deleteUser,
  updateUser,
  checkWhetherIDExist,
  checkWhetherUserIsAdmin,
  checkWhetherUsernameAvailable,
  favoriteLocation
};

const mongoose = require('mongoose');

async function connectDatabase() {
    await mongoose.connect('mongodb://127.0.0.1:27017/webdevproj')
}

// Schema and models
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Name is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: [true, "Admin status is required"]
    },
    favoriteLocations: {
        type: [String],
        required: [true, "Favorites is required"]
    }
});

const UserEvent = mongoose.model("UserEvent", UserSchema);

const VenueSchema = new mongoose.Schema({
    venue_id: {
        type: String,
        required: [true, "Venue ID is required"],
        unique: true
    },
    name: {
        type: String,
        required: [true, "Venue name is required"]
    },
    latitude: {
        type: Number,
        required: [true, "Latitude is required"],
    },
    longitude: {
        type: Number,
        required: [true, "Longitude is required"],
    },
    area: {
        type: String
    }
});

const VenueEvent = mongoose.model("VenueEvent", VenueSchema);

const CommentSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: [true, "User ID is required"]
    },
    comment: {
        type: String,
        required: [true, "Comment is required"]
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VenueEvent',
        required: [true, "Venue is required"]
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, "Date is required"]
    },
});

const CommentEvent = mongoose.model("CommentEvent", CommentSchema);

const DetailSchema = new mongoose.Schema({
    event_id: {
        type: String,
        required: [true, "Event ID is required"],
        unique: true
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    description: {
        type: String,
        default: "N/A"
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VenueEvent',
        required: [true, "Venue is required"]
    },
    price: {
        type: String,
        required: [true, "Price is required"]
    },
    presenter: {
        type: String,
        required: [true, "Presenter is required"]
    },
    date: {
        type: [String],
        required: [true, "Date is required"]
    },
});

const DetailEvent = mongoose.model("DetailEvent", DetailSchema);

// Comment-related helper functions:

async function insertComment(userID, commentData) {

    return UserEvent.findOne({ _id: userID }).lean()
        .then(user => {
            if (!user) {
                console.log("User not found when inserting comment");
                return [false, "nofind"];
            }

            return VenueEvent.findOne({ venue_id: commentData.venue.venue_id }).lean()
                .then(exist => {
                    if (!exist) {
                        console.log("Failed to find venue ID when inserting comment");
                        return [false, "nofind"];
                    }

                    return new CommentEvent({
                        user_id: String(user._id),
                        comment: commentData.comment,
                        venue: exist._id,
                        date: new Date()
                    })
                        .save()
                        .then(commentCreation => {
                            console.log("Comment submitted!");
                            return [true, commentCreation];
                        });
                });
        })
        .catch(err => {
            console.error("Comment not submitted!", err);
            return [false, err.message];
        });
}


async function deleteComment(adminID, commentID) {

    return checkWhetherUserIsAdmin(adminID)
        .then(isAdmin => {
            if (!isAdmin) {
                return [false, "noadmin"];
            }

            return CommentEvent.findOneAndDelete({ _id: commentID })
                .then(deleted => {
                    if (deleted) {
                        console.log("Comment deleted successfully");
                        console.log(deleted);
                        return [true, deleted];
                    } else {
                        console.log("Comment not deleted.");
                        return [false, "nodelete"];
                    }
                });
        })
        .catch(err => {
            console.log("Error while deleting comment", err);
            return [false, err.message];
        });
}


async function loadComment(venueID) {

    return VenueEvent.findOne({ venue_id: venueID }).lean()
        .then(result => {
            if (!result) {
                console.log("Cannot find venue based on venue ID.");
                return [false, "nofind"];
            }

            return CommentEvent.find({ venue: result._id }).lean()
                .then(async data => {
                    console.log("Successfully fetched comments");

                    const userIdSet = new Set(data.map(c => c.user_id));
                    const userIds = Array.from(userIdSet);

                    const users = await UserEvent.find({ _id: { $in: userIds } }).lean();
                    const userMap = new Map(
                        users.map(u => [String(u._id), u.username])
                    );

                    const nested = data.map(c => ({
                        _id: c._id,
                        user_id: c.user_id,
                        username: userMap.get(String(c.user_id)) || null,
                        comment: c.comment,
                        date: c.date,
                        venue: {
                            venue_id: result.venue_id,
                            name: result.name,
                            latitude: result.latitude,
                            longitude: result.longitude,
                            area: result.area
                        }
                    }));

                    console.log(nested)
                    return [true, nested];
                });
        })
        .catch(err => {
            console.error("Failed fetching comments", err);
            return [false, err.message];
        });
}

// User-venue events

function getVenueInfo(venueObjectId) {

    return VenueEvent.findOne({ _id: venueObjectId }).lean()
        .then(result => {
            if (!result) {
                console.log("Venue not found");
                return null;
            }

            const venueInfo = {
                venue_id: result.venue_id,
                name: result.name,
                latitude: result.latitude,
                longitude: result.longitude,
                area: result.area
            };

            return venueInfo;
        })
        .catch(err => {
            console.error("Failed fetching venue based on ObjectId", err);
            return null;
        });
}


function loadVenueForUser(userID) {

    return UserEvent.findOne({ _id: userID }).lean()
        .then(userResult => {
            if (!userResult) {
                console.log("Fail to fetch user info when loading favorites.");
                return [false, "noadmin"];
            }

            const favorites = userResult.favoriteLocations || [];

            return DetailEvent.find({}).lean()
                .then(events => {

                    const venueCountMap = new Map();

                    events.forEach(ev => {
                        const vId = String(ev.venue);
                        venueCountMap.set(vId, (venueCountMap.get(vId) || 0) + 1);
                    });

                    return VenueEvent.find({}).lean()
                        .then(venues => {
                            if (!venues || venues.length === 0) {
                                console.log("No venues found.");
                                return [true, []];
                            }

                            const venueArray = venues.map(v => {
                                const vId = String(v._id);
                                const totalEvents = venueCountMap.get(vId) || 0;
                                const isFavorited = favorites.includes(v.venue_id);

                                return {
                                    venue_id: v.venue_id,
                                    name: v.name,
                                    latitude: v.latitude,
                                    longitude: v.longitude,
                                    area: v.area,
                                    is_favorited: isFavorited,
                                    total_events: totalEvents
                                };
                            });

                            return [true, venueArray];
                        });
                });
        })
        .then(result => {
            console.log("Successfully fetched venues (per venue summary)");
            console.log(result);
            return result;
        })
        .catch(err => {
            console.error("Failed fetching venues", err);
            return [false, err.message];
        });
}

async function insertVenue(adminID, venueData) {

    return checkWhetherUserIsAdmin(adminID)
        .then(isAdmin => {
            if (!isAdmin) {
                return [false, "noadmin"];
            }

            return new VenueEvent({
                venue_id: venueData.venue_id,
                name: venueData.name,
                latitude: venueData.latitude,
                longitude: venueData.longitude,
                area: venueData.area
            })
                .save()
                .then((venueInsert) => {
                    console.log("Venue submitted!");
                    console.log(venueInsert);
                    return [true, venueInsert];
                });
        })
        .catch(err => {
            console.error("Venue not submitted!", err);
            return [false, err.message];
        });
}

async function favoriteLocation(userID, venueID, willFavorite) {

    return UserEvent.findOne({ _id: userID }).lean()
        .then(result => {
            if (!result) {
                console.log("Fail to fetch username in favoriting");
                return [false, "nofind"];
            }

            return VenueEvent.findOne({ venue_id: venueID }).lean()
                .then((exist) => {
                    if (!exist) {
                        console.log("Failed to find venue ID when favoriting event");
                        return [false, "nofind"];
                    }

                    let favoriteArray = [...(result.favoriteLocations || [])];

                    if (willFavorite && !favoriteArray.includes(exist.venue_id)) {
                        favoriteArray.push(exist.venue_id);

                    } else if (!willFavorite && favoriteArray.includes(exist.venue_id)) {
                        favoriteArray = favoriteArray.filter(id => id !== exist.venue_id);

                    } else {
                        console.log("No change needed - already in desired state");
                        return [true, ""];
                    }

                    return UserEvent.findOneAndUpdate(
                        { _id: userID },
                        { $set: { favoriteLocations: favoriteArray } },
                        { new: true }
                    ).lean()
                        .then(change => {
                            if (change) {
                                console.log("Location favorites updated successfully!");
                                console.log(change);
                                return [true, change];
                            } else {
                                return [false, "noupdate"];
                            }
                        });
                });
        })
        .catch(err => {
            console.log("Error while favoriting event", err);
            return [false, err.message];
        });
}

// Admin-event functions

async function loadEventForAdmin(adminID) {

    return checkWhetherUserIsAdmin(adminID)
        .then(isAdmin => {
            if (!isAdmin) {
                return [false, "noadmin"];
            }

            return DetailEvent.find({}).lean()
                .then(events => {
                    console.log("Successfully fetched events");

                    if (!events || events.length === 0) {
                        return [true, []];
                    }

                    const venueIdSet = new Set(events.map(ev => String(ev.venue)));
                    const venueObjectIds = Array.from(venueIdSet);

                    return VenueEvent.find({ _id: { $in: venueObjectIds } }).lean()
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
                                    venue: vInfo,
                                    price: ev.price,
                                    presenter: ev.presenter,
                                    date: ev.date
                                };
                            });

                            console.log(nestedEvents);
                            return [true, nestedEvents];
                        });
                });
        })
        .catch(err => {
            console.error("Failed fetching events", err);
            return [false, err.message];
        });
}

async function insertEvent(adminID, eventData) {

    return checkWhetherUserIsAdmin(adminID)
        .then(isAdmin => {
            if (!isAdmin) {
                return [false, "noadmin"];
            }

            return VenueEvent.findOne({ venue_id: eventData.venue.venue_id })
                .then((exist) => {
                    if (!exist) {
                        console.log("Failed to find venue ID when inserting event");
                        return [false, "nofind"];
                    }

                    return new DetailEvent({
                        event_id: eventData.event_id,
                        title: eventData.title,
                        description: eventData.description,
                        venue: exist._id,
                        price: eventData.price,
                        presenter: eventData.presenter,
                        date: eventData.date
                    })
                        .save()
                        .then((eventInsert) => {
                            console.log("Event submitted!");
                            console.log(eventInsert);
                            return [true, eventInsert];
                        });
                });
        })
        .catch(err => {
            console.error("Event not submitted!", err);
            return [false, err.message];
        });
}

async function deleteEvent(adminID, eventID) {

    return checkWhetherUserIsAdmin(adminID)
        .then(isAdmin => {
            if (!isAdmin) {
                return [false, "noadmin"];
            }

            return DetailEvent.findOneAndDelete({ event_id: eventID })
                .then(deleted => {
                    if (deleted) {
                        console.log(`Event deleted successfully, eventID: "${deleted.event_id}"`);
                        return [true, eventID];

                    } else {
                        console.log("Event not deleted.")
                        return [false, "nodelete"];
                    }
                });
        })
        .catch(err => {
            console.log("Error while deleting event", err);
            return [false, err.message];
        });
}

async function updateEvent(adminID, eventID, eventDataNew) {

    return checkWhetherUserIsAdmin(adminID)
        .then(isAdmin => {
            if (!isAdmin) {
                return [false, "noadmin"];
            }

            const updateFields = {};
            if (eventDataNew.event_id !== undefined) updateFields.event_id = eventDataNew.event_id;
            if (eventDataNew.title !== undefined) updateFields.title = eventDataNew.title;
            if (eventDataNew.description !== undefined) updateFields.description = eventDataNew.description;
            if (eventDataNew.price !== undefined) updateFields.price = eventDataNew.price;
            if (eventDataNew.presenter !== undefined) updateFields.presenter = eventDataNew.presenter;
            if (eventDataNew.date !== undefined) updateFields.date = eventDataNew.date;

            if (!eventDataNew.venue || eventDataNew.venue.venue_id === undefined) {
                return DetailEvent.findOneAndUpdate(
                    { event_id: eventID },
                    { $set: updateFields },
                    { new: true }
                ).then(change => {
                    if (change) {
                        console.log("Event updated successfully!");
                        console.log(change);
                        return [true, change];
                    } else {
                        return [false, "noupdate"];
                    }
                });
            }

            return VenueEvent.findOne({ venue_id: eventDataNew.venue.venue_id })
                .then(venueExist => {
                    if (!venueExist) {
                        console.log("Failed to find venue ID when updating event");
                        return [false, "nofind"];
                    }

                    updateFields.venue = venueExist._id;

                    return DetailEvent.findOneAndUpdate(
                        { event_id: eventID },
                        { $set: updateFields },
                        { new: true }
                    ).then(change => {
                        if (change) {
                            console.log("Event updated successfully!");
                            console.log(change);
                            return [true, change];
                        } else {
                            return [false, "noupdate"];
                        }
                    });
                });
        })
        .catch(err => {
            console.log("Error while updating event", err);
            return [false, err.message];
        });
}

// User authentication functions:

async function addNewUser(userData) {

    return checkWhetherUserExist(userData.username)
        .then(newUser => {
            if (!newUser) {
                console.log("User has existed!");
                return [false, "noduplicates"];
            }

            return new UserEvent({
                username: userData.username,
                password: userData.password,
                isAdmin: userData.isAdmin,
                favoriteLocations: []
            })
                .save()
                .then((userCreation) => {
                    console.log("New user created!");

                    const userDetails = {
                        username: userCreation.username,
                        isAdmin: userCreation.isAdmin,
                        userID: userCreation._id
                    };
                    console.log(userDetails);
                    return [true, userDetails];
                });
        })
        .catch(err => {
            console.error("User not created!", err);
            return [false, err.message];
        });
}

async function checkAndLoadUser(userInput) {

    return UserEvent.findOne({ username: userInput.username }).lean()
        .then(user => {
            if (!user) {
                console.log("User does not exist!");
                return [false, "nofind"];
            }

            else if (user.password != userInput.password) {
                console.log("Password does not match!");
                return [false, "nopass"];
            } else {
                console.log("Welcome back!");

                const userDetails = {
                    username: user.username,
                    isAdmin: user.isAdmin,
                    userID: user._id,
                };

                console.log(userDetails);
                return [true, userDetails];
            }
        })
        .catch(err => {
            console.log("Error while loading user", err);
            return [false, err.message];
        });
}

async function deleteUser(adminID, userID) {

    return checkWhetherUserIsAdmin(adminID)
        .then(isAdmin => {
            if (!isAdmin) {
                return [false, "noadmin"];
            }

            return UserEvent.findOneAndDelete({ _id: userID })
                .then(deleted => {
                    if (deleted) {
                        console.log(`User deleted successfully: Username: "${deleted.username}", ID: "${deleted._id}"`);
                        return [true, userID];

                    } else {
                        console.log("User is not deleted.")
                        return [false, "nodelete"];
                    }
                });
        })
        .catch(err => {
            console.log("Error while deleting user", err);
            return [false, err.message];
        });
}

async function updateUser(adminID, userID, newUserData) {

    return checkWhetherUserIsAdmin(adminID)
        .then(isAdmin => {
            if (!isAdmin) {
                return [false, "noadmin"];
            }

            const updateFields = {};
            if (newUserData.username !== undefined) updateFields.username = newUserData.username;
            if (newUserData.password !== undefined) updateFields.password = newUserData.password;
            if (newUserData.isAdmin !== undefined) updateFields.isAdmin = newUserData.isAdmin;

            return UserEvent.findOneAndUpdate(
                { _id: userID },
                { $set: updateFields },
                { new: true }
            )
                .then(change => {
                    if (change) {
                        console.log(`User updated successfully!`);
                        const userDetails = {
                            username: change.username,
                            isAdmin: change.isAdmin,
                            userID: change._id
                        };
                        console.log(userDetails);
                        return [true, userDetails];
                    } else {
                        console.log("User not updated.")
                        return [false, "noupdate"];
                    }
                });
        })
        .catch(err => {
            console.log("Error while updating user", err);
            return [false, err.message];
        });
}

async function checkWhetherIDExist(userID) {

    return UserEvent.findOne({ _id: userID }).lean()
        .then(user => {
            if (user) {
                console.log("User exists!");
                return true;

            } else {
                console.log("User not found!");
                return false;
            }
        })
        .catch(err => {
            console.log(`Error verifying whether "${userID}" has existed`, err);
            return false;
        });
}

async function checkWhetherUserIsAdmin(adminID) {

    return UserEvent.findOne({ _id: adminID }, { isAdmin: 1 }).lean()
        .then(user => {
            if (!user) {
                console.log("User does not exist!")
                return false;

            } else if (!user.isAdmin) {
                console.log("User is not an admin!")
                return false;

            } else {
                console.log("User is an admin!")
                return true;
            }
        })
        .catch(err => {
            console.log(`Error verifying whether "${adminID}" is admin`, err);
            return false;
        });
}

async function checkWhetherUserExist(isUsernameExist) {

    return UserEvent.findOne({ username: isUsernameExist }).lean()
        .then(user => {
            if (user) {
                console.log("User has existed, no duplicate usernames allowed!");
                return false;
            } else {
                console.log("Username allowed!");
                return true;
            }
        })
        .catch(err => {
            console.log(`Error verifying whether "${isUsernameExist}" has existed`, err);
            return false;
        });
}

// For testing purposes:
// async function main() {

//     connectDatabase();

//     const testData = {
//     }

//     try {
//         await functionName();
//     } catch (err) {
//         console.error("failure", err);
//     } finally {
//         await mongoose.connection.close();
//     }
// }

// main().catch(console.error);


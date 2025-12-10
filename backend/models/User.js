const mongoose = require('mongoose');

async function connectDatabase(){
    await mongoose.connect('mongodb://127.0.0.1:27017/webdevproj')
}

// Schema and models
const UserSchema = mongoose.Schema({
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
      default: false // if blank, will go to default value
    },
    favoriteEvents: {
        type: [String] // array of event IDs
    }
});

const UserEvent = mongoose.model("UserEvent", UserSchema);

const CommentSchema = mongoose.Schema({
    username: {
      type: String,
      required: [true, "Username is required"]
    },
    comment: {
      type: String,
      required: [true, "Comment is required"]
    },
    venue: {
      type: String,
      required: [true, "Venue is required"]
    },
    date: {
      type: Date,
      default: Date.now()
    },
});

const CommentEvent = mongoose.model("CommentEvent", CommentSchema);

const DetailSchema = mongoose.Schema({
    event_id: {
        type: String,
        required: [true, "Event ID is required"] // Note: this is different from ObjectID(), this is the ID provided in the dataset
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
      type: String,
      required: [true, "Venue is required"]
    },
    price: {
      type: String,
      required: [true, "Price is required"]
    },
    quota: {
        type: Number,
        required: [true, "Quota is required"]
    },
    presenter: {
      type: String,
      required: [true, "Presenter is required"]
    },
    date: {
      type: Date,
      required: [true, "Date is required"]
    },
});

const DetailEvent = mongoose.model("DetailEvent", DetailSchema);


// Helper functions for commenting
// NOTE: Function params other than isUsernameAdmin and venue must be in JSON format 

async function insertComment(commentData){ // returns boolean whether comment is successfully added or no

    return new CommentEvent({
        username: commentData.username,
        comment: commentData.comment,
        venue: commentData.venue,
    })
    .save()
    .then((commentCreation) => {
        console.log("Comment submitted!");
        console.log(commentCreation);
        return true;
    })
    .catch(err => {
        console.error("Comment not submitted!", err);
        return false;
    });
}

async function deleteComment(isUsernameAdmin, commentID){ // returns boolean and the deleted content if successful
    
    return checkWhetherUserIsAdmin(isUsernameAdmin)
    .then(isAdmin => {
        if (!isAdmin){
            return [false, "User is not an admin/does not exist"];
        }

        return CommentEvent.findOneAndDelete({
            _id: commentID})

        .then(deleted => {
            if (deleted){
                console.log("Comment deleted successfully");

                const deletedComment = {
                    username: deleted.username,
                    comment: deleted.comment,
                    venue: deleted.venue
                }

                console.log(deletedComment);
                return [true, deleted]; // returns content of deleted, null if none

            } else{
                return [false, "Comment not deleted"];
            }
        });
    })
    .catch((err) => {
        console.log("Error while deleting comment", err);
        return [false, err.message];
    });
}

async function loadComment(venueName){ // find returns array unlike findOne

    return CommentEvent.find({venue: venueName})
    .then((data) => {
        console.log(`Successfully fetched comments from "${eventID}"`);
        console.log(data);
        return [true, data]; // if empty array (no comments) but successful, it also goes here
    })
    .catch((err) => {
        console.error("Failed fetching comments", err);
        return [false, []];
    }); 
}

// Helper functions for events
async function loadEventForAdmin(adminID){ // this one is for admin, add admin validation

    return DetailEvent.find({})
    .then((data) => {
        console.log(`Successfully fetched events-`);
        console.log(data);
        return [true, data]; // if empty array (no events) but successful, it also goes here
    })
    .catch((err) => {
        console.error("Failed fetching events", err);
        return [false, []];
    }); 

}

async function loadEventForAdmin(userID, eventData){ // this one is for admin, add admin validation

}

async function favoriteEvent(userID, eventID){

}

async function insertEvent(adminID, eventData){

    return checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
        if (!isAdmin){
            return [false, "User is not an admin/does not exist"];
        }

        return new DetailEvent({
            event_id: eventData.event_id,
            title: eventData.title,
            description: eventData.description,
            venue: eventData.venue,
            price: eventData.price,
            quota: eventData.quota,
            presenter: eventData.presenter,
            date: eventData.date
        })
        .save()
        .then((eventInsert) => {
            console.log("Event submitted!");
            console.log(eventInsert);
            return [true, eventInsert];
        });
    })
    .catch(err => {
        console.error("Event not submitted!", err);
        return [false, "Event not submitted!"];
    });
}

async function deleteEvent(isUsernameAdmin, eventData){

}

async function updateEvent(isUsernameAdmin, eventObjectID, eventDataNew){ // event_id is different from Mongo's Object ID for the event!

    return checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
        if (!isAdmin){
            return [false, "User is not an admin/does not exist"];
        }

        return DetailEvent.findOneAndUpdate({_id: eventObjectID}, 
            {$set: {
                event_id: eventDataNew.event_id,
                title: eventDataNew.title,
                description: eventDataNew.description,
                venue: eventDataNew.venue,
                price: eventDataNew.price,
                quota: eventDataNew.quota,
                presenter: eventDataNew.presenter,
                date: eventDataNew.date
            }})
        .then(change => {

            if (change){

                console.log(`Event updated successfully!`);
                console.log(eventDataNew);
                return [true, eventDataNew];

            } else{
                return [false, "Event not updated"];
            }
        });
    })
    .catch((err) => {
        console.log("Error while updating event", err);
        return [false, err.message];
    });
}

// Helper functions for sign up or registration
// Password hashing and checking must be done before

async function addNewUser(userData){ // return boolean + user details/false messages
    
    return checkWhetherUserExist(userData.username)
    .then(newUser => {
        if (!newUser){
            console.log("User has existed!");
            return [false, "User has existed"];
        }

        return new UserEvent({
            username: userData.username,
            password: userData.password,
            isAdmin: userData.isAdmin,
            favorites: []
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
    .catch((err) => {
        console.error("User not created!", err);
        return [false, "User not created!"];
    });
}

async function checkAndLoadUser(userInput){ // return boolean + user details/false messages
 
    return UserEvent.findOne({username: userInput.username}) 
    .then(user => {
        if (!user){
            console.log("User does not exist!");
            return [false, ""];
        }

        else if (user.password != userInput.password){ // might consider hashing using salted hashing algos?
            console.log("Password does not match!");
            return [false, ""];

        }else{
            console.log("Welcome back!");

            const userDetails = {
                username: user.username,
                isAdmin: user.isAdmin,
                userID: user._id
            };

            console.log(userDetails);
            return [true, userDetails];
        }
    })
    .catch((err) => {
        console.log("Error while loading user", err);
        return [false, err.message];
    });
}

async function deleteUser(adminID, userDeletedID){ // return boolean + user details/false messages

    return checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
        if (!isAdmin){
            return [false, "User is not an admin/does not exist"];
        }

        return UserEvent.findOneAndDelete({_id: userDeletedID})
        .then(deleted => {
            if (deleted){
                console.log(`User deleted successfully: Username: "${deleted.username}", ID: "${deleted._id}"`);
                return [true, deleted]; // returns content of deleted, null if none

            } else{
                return [false, "User not deleted"];
            }
        });
    })
    .catch((err) => {
        console.log("Error while deleting user", err);
        return [false, err.message];
    });
}

async function updateUser(adminID, userID, newUserData){ // return boolean + user details/false messages

    return checkWhetherUserIsAdmin(adminID)
    .then(isAdmin => {
        if (!isAdmin){
            return [false, "User is not an admin/does not exist"];
        }

        return UserEvent.findOneAndUpdate({_id: userID}, 
            {$set: {
                username: newUserData.username,
                isAdmin: newUserData.isAdmin,
            }})

        .then(change => {
            if (change){
                console.log(`User updated successfully!`);

                const userDetails = {
                    username: newUserData.username,
                    isAdmin: newUserData.isAdmin,
                    userID: change._id
                };

                console.log(userDetails);
                return [true, userDetails];

            } else{

                return [false, "User not updated"];
            }
        });
    })
    .catch((err) => {
        console.log("Error while updating user", err);
        return [false, err.message];
    });
}

// Check if current user in the website is an existing one
// EXTREME CASE: admin might delete him/herself -> should log out from page

async function checkWhetherIDExist(userID){ // return boolean

    return UserEvent.findOne({_id: userID}) 
    .then(user => {
        if (user){
            console.log("User exists!");
            return true;

        }else{
            console.log("User not found!");
            return false;
        }
    })
    .catch((err) => {
        console.log(`Error verifying whether "${userID}" has existed`, err);
        return false;
    }); 
} 

async function checkWhetherUserIsAdmin(adminID){ // return boolean
    return UserEvent.findOne({_id: adminID}, {isAdmin: 1}) // meaning only return the isAdmin field
    .then(user => {
        if (!user){
            console.log("User does not exist!")
            return false;

        }else if(!user.isAdmin){
            console.log("User is not an admin!")
            return false;

        }else{
            return true;
        }
    })
    .catch((err) => {
        console.log(`Error verifying whether "${username}" is admin`, err);
        return false;
    }); 
} 

async function checkWhetherUserExist(isUsernameExist){ // return boolean
    return UserEvent.findOne({username: isUsernameExist}) 
    .then(user => {
        if (user){
            console.log("User has existed, no duplicate usernames allowed!");
            return false;
        }else{
            console.log("Username allowed!");
            return true;
        }
    })
    .catch((err) => {
        console.log(`Error verifying whether "${username}" has existed`, err);
        return false;
    }); 
} 

async function main (){

    const testData = {
        
    }

    try{
        console.log("success");

    }catch(err){
        
        console.error("fail", err);
    }finally{
        await mongoose.connection.close();
    }
}

main().catch(console.error);


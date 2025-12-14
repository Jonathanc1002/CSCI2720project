const userServices = require('../services/userServices');

exports.getAllUsers = async (req, res) => {
    try {
        const result = await userServices.loadAllUsers();
        if (result[0]) {  // [true, usersArray]
            res.json(result[1]);
        } else {  // [false, errorMessage]
            res.status(500).json({ message: result[1] });
        }
    } catch (err) {
        console.error('getUsers ERROR:', err);
        res.status(500).json({ message: "Error occured when getting all users." });
    }
};

exports.createUser = async (req, res) => {
    try {
        const result = await userServices.addNewUser(req.body);
        if (result[0]) {  // [true, data]
            res.status(201).json(result[1]);
        } else {  // [false, errorMessage]
            res.status(400).json({ message: result[1] });
        }
    } catch (err) {
        console.error('createUser ERROR:', err);
        res.status(500).json({ message: "Error occured when inserting user." });
    }
};

/**
 * Update user by ID (admin only). Uses partial updates.
 */
exports.updateUser = async (req, res) => {
    try {
        const result = await userServices.updateUser(req.params.id, req.body);
        if (result[0]) {  // [true, userDetails]
            res.json(result[1]);
        } else {  // [false, 'noupdate']
            res.status(404).json({ message: result[1] });
        }
    } catch (err) {
        console.error('updateUser ERROR:', err);
        res.status(500).json({ message: "Error occured when updating user." });
    }
};

/**
 * Delete user by ID (admin only).
 */
exports.deleteUser = async (req, res) => {
    try {
        const result = await userServices.deleteUser(req.params.id);
        if (result[0]) {  // [true, userID]
            res.json({ message: `User ID ${result[1]} deleted successfully` });
        } else {  // [false, 'nodelete']
            res.status(404).json({ message: result[1] });
        }
    } catch (err) {
        console.error('deleteUser ERROR:', err);
        res.status(500).json({ message: "Error occured when deleting user." });
    }
};




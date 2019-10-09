const express = require('express');
const passport = require('passport');
const User = require('../../models/user');

const router = express.Router();

router.get('/checkSession', (req, res) => {
    if (req.user) {
        return res.send(JSON.stringify(req.user));
    }
    return res.send(JSON.stringify({}));
});

router.get('/logout', (req, res) => {
    req.logout();
    return res.send(JSON.stringify(req.user));
});

router.post('/login', async (req, res) => {
    // look up the user by their email
    const query = User.findOne({ email: req.body.email });
    const foundUser = await query.exec();

    // if they exist, they'll have a username, so add that to our body
    if (foundUser) { req.body.username = foundUser.username; }

    passport.authenticate('local')(req, res, () => {
        // If logged in, we should have user info to send back
        if (req.user) {
            return res.send(JSON.stringify(req.user));
        }

        // Otherwise return an error
        return res.send(JSON.stringify({ error: 'There was an error logging in' }));
    });
});

router.post('/register', async (req, res) => {

    // First, check and make sure the email doesn't already exist
    const query = User.findOne({ email: req.body.email });
    const foundUser = await query.exec();
    if (foundUser) { return res.send(JSON.stringify({ error: 'Email or username already exists' })); }


    if (!foundUser) {
        // Create a user object to save, using values from incoming JSON
        const newUser = new User(req.body);

        // Save, via passport's "register" method, the user
        return User.register(newUser, req.body.password, (err, user) => {
            // If there's a problem, send back a JSON object with the error
            if (err) {
                return res.send(JSON.stringify({ error: err }));
            }
            // Otherwise log them in
            return passport.authenticate('local')(req, res, () => {
                // If logged in, we should have user info to send back
                if (req.user) {
                    return res.send(JSON.stringify(req.user));
                }
                // Otherwise return an error
                return res.send(JSON.stringify({ error: 'There was an error while registering the user' }));
            });
        });
    }
    // return an error if all else fails
    return res.send(JSON.stringify({ error: 'There was an error while registering the user' }));
});


module.exports = router;
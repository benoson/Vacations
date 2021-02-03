// ---------- Importing Our Modules ---------- //

const express = require('express');
const usersLogic = require("../logic/users-logic");

// creating a new Router object
const router = express.Router();


// ------------------------------ Handling The User's Related Requests ------------------------------ //

router.post('/register', async (request, response, next) => {

    // Extracting the data from the packet's body
    let userData = request.body;

    try {

        // Explanation -> right after the registration, the user is automatically logged in,
        // and so the we are retrieving a successful 'user login' response
        let successfullLoginData = await usersLogic.addUser(userData);

        // convert the response (Token, userType & userName) to JSON before sending it to the client
        response.json(successfullLoginData);
    }

    catch (error) {
                
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.post('/login', async (request, response, next) => {

    // Extracting the data from the packet's body
    let userData = request.body;

    try {
        let successfullLoginData = await usersLogic.login(userData);

        // convert the response (Token, userType & userName) to JSON before sending it to the client
        response.json(successfullLoginData);
    }

    catch (error) {
                
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.post('/logout', async (request, response, next) => {

    // Whenever a user has attempted to logout

    try {
        await usersLogic.logout(request);

        // Responding with an empty JSON, in order to satisfy the 'await' function in the client and make her stop waiting
        response.json();
    }

    catch (error) {
                
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.post('/info', async (request, response, next) => {

    // Attempting to get the user's type from the server's cache (from the 'logic' preset)

    try {
        let userInfo = await usersLogic.getUserInfo(request);
        response.json(userInfo);
    }

    catch (error) {
                
        // Handling the error with our Error Handler
        return next(error);
    }
});


module.exports = router;
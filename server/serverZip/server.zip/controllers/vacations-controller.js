const express = require('express');
const multer = require('multer');
let vacationsLogic = require("../logic/vacations-logic");

// creating a new Router object
const router = express.Router();


// ------------------------------ Handling The Vacations's Related Requests ------------------------------ //

router.get('/', async (request, response, next) => {

    try {

        // Attempting to get all the vacations from the logic preset -> DAO preset -> DB
        let allVacations = await vacationsLogic.getAllVacations();

        // Sending the response as JSON to the client
        response.json(allVacations);
    }

    catch (error) {
                
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.get('/favorite_vacations', async (request, response, next) => {

    try {

        // Attempting to get all the favorite vacations from the logic preset -> DAO preset -> DB
        let favoriteVacations = await vacationsLogic.getFavoriteVacations(request);

        // Sending the response as JSON to the client
        response.json(favoriteVacations);
    }

    catch (error) {
        
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.get('/all_followed_vacations', async (request, response, next) => {

    try {

        // Attempting to get all the followed vacations from the logic preset -> DAO preset -> DB
        let allFollowedVacations = await vacationsLogic.getAllFollowedVacations(request);

        // Sending the response as JSON to the client
        response.json(allFollowedVacations);
    }

    catch (error) {
        
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.post('/follow_vacation/:id', async (request, response, next) => {

    // Extracting the selected vacation's ID from the URL
    let vacationID = request.params.id;

    try {

        // Attempting to follow a vacation by the user
        await vacationsLogic.setFollowedVacationToUser(request, vacationID);

        // Responding with an empty response to the client, so the 'await' function will stop waiting on the client's side
        response.json();
    }

    catch (error) {
        
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.post('/unfollow_vacation/:id', async (request, response, next) => {

    // Extracting the selected vacation's ID from the URL
    let vacationID = request.params.id;

    try {

        // Attempting to unfollow a vacation by the user
        await vacationsLogic.unfollowUserVacation(request, vacationID);

        // Responding with an empty response to the client, so the 'await' function will stop waiting on the client's side
        response.json();
    }

    catch (error) {
        
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.post('/add_vacation', async (request, response, next) => {

    let newVacationData = request.body;

    try {

        // Attempting to unfollow a vacation by the user
        let newlyAddedVacation = await vacationsLogic.addVacation(request, newVacationData);

        // Responding with the newly updated vacation to the client, to render it in the UI
        response.json(newlyAddedVacation);
    }

    catch (error) {
        
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.post('/delete_vacation/:id', async (request, response, next) => {

    // Extracting the selected vacation's ID from the URL
    let vacationID = request.params.id;

    try {

        // Attempting to delete a vacation by the Admin
        await vacationsLogic.deleteVacation(request, vacationID);

        // Responding with an empty response to the client, so the 'await' function will stop waiting on the client's side
        response.json();
    }

    catch (error) {
        
        // Handling the error with our Error Handler
        return next(error);
    }
});

router.put('/update_vacation/:id', async (request, response, next) => {

    // Extracting the selected vacation's ID from the URL, and getting the new data that needs to be updated

    let vacationID = request.params.id;
    let newVacationData = request.body.newVacationData;

    try {

        // Attempting to update a vacation by the Admin
        const imageURLToPreview = await vacationsLogic.updateVacation(request, vacationID, newVacationData);

        // Responding with an empty response to the client, so the 'await' function will stop waiting on the client's side
        response.json(imageURLToPreview);
    }

    catch (error) {
        
        // Handling the error with our Error Handler
        return next(error);
    }
});


module.exports = router;
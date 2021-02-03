const vacationsDao = require('../dao/vacations-dao');
const ServerError = require('../errors/server-error');
const ErrorType = require("../errors/error-type");
const userCache = require('../models/UserDataCache');
const extractUserDataFromCache = require('../models/ExtractUserDataFromCache');
const download = require('image-downloader');
const fs = require('fs');


// -------------- Vacation's Server Validations - In Case Someone Tries To Skip The UI Validations -------------- //

const isVacationValid = (newVacationData) => {

    const startDate = newVacationData.startDate;
    const endDate = newVacationData.endDate;

    const isVacationNameValid = validateVacationName(newVacationData.vacationName.trim());
    const isVacationImageURLValid = validateVacationImageURL(newVacationData.imageURL.trim());
    const isVacationDescrptionValid = validateVacationDescription(newVacationData.vacationDescription.trim());
    const areVacationDatesValid = validateVacationDates(startDate, endDate);
    const isVacationPriceValid = validateVacationPrice(newVacationData.vacationPrice);

    if (isVacationNameValid) {
        if (isVacationPriceValid) {
            if (isVacationDescrptionValid) {
                if (areVacationDatesValid) {
                    if (isVacationImageURLValid) {

                        // If all validations have passed
                        return true;
                    }
                }

            }
        }
    }

    return false;
}

const validateVacationName = (trimmedVacationName) => {

    if (trimmedVacationName != "") {
        if (trimmedVacationName.length >= 3) {
            if (trimmedVacationName.length <= 44) {
                return true;
            }
        }
    }

    return false;
}

const validateVacationImageURL = (trimmedVacationImageURL) => {

    if (trimmedVacationImageURL !== "") {
        if (trimmedVacationImageURL.length >= 10) {
            if (trimmedVacationImageURL.length <= 998) {
                return true;
            }
        }
    }

    return false;
}

const validateVacationDescription = (trimmedVacationDescription) => {

    if (trimmedVacationDescription !== "") {
        if (trimmedVacationDescription.length >= 5) {
            if (trimmedVacationDescription.length <= 249) {
                return true;
            }
        }
    }

    return false;
}

const validateVacationDates = (newVacationStartDate, newVacationEndDate) => {
    if (newVacationStartDate !== "") {
        if (newVacationStartDate !== undefined) {

            if (newVacationEndDate !== "") {
                if (newVacationEndDate !== undefined) {

                    let currentDate = new Date().setHours(0, 0, 0, 0);
                    let startDate = new Date(newVacationStartDate).setHours(0, 0, 0, 0);
                    let endDate = new Date(newVacationEndDate).setHours(0, 0, 0, 0);

                    // Checking if the starting date is not in the past
                    if (startDate >= currentDate) {

                        // Checking if the ending date is greater than the starting date
                        if (endDate > startDate) {
                            return true;
                        }

                        else {
                            return false;
                        }
                    }

                    else {
                        return false;
                    }
                }
            }
        }
    }

    return false;
}

const validateVacationPrice = (vacationPrice) => {
    if (vacationPrice > 0) {
        if (vacationPrice < 100000) {
            return true;
        }
    }

    return false;
}


// -------------- Vacation's Server Logic Functions -------------- //

const getAllVacations = async () => {

    // Retrieving all the vacations from the DAO preset

    let allVacations = await vacationsDao.getAllVacations();
    for (let vacation of allVacations) {
        vacation.imageURL = 'http://localhost:3001/' + vacation.imageURL;
    }
    return allVacations;
}

const getFavoriteVacations = async (request) => {

    // Getting the user's favorite vacations

    let userData = extractUserDataFromCache(request);
    let userID = userData.userID;
    let userType = userData.userType

    // Only 'USER' type can retrieve favorite vacations
    if (userType === "USER") {

        // Retrieving all the user's favorite vacations from the DAO preset
        let favoriteVacations = await vacationsDao.getFavoriteVacations(userID);
        for (let vacation of favoriteVacations) {
            vacation.imageURL = 'http://localhost:3001/' + vacation.imageURL;
        }
        return favoriteVacations;
    }

    return;
}

const getAllFollowedVacations = async (request) => {

    // Getting all the vacations that has more than 1 followers, for the 'Reports' page
    
    let userData = extractUserDataFromCache(request);
    let userType = userData.userType

    // Only 'ADMIN' type can get the followed vacations
    if (userType === "ADMIN") {

        // Retrieving all the followed vacations from the DAO preset
        let allFollowedVacations = await vacationsDao.getAllFollowedVacations();
        return allFollowedVacations;
    }

    return;
}

const setFollowedVacationToUser = async (request, vacationID) => {
    
    let userData = extractUserDataFromCache(request);
    let userID = userData.userID;

    // Sending the selected vacation's ID and the user's ID from the cache
    await vacationsDao.setFollowedVacationToUser(vacationID, userID);
}

const unfollowUserVacation = async (request, vacationID) => {

    let userCacheData = extractUserDataFromCache(request);
    let userID = userCacheData.userID;

    // Sending the selected vacation's ID and the user's ID from the cache
    await vacationsDao.unfollowUserVacation(vacationID, userID);
}

const addVacation = async (request, newVacationData) => {

    let userCacheData = extractUserDataFromCache(request);
    let userType = userCacheData.userType;

    // Checking the server's cache if the user's type is an admin
    if (userType === "ADMIN") {
        
        const imageName = Date.parse(new Date()) + '.jpg';
        const imageURL = newVacationData.imageURL;

        const options = {
            url: imageURL,
            dest: './uploads/' + imageName
        }

        if (isVacationValid(newVacationData)) {

            // Sending the selected vacation's data to the DAO preset, in order to add it to the DB
            newVacationData.imageURL = imageName;
            let newlyAddedVacation = await vacationsDao.addVacation(newVacationData);
    
            // Downloading the image locally to our server
            await download.image(options).then(() => {
              console.log('Image Saved Locally!');
            })
            .catch(() => {
                throw new ServerError(ErrorType.BAD_IMAGE);
            });
    
            newlyAddedVacation[0].imageURL = `http://localhost:3001/${imageName}`;
            return newlyAddedVacation;
        }

        else {
            throw new ServerError(ErrorType.ACTION_NOT_ALLOWED);
        }
    }

    else {
        throw new ServerError(ErrorType.USER_IS_NOT_AUTHORIZED);
    }
}

const deleteVacation = async (request, vacationID) => {

    let userCacheData = extractUserDataFromCache(request);
    let userType = userCacheData.userType;
    let imageToDeleteFromServer = request.body.imageToDeleteFromServer;
    console.log(imageToDeleteFromServer);
    const imageFileName = imageToDeleteFromServer.split('/')[3];
    
    // Checking the server's cache if the user's type is an admin
    if (userType === "ADMIN") {

        // Sending the selected vacation's ID and the user's ID from the cache, in order to delete the vacation from the DB
        await vacationsDao.deleteVacation(vacationID);

        fs.unlinkSync('./uploads/' + imageFileName);
    }

    else {
        throw new ServerError(ErrorType.USER_IS_NOT_AUTHORIZED);
    }
}

const updateVacation = async (request, vacationID, newVacationData) => {

    let userCacheData = extractUserDataFromCache(request);
    let userType = userCacheData.userType;
    
    // Checking the server's cache if the user's type is an admin
    if (userType === "ADMIN") {
        
        const imageName = Date.parse(new Date()) + '.jpg';
        const imageURL = newVacationData.imageURL;
        const imageToDeleteFromServer = request.body.imageToDeleteFromServer;
        const imageFileName = imageToDeleteFromServer.split('/')[3];
        newVacationData.imageURL = imageName;

        if (isVacationValid(newVacationData)) {

            const options = {
                url: imageURL,
                dest: './uploads/' + imageName
            }

            // Sending the selected vacation's ID from the cache, and the vacation's data, in order to update the vacation in the DB
            await vacationsDao.updateVacation(vacationID, newVacationData);
    
            // Downloading the image locally to our server
            await download.image(options).then(() => {
                
                fs.unlinkSync('./uploads/' + imageFileName);
    
                console.log('Image Updated!');
            })
            .catch(() => {
                throw new ServerError(ErrorType.BAD_IMAGE);
            });

            return "http://localhost:3001/" + imageName;
        }
    }

    else {
        throw new ServerError(ErrorType.USER_IS_NOT_AUTHORIZED);
    }
}


module.exports = {
    getAllVacations,
    getFavoriteVacations,
    getAllFollowedVacations,
    setFollowedVacationToUser,
    unfollowUserVacation,
    addVacation,
    updateVacation,
    deleteVacation
};
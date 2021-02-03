
// ---------- Extracting The User's Data From The Server's Cache---------- //

const ErrorType = require('../errors/error-type');
const ServerError = require('../errors/server-error');
const userCache = require('../models/UserDataCache');

const extractUserDataFromCache = (request) => {

    // Attempting to get the user from the server's cache, from the Token received from the client
    
    let authorizationString = request.headers['authorization'];
    let token = authorizationString.substring("Bearer ".length);
    let userCacheData = userCache.get(token);

    // If the Token that was sent was not found, alert the client that the user is no longer logged in
    if (userCacheData === undefined) {
        throw new ServerError(ErrorType.USER_IS_NO_LONGER_LOGGED_IN);
    }

    return userCacheData;
}

module.exports = extractUserDataFromCache;
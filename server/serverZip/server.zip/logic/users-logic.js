let usersDao = require('../dao/users-dao');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const userCache = require('../models/UserDataCache');
const extractUserDataFromCache = require('../models/ExtractUserDataFromCache');
const crypto = require('crypto');
let ServerError = require('../errors/server-error');
let ErrorType = require('../errors/error-type');


const generateHashedPassword = (password) => {

    // Hashing and returning the user's password

    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    return hashedPassword;
}

const addUser = async (userData) => {

    // Validating that the username doesn't exist already
    let isUserExistByUsername = await usersDao.isUserExistByUserName(userData);

    // If it exists, throw a new server error, indicating that the username already exists
    if (isUserExistByUsername) {
        throw new ServerError(ErrorType.USER_NAME_ALREADY_EXIST);
    }
    
    // Salting the user's password for a better Hash protection
    const saltedPassword = getSaltedPassword(userData.password);

    // Hashing the user's salted password
    const hashedPassword = generateHashedPassword(saltedPassword);

    // By Default, Everyone that registers is a user
    const userType = "USER";

    // The data we are about to send to the DAO preset, in order to insert it to the DB
    let userModifiedData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        userName: userData.userName,
        hashedPassword: hashedPassword,
        userType: userType
    }

    // Sending the user's data to the DAO preset
    await usersDao.addUser(userModifiedData);

    // Defining an object to send to the login function, in order to login after a successful registration
    let userDataToLogin = {
        userName: userModifiedData.userName,
        password: userModifiedData.hashedPassword
    }

    // Performing a login after the register, and indicating that the login occurs after a registration
    let userSuccessfulLoginServerResponse = login(userDataToLogin, true);

    // Sending the response (Token & User Type) back to the client, to store them in the sessionStorage for usage
    return userSuccessfulLoginServerResponse;
}

const getLeftSaltedPasswordValue = () => {
    return '!@$g00gl3A$$i$t4nt$@!';
}

const getRightSaltedPasswordValue = () => {
    return 'I-L0v3-Fu115t4ck';
}

const getLeftSaltedUserNameValue = () => {
    return `b12%e3&$n!`;
}

const getRightSaltedUserNameValue = () => {
    return 'xHzG$!*^&!';
}

const getSaltedPassword = (userPassword) => {

    // Getting and returning salted values for the user's password

    const leftPasswordSalt = getLeftSaltedPasswordValue();
    const rightPasswordSalt = getRightSaltedPasswordValue();
    const saltedPassword = leftPasswordSalt + userPassword + rightPasswordSalt;

    return saltedPassword;
}

const getSaltedUserName = (userName) => {

    // Getting and returning salted values for the user's username

    const leftSalt = getLeftSaltedUserNameValue();
    const rightSalt = getRightSaltedUserNameValue();
    const saltedUserName = leftSalt + userName + rightSalt;

    return saltedUserName;
}

const generateJWTtoken = (saltedUserName) => {

    // Generating a token that the user will receive, based on the salted username and a secret

    const token = jwt.sign( { sub: saltedUserName }, config.secret);
    return token;
}

const saveUserDataToServerCache = (userID, userName, userType, token) => {

    // Saving the user's data to the server's cache, with the key being the token generated

    const userCacheData = {
        userID: userID,
        userName: userName,
        userType: userType
    };

    userCache.set(token, userCacheData);
}

const getUserInfo = (request) => {

    // Retrieving the user type from the server's cache

    const userCacheData = extractUserDataFromCache(request);
    const userType = userCacheData.userType;
    const userName = userCacheData.userName;

    const userInfo = {
        userType,
        userName
    };

    return userInfo;
}

const logout = (request) => {
    
    // Deleting the user's data from the server's cache after a user has logged out

    let userCacheData = extractUserDataFromCache(request);
    
    let userToken = userCacheData.token;
    userCache.delete(userToken);
}

const login = async (userData, isLoginRightAfterRegistration) => {

    // Explanation - If the user got here by registering, (and automatically logging),
    // it means that he already has a Hashed password with the data he sent.
    // In that case, there's no need to Salt and Hash the password again.

    // If the user has NOT logged in automatically right after registration
    if (!isLoginRightAfterRegistration) {

        // Salting the user's password for a better Hash protection
        const saltedPassword = getSaltedPassword(userData.password);

        // Changing the user's password to a Hashed password
        userData.password = crypto.createHash('md5').update(saltedPassword).digest('hex');
    }

    // Sending the user's data to the DAO preset, and waiting to get the response
    const userLoginData = await usersDao.login(userData);

    // Getting the user's type and name from the data received from the DAO preset
    const userType = userLoginData.userType;
    const userName = userLoginData.userName;
    const userID = userLoginData.userID;
    
    // Salting the user's username for a better token protection
    const saltedUserName = getSaltedUserName(userName);

    // Getting a token based on the salted username and a secret
    const token = generateJWTtoken(saltedUserName);

    // Saving The User's Data To The Server's Cache
    saveUserDataToServerCache(userID, userName, userType, token);

    // Defining the result object that will be sent back to the 'controller' preset
    const userSuccessfulLoginServerResponse = {
        token: token,
        userType: userType,
        userName: userName
    }

    // Returning the 'successful login response' object to the 'controller' preset
    return userSuccessfulLoginServerResponse;
}


module.exports = {
    login,
    logout,
    addUser,
    getUserInfo
};
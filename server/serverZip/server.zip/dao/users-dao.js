let connection = require("./connection-wrapper");
let ErrorType = require("../errors/error-type");
let ServerError = require("../errors/server-error");


const login = async (user) => {

    // Creating the SQL query to get the user from the DB

    const SQL = "SELECT User_Name as userName, User_Type as userType, User_ID as userID FROM users where User_Name =? and Password =?";
    const parameters = [user.userName, user.password];

    let userLoginResult;

    try {
        // Sending the SQL query and the user's login data to the 'connection wrapper' preset
        userLoginResult = await connection.executeWithParameters(SQL, parameters);
    }

    catch (error) {
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }

    // If the user was not found in the DB
    if (userLoginResult === null || userLoginResult.length === 0) {
        throw new ServerError(ErrorType.UNAUTHORIZED);
    }

    // In case the procedure went well, and we found the user in the DB
    return userLoginResult[0];
}

const addUser = async (user) => {

    // Creating the SQL query
    // Not Inserting The User's ID, Because It Is Auto Incremented By The DB (Generates a unique ID for each new user)

    const SQL = "INSERT INTO users (First_Name, Last_Name, User_Name, Password, User_Type) VALUES (?, ?, ?, ?, ?)";
    const parameters = [user.firstName, user.lastName, user.userName, user.hashedPassword, user.userType];
    
    try {
        // Sending the SQL query and the user's register data to the 'connection wrapper' preset
        await connection.executeWithParameters(SQL, parameters);
    }
    
    catch (error) {
        
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }
}

// Checking If The Username Already Exist
const isUserExistByUserName = async (user) => {

    // Creating the SQL query to check if the user exist by username

    const SQL = "SELECT User_Name FROM users WHERE User_Name =?";
    const parameter = [user.userName];

    let userNameAlreadyExists;

    try {
        // Sending the SQL query and the user's username to the 'connection wrapper' preset
        userNameAlreadyExists = await connection.executeWithParameters(SQL, parameter);
    }

    catch (error) {
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }

    // If the username was not found in the DB
    if (userNameAlreadyExists === null || userNameAlreadyExists.length === 0) {
        return false;
    }

    return true;
}


module.exports = {
    login,
    addUser,
    isUserExistByUserName
};
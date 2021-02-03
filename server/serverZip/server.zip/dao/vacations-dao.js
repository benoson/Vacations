let connection = require("./connection-wrapper");
let ErrorType = require("../errors/error-type");
let ServerError = require("../errors/server-error");


const getAllVacations = async () => {

    // Creating the SQL query using Aliases, to get better variables names

    const SQL = `SELECT
                    Vacation_ID as vacationID,
                    Vacation_Name as vacationName,
                    Vacation_Description as vacationDescription,
                    Vacation_Price as vacationPrice,
                    DATE_FORMAT(Start_Date, '%d/%m/%Y') as startDate,
                    DATE_FORMAT(End_Date, '%d/%m/%Y') as endDate,
                    Image_URL as imageURL,
                    Followers_Count as followersCount
                FROM
                    vacations`;

    try {

        // Sending the SQL query to the 'connection wrapper' preset
        let allVacations = await connection.execute(SQL);

        // In case the procedure went well, and we got back data from the DB
        return allVacations
    }

    catch (error) {
        
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }
}

const getFavoriteVacations = async (userID) => {
    
    // Creating a Join Table query, for the user's favorite vacations, using Aliases, to get better variables names

    const SQL = `SELECT
                    vacationsTable.Vacation_ID
                        as vacationID,
                    vacationsTable.Vacation_Name
                        as vacationName,
                    vacationsTable.Vacation_Description
                        as vacationDescription,
                    vacationsTable.Vacation_Price
                        as vacationPrice,
                    DATE_FORMAT(Start_Date, '%d/%m/%Y')
                        as startDate,
                    DATE_FORMAT(End_Date, '%d/%m/%Y')
                       as endDate,
                    vacationsTable.Image_URL
                        as imageURL,
                    vacationsTable.Followers_Count
                        as followersCount
                 FROM
	                vacations.vacations vacationsTable
    
                 INNER JOIN
                    (
                        SELECT
                            Vacation_ID
                        FROM
                            vacations.followed_Vacations
                        WHERE
                            User_ID = ?
                    ) AS selective_vacations_IDs
    
                WHERE vacationsTable.Vacation_ID = selective_vacations_IDs.Vacation_ID`;

    const parameter = [userID];

    try {

        // Sending the SQL query and the parameters to the 'connection wrapper' preset
        let favoriteVacations = await connection.executeWithParameters(SQL, parameter);

        // In case the procedure went well, and we got back data from the DB
        return favoriteVacations;
    }

    catch (error) {

        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }
}

const getAllFollowedVacations = async () => {

    // Creating the SQL query using Aliases, to get better variables names

    const SQL = `SELECT
                    Vacation_ID as vacationID,
                    Vacation_Name as vacationName,
                    Vacation_Description as vacationDescription,
                    Vacation_Price as vacationPrice,
                    DATE_FORMAT(Start_Date, '%d/%m/%Y') as startDate,
                    DATE_FORMAT(End_Date, '%d/%m/%Y') as endDate,
                    Image_URL as imageURL,
                    Followers_Count as followersCount
                FROM
                    vacations
                WHERE
                    Followers_Count > 0`;

    try {

        // Sending the SQL query to the 'connection wrapper' preset
        let allFollowedVacations = await connection.execute(SQL);

        // In case the procedure went well, and we got back data from the DB
        return allFollowedVacations
    }

    catch (error) {
        
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }
}

const setFollowedVacationToUser = async (vacationID, userID) => {

    // Inserting the vacation's ID and the user's ID to the 'followed vacations' table

    const SQL = `INSERT INTO followed_vacations (Vacation_ID, User_ID) VALUES (?, ?)`;
    const parameters = [vacationID, userID];

    try {

        // Sending the SQL queries and the parameters to the 'connection wrapper' preset
        await connection.executeWithParameters(SQL, parameters);

        // Updating the followers count of the selected vacation
        updateFollowersCount(vacationID);
    }

    catch (error) {
        
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }
}

const unfollowUserVacation = async (vacationID, userID) => {

    // Deleting vacation's ID and user's ID from the 'followed vacations' table
    
    const SQL = `DELETE FROM
                                followed_vacations
                            WHERE
                                Vacation_ID =?
                            AND
                                User_ID =?`;

    const parameters = [vacationID, userID];

    try {

        // Sending the SQL queries and the parameters to the 'connection wrapper' preset
        await connection.executeWithParameters(SQL, parameters);

        // Updating the followers count of the selected vacation
        updateFollowersCount(vacationID);
    }

    catch (error) {
        
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }
}

const updateFollowersCount = async (vacationID) => {

    // Updating the followers count of the selected vacation

    const SQL = `UPDATE vacations
                    SET Followers_Count = 
                    (
                        SELECT
                            COUNT(Vacation_ID)
                        FROM
                            followed_vacations
                        WHERE
                            Vacation_ID = ?
                    )
                    WHERE Vacation_ID = ?`;

    const parameters = [vacationID, vacationID];

    try {

        // Sending the SQL queries and the parameters to the 'connection wrapper' preset
        await connection.executeWithParameters(SQL, parameters);
    }

    catch (error) {
        
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }
}

const addVacation = async (newVacationData) => {

    // Adding a new vacation to the DB

    const SQLInsertQuery = `INSERT INTO
                                vacations
                                    (
                                        Vacation_Name,
                                        Vacation_Description,
                                        Vacation_Price,
                                        Start_Date,
                                        End_Date,
                                        Image_URL,
                                        Followers_Count
                                    )
                                    VALUES (?, ?, ?, ?, ?, ?, 0)`;

    const parameters = [newVacationData.vacationName, newVacationData.vacationDescription,newVacationData.vacationPrice, newVacationData.startDate,
                        newVacationData.endDate, newVacationData.imageURL];


    // Retrieving the newly added vacation, because the DB generated the vacation's ID (Auto Incremented), and we need to retrieve it to the client

    const getnewlyAddedVacationSQL = `SELECT
                                            Vacation_ID as vacationID,
                                            Vacation_Name as vacationName,
                                            Vacation_Description as vacationDescription,
                                            Vacation_Price as vacationPrice,
                                            DATE_FORMAT(Start_Date, '%d/%m/%Y') as startDate,
                                            DATE_FORMAT(End_Date, '%d/%m/%Y') as endDate,
                                            Image_URL as imageURL,
                                            Followers_Count as followersCount
                                        From
                                            vacations
                                        WHERE
                                            Vacation_ID = (
                                                SELECT
                                                    MAX(Vacation_ID)
                                                FROM
                                                    vacations
                                            )`;

    try {

        // Sending the SQL queries and the parameters to the 'connection wrapper' preset
        await connection.executeWithParameters(SQLInsertQuery, parameters);
        let newlyAddedVacation = await connection.execute(getnewlyAddedVacationSQL);

        // In case the procedure went well, and we got back data from the DB, send the newly added vacation to the user's UI
        return newlyAddedVacation;
    }

    catch (error) {

        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR);
    }
}

const updateVacation = async (vacationID, newVacationData) => {

    // Updating the vacation's info according to the parameters received from the admin (client)

    const SQL = `UPDATE
                    vacations
                    SET
                    Vacation_Name = ?,
                    Vacation_Description = ?,
                    Vacation_Price = ?,
                    Start_Date = ?,
                    End_Date = ?,
                    Image_URL = ?
                    WHERE
                    Vacation_ID = ?`;
                    
    const parameters = [newVacationData.vacationName, newVacationData.vacationDescription,newVacationData.vacationPrice, newVacationData.startDate,
                        newVacationData.endDate, newVacationData.imageURL, vacationID];

    try {

        // Sending the SQL query and the parameter to the 'connection wrapper' preset
        await connection.executeWithParameters(SQL, parameters);
    }

    catch (error) {

        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR, SQL, error);
    }
}

const deleteVacation = async (vacationID) => {

    // Creating the SQL queries for deleting the rows in the 'followed_vacations' and in the 'all vacations' tables

    const SQLDeleteFromFollowedTableQuery = `DELETE FROM
                                                followed_vacations
                                                    WHERE
                                                Vacation_ID = ?`;

    const SQLDeleteFromAllVacationsTableQuery = `DELETE FROM
                                                    vacations
                                                 WHERE
                                                    Vacation_ID = ?`;

    const parameter = [vacationID];

    try {

        // Sending the SQL queries and the parameter to the 'connection wrapper' preset
        await connection.executeWithParameters(SQLDeleteFromFollowedTableQuery, parameter);
        await connection.executeWithParameters(SQLDeleteFromAllVacationsTableQuery, parameter);
    }

    catch (error) {
        
        // Technical Error
        throw new ServerError(ErrorType.GENERAL_ERROR);
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
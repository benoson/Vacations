const mySQL = require('mysql2');

// The connection data to the DB
const connection = mySQL.createConnection({
    host: "34.65.242.152",
    user: "root",
    password: "1234",
    database: "vacationsTables"
});

// Connecting to the DB
connection.connect( error => {
    if (error) {
        
        console.log(`Failed To Create Connection: ${error}`);
        return;
    }

    console.log('You are connected to MySQL!');
});


function execute(SQL) {

    return new Promise( (resolve, reject) => {
        connection.query(SQL, (error, result) => {
            if (error) {

                console.log("Failed interacting with DB, calling reject");

                // reject calls the 'catch' inside the DAO preset
                reject(error);
                return;
            }

            // resolve = success, move on with the function inside the DAO preset
            resolve(result);
        });
    });
}

function executeWithParameters(SQL, parameters) {

    return new Promise( (resolve, reject) => {
        connection.execute(SQL, parameters, (error, result) => {
            
            if (error) {

                console.log("Failed interacting with DB, calling reject");

                // reject calls the 'catch' inside the DAO preset
                reject(error);
                return;
            }

            // resolve = success, move on with the function inside the DAO preset
            resolve(result);
        });
    });
}



module.exports = {
    execute,
    executeWithParameters
};
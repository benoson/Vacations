const express = require('express');
const errorHandler = require('./errors/error-handler');
const usersController = require('./controllers/users-controller');
const vacationsController = require('./controllers/vacations-controller');
const loginFilter = require('./middleware/login-filter');
const cors = require('cors');
const registerSocketConnections = require('./socket/index');

// Creating an Express application
const server = express();

server.use(express.static(__dirname));

// The default folder for the images is 'uploads'
server.use(express.static('./uploads'));

// Using CORS, and letting the user access our server, and manipulate information
server.use(cors({ origin: "http://localhost:3000"}));

// Signing the 'login filter' to our server
server.use(loginFilter());

// express.json() is parsing the requests recieved to the server side
server.use(express.json());

// Whenever the user is dealing with the URL '/users', use the controller 'usersController' to handle that request 
server.use('/users', usersController);

// Whenever the user is dealing with the URL '/vacations', use the controller 'usersController' to handle that request 
server.use('/vacations', vacationsController);

// Registering the use of our Error Handler
server.use(errorHandler);

// Registering the server's socket connections
registerSocketConnections(server);


// Using the enviroment variable 'PORT' to listen for incoming requests, and if it is not defined, using the port 3001.
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
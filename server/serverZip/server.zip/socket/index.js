// ---------- Registering Socket Connections And Listeners ---------- //

const registerSocketConnections = (server) => {

    const usersIDSocketMap = require('../models/UsersIDSocketMap');
    const userCache = require('../models/UserDataCache');

    // Creating an HTTP server for the 'Socket.io'
    const http = require('http').createServer(server);
    const io = require('socket.io')(http);

    io.on('connection', (socket) => {

        const handshakeData = socket.request;

        // Extracting the user's ID from the server's cache, using the user's Token
        const userToken = handshakeData._query['userToken'];
        const userCacheData = userCache.get(userToken);

        // Checking if the user is currently logged in, and he if is currently registered in the server's cache
        if (userCacheData !== undefined) {
            
            const userID = userCacheData.userID;
    
            // Inserting the user that has connected, to the SocketMap
            usersIDSocketMap.set(userID, socket);
    
            socket.on('add-vacation', (newlyAddedVacation) => {
                io.emit('add-vacation', newlyAddedVacation);
            });
        
            socket.on('update-vacation-info', (updatedVacationData) => {
                io.emit('update-vacation-info', updatedVacationData);
            });
        
            socket.on('delete-vacation', (clickedVacationID) => {
                io.emit('delete-vacation', clickedVacationID);
            });
        
            socket.on('increase-vacation-followers-count', (socketInfo) => {
                io.emit('increase-vacation-followers-count', socketInfo);
            });
        
            socket.on('decrease-vacation-followers-count', (socketInfo) => {
                io.emit('decrease-vacation-followers-count', socketInfo);
            });
        }

        socket.on('disconnect', () => {

            let handshakeData = socket.request;
            let userID = handshakeData._query['userID'];
    
            // Deleting the user that has disconnected from the SocketMap of the users ID's
            usersIDSocketMap.delete(userID);
        })
    });

    http.listen(3002, () => {
        console.log('socket listening on port 3002');
    })
}

module.exports = registerSocketConnections;
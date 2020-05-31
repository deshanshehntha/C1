

        "use strict";
        require('dotenv').config();
        var fs = require('fs');
        var util = require('util');
        var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
        var log_stdout = process.stdout;

        console.log = function (d) { //
            log_file.write(util.format(d) + '\n');
            log_stdout.write(util.format(d) + '\n');
        };

        /** express initialization */

        const express = require("express");
        const http = require("http");
        const socketIo = require("socket.io");
        const axios = require("axios");
        const SERVER_ID = "01C"
        const port = process.env.PORT;
        const index = require("./index");

        const app = express();
        app.use(index);

        const server = http.createServer(app);
        server.listen(port, () => console.log(`Listening on port ${server.address().port}`));

        const ClientDataStore = require("./clientDataStore");
        const AllConnectionsTestStore = require("./allConnectionsTestStore");

        console.log(server.address().port)

        /** bind ip to ngrok**/
        console.log("starting tunnel")

        /** create main connection variable**/
        var mainConnectionURL;


        const ngrok = require('ngrok');
        (async function() {
            const connectionURL = await ngrok.connect(server.address().port); // https://757c1652.ngrok.io -> http://localhost:9090
            console.log("This nodes connection tunnel url |" + connectionURL);
            /** create socket io server */

            global.io = require('socket.io')(server);
            /** create socket io server */


            global.io.on('connection', function (socket) {
                console.log("Connected Socket | " + socket.id);

                socket.on('own_client', function () {
                    console.log("Connected this nodes own client |")
                });

                socket.on('client_connection_request', function (data) {
                    console.log("Client is requesting to connect | URL" + data.ip + "| Client id | " + data.customId)
                    ClientDataStore.add(socket.id, data.customId, data.ip, Date.now());
                    AllConnectionsTestStore.add(socket.id, data.customId, data.ip, Date.now())
                    const address = leadershipSelectionAlgorithm(socket.id);
                    socket.emit('redirect_url', address);

                });

                socket.on('disconnect', function () {
                    console.log("Disconnected Socket |" + socket.id);
                    ClientDataStore.remove(socket.id);
                });

                socket.on('from_child', function (data) {
                    console.log("Server node id" + data)

                });

                socket.on('login_request', function (data) {
                    console.log("Login Object" + data)

                });

                socket.on('getting_connected_node_details_from_Children', function (data) {
                    console.log("Node connection details | url : " + data.url + " Connection Data : " + data.childNodes);
                    socket1.emit('getting_connected_node_details', data);
                });

            });


            /** create socket io client*/

            let client = require("socket.io-client");
            var socket1 = client.connect("http://127.0.0.1:4003");


            socket1.on('connect', function () {
                socket1.emit('client_connection_request', {customId: SERVER_ID, ip: connectionURL});
                console.log("Conneected to the main node |");
                // console.log("Owm connection parameters : " + SERVER_ID + ip.address() + server.address().port);
            });

            socket1.on("redirect_url", (data) => {
                console.log("Getting the redirection parameters from main node...... |");
                if(data !== 1) {
                    mainConnectionURL = data;
                    console.log("Redirect params from the server |" + data);
                    console.log("Main connection URL setted |" + mainConnectionURL);
                    console.log("Disconnecting with the main server |");
                    socket1.disconnect()
                    createNewPeerConnection(data)

                } else {
                    console.log("Stay connected to main server |");
                }

            });

            socket1.on('requesting_connection_details', function () {
                console.log("Getting connection nodes.....");
                io.emit('requesting_connection_details');
                console.log("Getting connected nodes from the main parent node|");
                socket1.emit('getting_connected_node_details', { "url" : connectionURL, "childNodes" : ClientDataStore.getAll()});
            });


            function createNewPeerConnection(data) {
                console.log("Create new peer connecton with redirectd node | " + data);

                var socket1 = require('socket.io-client')(""+data+"", {
                        forceNew: true
                    });

                socket1.on('connect', function (data) {
                    socket1.emit('client_connection_request', {customId: SERVER_ID, ip: connectionURL});
                    console.log("Connect to redirected node |");
                });

                socket1.on('disconnect', function () {
                    console.log("Disconnected from |" + socket1.io.uri);
                    console.log(mainConnectionURL + "...Comparing..." + socket1.io.uri);
                    var testUrl = socket1.io.uri;
                    var compareValue = mainConnectionURL.localeCompare(testUrl);
                    console.log("compared result" + compareValue)
                    if(mainConnectionURL === testUrl) {
                        console.log("Connect to main")
                        onDisconnectConnectToMain();
                    }
                });

                socket1.on("redirect_url", (data) => {
                    if(data !== 1) {
                        mainConnectionURL = data;
                        console.log("Main connection URL setted |" + mainConnectionURL );
                        console.log("Redirect params from the redirected nodes |" + data);
                        console.log("Disconnecting with the main server");
                        console.log("redirect url" + data);
                        socket1.disconnect()
                        createNewPeerConnection(data)

                    }
                });


                socket1.emit('from_child', "test");

                socket1.on('requesting_connection_details', function () {
                    console.log("Getting connection nodes.....");
                    io.emit('requesting_connection_details');
                    console.log("Getting connected nodes from child|");
                    socket1.emit('getting_connected_node_details_from_Children', { "url" : connectionURL, "childNodes" : ClientDataStore.getAll()});

                });


            }

            function onDisconnectConnectToMain() {

                console.log("Connect back to main......")

                var socket1 = require('socket.io-client')("http://127.0.0.1:4003", {
                    forceNew: true
                });

                socket1.on('connect', function () {
                    socket1.emit('client_connection_request', {customId: SERVER_ID, ip: connectionURL});
                    console.log("Connected");
                });

                socket1.on("redirect_url", (data) => {
                    if(data !== 1) {
                        mainConnectionURL = data;
                        console.log("Main Connection URL setted |" + data);
                        console.log("redirect url" + data);
                        socket1.disconnect()
                        createNewPeerConnection(data)

                    }
                });

                socket1.on('disconnect', function () {
                });

            }

            function leadershipSelectionAlgorithm(socketId) {

                console.log("Leadership selection algo!")

                if(ClientDataStore.getAll().length <= 2 ){
                    console.log("Kept the connection" + ClientDataStore.getAll().length);
                    return 1;
                } else {
                    ClientDataStore.remove(socketId);
                    var byDate = ClientDataStore.getAll().slice(0);
                    byDate.sort(function(a,b) {
                        return a.timestamp - b.timestamp;
                    });
                    console.log('by date:');
                    console.log(byDate);

                    byDate[0].timestamp = Date.now();
                    console.log(byDate[0].url);
                    return byDate[0].url;
                }

            }

        })();



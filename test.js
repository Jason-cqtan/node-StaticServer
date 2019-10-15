'use strict';

const StaticServer = require('./StaticServer');

let server = new StaticServer({
    port: 8888
});

server.run();

//server.close();
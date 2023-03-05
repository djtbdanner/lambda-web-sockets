const { Server } = require('ws');
const { handler: handlerSocket } = require('../sendmessage');
const { handler: handlerConnect } = require('../connect');
const { handler: handlerDisconnect } = require('../disconnect');
const { socketEvent } = require('./apiEvents/socket');
const { connectionEvent } = require('./apiEvents/connection');
const https = require('https');
const http = require('http');
const fs = require('fs');

const socketConnections = new Map();

// this creates an insecure run, but it changes the lambda that responds
// to tls so that it can process the socket stuff and reply to this server
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// HTTPS - server, this gets the responses from the lambda and converts them into
// client socket responses (the line above allows this to run with local cert)
const options = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
}
const httpsServer = https.createServer(options, async function (req, res) {
    let body = await getRequestBody(req);
    const socketId = decodeURIComponent(req.url.split('/')[2]);
    console.log(`Lambda responds to socket ${socketId} - \n ${body}`);
    const socket = socketConnections.get(socketId);
    if (!socket) {
        res.writeHead(410);// let the lambda know this no longer exists
        res.end();
    } else {
        socket.send(body);
        res.writeHead(200);
        res.end();
    }
});

// Socket server gets upgraded web socket connections, messages and disconnects
// Each new socket is added to a map of sockets as the lambda will response to any and or all of them.
const socketServer = new Server({ port: 3000 });
socketServer.on('connection', (ws, req) => {
    ws.id = req.headers['sec-websocket-key'];
    console.log(`New client connected in emulator! ${ws.id}`);
    // Call the connect lambda
    handlerConnect(connectionEvent(ws.id, "$connect", "CONNECT"));
    socketConnections.set(ws.id, ws);

    // Websocket message from client
    ws.on('message', (data) => {
        // call the socket processing lambda
        console.log(`Client has sent message in emulator! ${ws.id}`); 
        handlerSocket(socketEvent(ws.id, data));
    });

    ws.on('close', () => { 
        // call the disconnect lambda
        handlerDisconnect(connectionEvent(ws.id, "$disconnect", "DISCONNECT"));
        console.log(`Client has disconnected in emulator! ${ws.id}`); 
    });
});

async function getRequestBody(req) {
    let data = ``;
    req.on(`data`, (chunk) => {
        data += chunk;
    });

    return new Promise((resolve) => {
        req.on(`end`, () => {
            resolve(data);
        });
    });
}

// Http server only here to server the html file
// note that this is not something to deploy as there is no
// file validation and it may server files that shold not be if deployed
httpServer = http.createServer(async function (req, res) {
    //__NOT SAFE TO RUN ON CLOUD__ because will serve any file
    let url = req.url;
    if (url === "/" || url === "") {
        url = "/html/index.html"
      }
  
    fs.readFile(__dirname + url, function (err, data) {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.setHeader("Content-Type", `text/html`);
        res.writeHead(200);
        res.end(data);
      });
});

httpsServer.listen(443, () => { console.log(`HTTPS Server listening on port ${443}`) });
httpServer.listen(3001, () => { console.log(`HTTP Server listening on port ${3001}`) });

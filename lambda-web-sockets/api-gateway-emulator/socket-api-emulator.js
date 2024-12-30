const crypto = require('crypto');
const { handler: handlerSocket } = require('../sendmessage');
const { handler: handlerConnect } = require('../connect');
const { handler: handlerDisconnect } = require('../disconnect');
const { socketEvent } = require('./apiEvents/socket');
const { connectionEvent } = require('./apiEvents/connection');
const https = require('https');
const http = require('http');
const fs = require('fs');

const socketConnections = new Map();

// HTTPS - server, this gets the responses from the lambda and converts them into
// client socket responses (the line above allows this to run with local cert)
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
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
        const frame = createWebSocketFrame(body);
        socket.write(frame);
        res.writeHead(200);
        res.end();
    }
});

const socketServer = http.createServer((req, res) => {
    res.writeHead(404);
    res.end();
});

socketServer.on('upgrade', (req, socket, head) => {
    if (req.headers['upgrade'] !== 'websocket') {
        socket.destroy();
        return;
    }

    const key = req.headers['sec-websocket-key'];
    const acceptKey = generateAcceptKey(key);
    
    // Send WebSocket handshake response
    socket.write([
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        '', ''
    ].join('\r\n'));

    // Add connection to the map
    const connectionId = crypto.randomBytes(16).toString('hex');
    socketConnections.set(connectionId, socket);
    console.log(`New client connected: ${connectionId}`);

    handlerConnect(connectionEvent(connectionId, "$connect", "CONNECT"));

    // Handle incoming WebSocket frames
    socket.on('data', (data) => {
        try {
            if (!data || data.length === 0) return; // Ignore empty data
            const message = parseWebSocketMessage(data);
            if (message) {
                console.log(`Received message from ${connectionId}:`, message);
                handlerSocket(socketEvent(connectionId, message));
            } else {
                console.log(`Ignored unrecognized or unwanted data from ${connectionId}`);
            }
        } catch (err) {
            console.error(`Error processing data from ${connectionId}:`, err);
        }
    });

    socket.on('end', () => {
        socketConnections.delete(connectionId);
        console.log(`Client disconnected: ${connectionId}`);
        // Call the disconnect lambda
        handlerDisconnect(connectionEvent(connectionId, "$disconnect", "DISCONNECT"));
    });
    
    socket.on('error', () => {
        socketConnections.delete(connectionId);
        console.log(`Client disconnected: ${connectionId}`);
        // Call the disconnect lambda
        handlerDisconnect(connectionEvent(connectionId, "$disconnect", "DISCONNECT"));
    });
});

// Helper function to generate the accept key for WebSocket handshake
function generateAcceptKey(secWebSocketKey) {
    const sha1 = crypto.createHash('sha1');
    sha1.update(secWebSocketKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
    return sha1.digest('base64');
}

function parseWebSocketMessage(data) {
    if (data.length < 2) {
        return null; // Not enough data for even the header
    }

    const firstByte = data[0];
    const secondByte = data[1];

    const opcode = firstByte & 0x0F; // Extract opcode (lower 4 bits)
    const mask = secondByte & 0x80; // Mask bit
    let length = secondByte & 0x7F;

    if (opcode === 0x8) {
        // Close frame
        console.log("Close frame received, ignoring...");
        return null; // Explicitly ignore close frames
    }

    let offset = 2; // Start offset for the payload

    if (length === 126) {
        if (data.length < 4) return null; // Incomplete frame
        length = data.readUInt16BE(2);
        offset += 2;
    } else if (length === 127) {
        if (data.length < 10) return null; // Incomplete frame
        length = data.readUInt32BE(2);
        offset += 8;
    }

    if (mask) {
        offset += 4; // Skip the masking key
    }

    if (data.length < offset + length) {
        return null; // Incomplete frame
    }

    let messageData = data.slice(offset, offset + length);

    if (mask) {
        const maskKey = data.slice(offset - 4, offset);
        messageData = Buffer.from(
            messageData.map((byte, i) => byte ^ maskKey[i % 4])
        );
    }

    return messageData.toString('utf8'); // Decode the message to a string
}

// Create a WebSocket frame to send a message (simple implementation)
function createWebSocketFrame(message) {
    const messageBuffer = Buffer.from(message, 'utf8');
    const length = messageBuffer.length;
    const frame = Buffer.alloc(2 + length);

    frame[0] = 0x81; // FIN flag + text frame opcode
    frame[1] = length; // Payload length

    messageBuffer.copy(frame, 2);

    return frame;
}

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

// // Http server only here to server the html file
// // note that this is not something to deploy as there is no
// // file validation and it may server files that shold not be if deployed
// httpServer = http.createServer(async function (req, res) {
//     //__NOT SAFE TO RUN ON CLOUD__ because will serve any file
//     let url = req.url;
//     if (url === "/" || url === "") {
//         url = "/html/index.html"
//       }
  
//     fs.readFile(__dirname + url, function (err, data) {
//         if (err) {
//           res.writeHead(404);
//           res.end(JSON.stringify(err));
//           return;
//         }
//         res.setHeader("Content-Type", `text/html`);
//         res.writeHead(200);
//         res.end(data);
//       });
// });

httpsServer.listen(443, () => { console.log(`HTTPS Server listening on port ${443}`) });
socketServer.listen(3000, () => {
    console.log('WebSocket server is running on ws://localhost:3000');
});
// httpServer.listen(3001, () => { console.log(`HTTP Server listening on port ${3001}`) });

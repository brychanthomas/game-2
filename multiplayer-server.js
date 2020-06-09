var WebSocket = require('ws');

const wss = new WebSocket.Server({port:5000});

var id = 0;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('Received '+ message);
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  ws.send('ID: '+id);
  id++;
});

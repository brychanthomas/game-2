var WebSocket = require('ws');

const wss = new WebSocket.Server({port:5000});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('Received '+ message);
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  ws.send('Henlo!');
});

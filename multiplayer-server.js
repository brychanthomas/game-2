var WebSocket = require('ws');

const wss = new WebSocket.Server({port:5000});

var id = 0;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('Received '+message)
    message = JSON.parse(message);
    if (message.id && ((message.x && message.y) || message.animation)) {
      var relayed = JSON.stringify({'id':message.id, 'x':message.x, 'y':message.y, 'animation':message.animation});
      console.log(relayed);
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(relayed);
        }
      });
    }
  });
  ws.send('{"IDAssign":'+id+'}');
  id++;
});

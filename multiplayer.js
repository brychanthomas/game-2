var multiplayerID;

class MultiplayerHandler {
  constructor(player, game) {
    this.serverAddress = prompt("Please enter the server address:", "localhost:5000");
    this.websocket = new WebSocket('ws://'+this.serverAddress);
    this.websocket.onmessage = function(message) {multiplayerHandler.onMessage(message)};
    this.player = player;
    this.game = game;
    this.playerSprites = {};
  }

  sendPosition() {
    var posInfo = {'x':player.x, 'y': player.y, 'id': this.playerID}
    console.log(posInfo);
    this.websocket.send(JSON.stringify(posInfo));
  }

  onMessage(message) {
    console.log(message.data);
    message = JSON.parse(message.data);
    if (message.IDAssign !== undefined) {
      this.playerID = message.IDAssign;
      console.log(this.playerID);
    } else if (message.x && message.y && message.id !== this.playerID) {
      if (!this.playerSprites[message.id]) {
        this.playerSprites[message.id] = this.game.add.sprite('x', 'y', 'assets');
        this.playerSprites[message.id].setScale(3);
      }
      this.playerSprites[message.id].x = message.x;
      this.playerSprites[message.id].y = message.y;
    }
  }
}

class MultiplayerHandler {
  constructor(player, game) {
    this.serverAddress = prompt("Please enter the server address:");
    this.websocket = new WebSocket('ws://'+this.serverAddress);
    this.websocket.onmessage = this.onMessage;
    this.player = player;
    this.game = game;
    this.playerSprites = {};
  }

  sendPosition() {
    var posInfo = {'x':player.x, 'y': player.y, 'id'}
    this.websocket.send(JSON.stringify(posInfo));
  }

  onMessage(message) {
    message = JSON.parse(message);
    if (message.IDAssign) {
      this.playerID = message.IDAssign;
    } else if (message.x && message.y && message.id) {
      if (!this.playerSprites[message.id]) {
        this.playerSprites[message.id] = this.game.add.sprite('x', 'y', 'assets');
      }
      this.playerSprites[message.id].x = message.x;
      this.playerSprites[message.id].y = message.y;
    }
  }

}

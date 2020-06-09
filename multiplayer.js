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
    if (this.playerID) {
      var posInfo = {'x':player.x, 'y': player.y, 'id': this.playerID}
      console.log(posInfo);
      this.websocket.send(JSON.stringify(posInfo));
    }
  }

  sendAnimation() {
    if (this.playerID) {
      var animInfo = {'animation': this.player.currentAnimation, 'id': this.playerID}
      console.log(animInfo);
      this.websocket.send(JSON.stringify(animInfo));
    }
  }

  onMessage(message) {
    message = JSON.parse(message.data);
    if (message.IDAssign !== undefined) {
      this.playerID = message.IDAssign;
      return;
    }
    if (message.id !== this.playerID) {
      if (!this.playerSprites[message.id]) {
        this.playerSprites[message.id] = new MultiplayerPlayer(this.game, 'assets', 0, 0);
        this.playerSprites[message.id].setScale(3);
      }
      if (message.x && message.y) {
        this.playerSprites[message.id].x = message.x;
        this.playerSprites[message.id].y = message.y;
      }
      if (message.animation) {
        this.playerSprites[message.id].playAnimation(message.animation);
      }
    }
  }
}

class MultiplayerPlayer extends Player {
  update (x, y) {
    this.x = x;
    this.y = y;
  }

  playAnimation(animation) {
    this.sprite.anims.play(animation, true);
  }
}

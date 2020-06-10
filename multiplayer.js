var multiplayerID;

class MultiplayerHandler {
  constructor(player, game) {
    this.myname = prompt("Please enter a username:", "xXShadowLordBladeXx");
    this.serverAddress = prompt("Please enter the server address:", "109.149.213.37:5000");
    this.websocket = new WebSocket('ws://'+this.serverAddress);
    this.websocket.onmessage = function(message) {multiplayerHandler.onMessage(message)};
    this.player = player;
    this.game = game;
    this.playerSprites = {};
  }

  sendPosition() {
    if (this.playerID !== undefined) {
      var posInfo = {'x':player.x, 'y': player.y, 'id': this.playerID, 'name': this.myname}
      console.log(posInfo);
      this.websocket.send(JSON.stringify(posInfo));
    }
  }

  sendAnimation() {
    if (this.playerID !== undefined) {
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
      }
      if (message.x && message.y) {
        this.playerSprites[message.id].update(message.x , message.y);
      }
      if (message.animation) {
        this.playerSprites[message.id].playAnimation(message.animation);
      }
      if (message.name) {
        this.playerSprites[message.id].name = message.name;
      }
    }
  }
}

class MultiplayerPlayer extends Player {
  constructor (game, spritesheet, x, y) {
    super(game, spritesheet, x, y);
    this.sprite.destroy();
    this.sprite = game.add.sprite(x, y, spritesheet);
    this.sprite.setScale(3);
    this._initialise_animations();
    this.nametag = game.add.text(this.x, this.y-20, 'name', {fontSize: '15px', fontFamily: 'Arial'});
    this.nametag.setBackgroundColor('white');
    this.nametag.setColor('black');
    this.nametag.setAlpha(0.7); //make the nametag opaque
    this.nametag.originX = 0.5;
  }

  set name(name) {
    this.nametag.text = name;
  }

  update (x, y) {
    this.x = x;
    this.y = y;
  }

  playAnimation(animation) {
    this.sprite.anims.play(animation, true);
  }

  set x(x) {
    this.sprite.x = x;
    this.nametag.x = x;
  }

  set y(y) {
    this.sprite.y = y;
    this.nametag.y = y-45;
  }
}

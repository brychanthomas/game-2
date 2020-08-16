//loads and removes barriers in the game (walls, furniture etc) as
//static sprites
class Barriers {
  constructor(game, barrierArray) {
    this.game = game;
    this.sprites = [];
    this.addBarriers(barrierArray);
  }

  //take a an array of barriers produced by boundary-selector and
  //add barriers to the world accordingly
  addBarriers(barrierArray) {
    for (var b of barrierArray) {
      var vertStr = ''
      for (var vert of b['vertices']) {
        vertStr += Math.round(vert.x) + ' ' + Math.round(vert.y) + ' '
      }
      vertStr = vertStr.slice(0, -1);
      var verts = this.game.matter.verts.fromPath(vertStr);
      var originalMidpoint = this._calcAverage(b['vertices']);
      var body = this.game.matter.bodies.fromVertices(-1000,-1000, verts);
      body.isStatic = true;
      var processedMidpoint = this._calcAverage(body.vertices);
      var newX = originalMidpoint.x - (processedMidpoint.x+1000);
      var newY = originalMidpoint.y - (processedMidpoint.y+1000);
      var newBody = this.game.matter.bodies.fromVertices(newX, newY, verts);
      newBody.isStatic = true;
      var sprite = this.game.matter.add.sprite(newX, newY);
      sprite.setExistingBody(newBody);
      this.sprites.push(sprite);
    }
  }

  //remove all of the barriers that currently exist
  removeBarriers() {
    for (var sprite of this.sprites) {
      sprite.destroy();
    }
    this.bodyIDs = [];
  }

  //calculate the midpoint of a set of vertices
  _calcAverage(vertices) {
    var maxX = Math.max.apply(Math, vertices.map((o) => o.x));
    var minX = Math.min.apply(Math, vertices.map((o) => o.x));
    var maxY = Math.max.apply(Math, vertices.map((o) => o.y));
    var minY = Math.min.apply(Math, vertices.map((o) => o.y));
    return {'x': (maxX+minX)/2, 'y': (maxY+minY)/2};
  }
}

//manages changing the floor and boundaries for the floor the player
//is on as well as allowing them to move up and down via stairs
class FloorManager {
  constructor(boundary_defs, player, inventory, game) {
    this.game = game;
    this.player = player;
    this.floor = 0;
    this.floorImage = this.game.add.image(0, 0, 'floor0').setScale(14);
    this.floorImage.angle = 0;
    this.floorImage.x = this.floorImage.displayWidth/2;
    this.floorImage.y = this.floorImage.displayHeight/2;
    xLimit = this.floorImage.displayWidth;
    yLimit = this.floorImage.displayHeight;
    this.lastFloorChangeTime = 0;
    this.barriers = new Barriers(game, boundary_defs[0]);
    this.boundaryDefinitions = boundary_defs;
    this.inventory = inventory;
    this.droppedItemHandlers = [];
    for (var i=0; i<3; i++) {
      this.droppedItemHandlers.push(new DroppedItemHandler(player, inventory, game));
    }
  }

  //check if player is in stairway and move them up/down if they are
  update() {
    var x = this.player.x;
    var y = this.player.y + 60;
    var upMainStairway = (x > 1670 && x < 1790) && (y > 1280 && y < 1390);
    var downMainStairway = (x > 1680 && x < 1780) && (y > 1400 && y < 1500);
    var upSecondStairway = (x > 3410 && x < 3520) && (y > 1660 && y < 1840);
    var downSecondStairway = (x > 3290 && x < 3400) && (y > 1780 && y < 1850);
    if (upMainStairway || upSecondStairway) {
      this.changeFloor(+1);
    } else if (downMainStairway || downSecondStairway) {
      this.changeFloor(-1);
    }
    this.droppedItemHandlers[this.floor].update();
  }

  //move the player up or down a specific number of floors
  changeFloor(change) {
    var timeSinceLastChange = this.game.time.now - this.lastFloorChangeTime;
    if (this.floor+change >= 0 && this.floor+change <= 2 && timeSinceLastChange > 1500) {
      this.floor += change;
      this.lastFloorChangeTime = this.game.time.now;
      this.player.disableMovement = true;

      this.game.cameras.main.fadeOut(200, 0, 0, 0);
      this.game.cameras.main.once('camerafadeoutcomplete', function (camera) {

        if (this.player.x < 2750) {
          this.player.x = 1540;
          this.player.y = 1540;
          this.player.direction = 'down';
        } else {
          this.player.x = 3150;
          this.player.y = 1730;
          this.player.direction = 'left';
        }

        this.loadFloor();

        camera.fadeIn(1000, 0, 0, 0);
        this.game.cameras.main.once('camerafadeincomplete', function (camera) {
          this.player.disableMovement = false;
        }, this);
    }, this);

  }

  }

  //load the current floor by replacing the barriers, setting the correct
  //floor texture and making the correct dropped items visible
  loadFloor() {
    this.barriers.removeBarriers();
    this.barriers.addBarriers(this.boundaryDefinitions[this.floor]);
    this.floorImage.setTexture('floor'+this.floor);
    this.droppedItemHandlers.forEach((handler) => {handler.itemsVisible = false});
    this.droppedItemHandlers[this.floor].itemsVisible = true;
  }

  addDroppedItem(item, x, y, floor) {
    this.droppedItemHandlers[floor].add(x, y, item);
    //this.droppedItemHandlers.forEach((handler) => {handler.itemsVisible = false});
    //this.droppedItemHandlers[this.floor].itemsVisible = true;
  }

}

var config = {
  type: Phaser.WebGL,
  width: 1000,
  height: 600,
  pixelArt: true,
  physics: {
    default: 'matter',
    matter: {
      debug: false,
      gravity: {x:0, y:0}
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

var player;
var inventory;
var wasdKeys;
var droppedHandler;
var floorManager;


function preload () {

  this.load.image('floor0', 'assets/floor0.png');
  this.load.image('floor1', 'assets/floor1.png');
  this.load.image('floor2', 'assets/missing.png');
  this.load.image('missing', 'assets/missing.png');
  this.load.spritesheet('assets', 'assets/spritesheet_invisible.png?v=2', {frameWidth: 22, frameHeight: 22});
  this.load.image('inventoryBack', 'assets/inventoryBack.png');
  this.load.image('inventoryBox', 'assets/inventoryBox.png');
}

var xLimit, yLimit;

function create () {

  player = new Player(this, 'assets', 1300, 2200);

  wasdKeys = {
    'w': this.input.keyboard.addKey('W'),
    'a': this.input.keyboard.addKey('A'),
    's': this.input.keyboard.addKey('S'),
    'd': this.input.keyboard.addKey('D')
  }
  eKey = this.input.keyboard.addKey('E');

  this.cameras.main.setBounds(0, 0, xLimit, yLimit);
  this.cameras.main.setZoom(1);
  this.cameras.main.centerOn(player.x, player.y);
  this.cameras.main.setBackgroundColor('#a6a6a6');
  this.cameras.main.tint = 0xff0000;

  inventory = new Inventory(4, 6, this);
  floorManager = new FloorManager(boundary_definitions, player, inventory, this);

  //for (let i=0; i<8; i++) {
  //  droppedHandler.add(500+(i*50), 300, ITEMS[i].name);
  //}

  this.input.on('pointerdown', on_click, this);

  this.input.keyboard.on('keydown_C', function (event) {
    this.cameras.main.shake(2000);
  }.bind(this));

  var back = this.add.tileSprite(2000, 2500, 4000, 5000, 'missing');
  back.depth=-1;

}

function update () {
  if (this.input.keyboard.checkDown(eKey, 500)) {
    inventory.toggleVisibility();
  }
  if (!inventory.isVisible()) {
    player.update(wasdKeys);
  } else {
    player.stop();
  }
  this.cameras.main.pan(player.x, player.y, 0);
  inventory.updateInHandImage();
  floorManager.update();
  // if (player.x < 2750) {
  //   this.cameras.main.setBounds(0, 1220, xLimit, 1240);
  // } else {
  //   this.cameras.main.setBounds(2580, 0, xLimit-2580, yLimit);
  // }
}

//on mouse click for inventory management
function on_click(pointer) {
  inventory.mouseClick(pointer.x, pointer.y);
}

/**
 * Class that loads and removes barriers in the game (walls,
 * furniture etc) as physics sprites.
 */
class Barriers {
  /**
   * Create barriers.
   * @param {Phaser.Scene} game - The scene object to add barriers into
   * @param {Array} barrierArray - An array of objects representing the barriers (see barrier-selector)
   * @constructor
  */
  constructor(game, barrierArray) {
    this.game = game;
    this.sprites = [];
    this.addBarriers(barrierArray);
  }

  /**
   * Adds barriers to the scene.
   * @param {Array} barrierArray - An array of objects representing the barriers (see barrier-selector)
   *
  */
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

  /**
   * Remove all currently existing barriers created by this object.
   */
  removeBarriers() {
    for (var sprite of this.sprites) {
      sprite.destroy();
    }
    this.bodyIDs = [];
  }

  /**
   * Calculate the midpoint of a shape.
   * @param {Array} - An array of x and y coordinates representing the object's vertices.
   */
  _calcAverage(vertices) {
    var maxX = Math.max.apply(Math, vertices.map((o) => o.x));
    var minX = Math.min.apply(Math, vertices.map((o) => o.x));
    var maxY = Math.max.apply(Math, vertices.map((o) => o.y));
    var minY = Math.min.apply(Math, vertices.map((o) => o.y));
    return {'x': (maxX+minX)/2, 'y': (maxY+minY)/2};
  }
}


/**
 * Class to create a door that can be opened if a specific
 * item is in the player's inventory.
 */
class Door {

  /**
   * Creates a closed door at a specific location on a specific floor
   *
   * @param  {number}       x         - The x coordinate of the door.
   * @param  {number}       y         - The y coordinate of the door.
   * @param  {number}       floor     - The floor to create the door on.
   * @param  {string}       key       - The name of the item that should open the door.
   * @param  {Inventory}    inventory - The player's inventory, used to check if they have the key item.
   * @param  {Player}       player    - The Player object, used to check if they are near the door.
   * @param  {Phaser.Scene} game      - The Scene to create the door in.
   * @constructor
   */
  constructor(x, y, floor, key, inventory, player, game) {
    this.floor = floor;
    this.x = x;
    this.y = y;
    this.key = key;
    this.inventory = inventory;
    this.game = game;
    this.player = player;
  }


  /**
   * Called every frame to create/destroy the door sprite based on which
   * floor the player is on and open the door if they are close with the
   * correct key item.
   *
   * @param  {type} floor - The floor the player is currently on.
   */
  update(floor) {
    if (this.floor == floor) {
      this._createSprite()
      if (this.inventory.contains(this.key) && this._distanceTo(this.player.x, this.player.y) < 80) {
        this.sprite.setAngle(90);
        this.sprite.y = this.y + this.sprite.displayHeight/2 + 14;
        this.sprite.x = this.x - this.sprite.displayHeight/2;
      } else {
        this.sprite.setAngle(0);
        this.sprite.y = this.y;
        this.sprite.x = this.x
      }
    } else {
      this._destroySprite();
    }
  }


  /**
   * Create the door sprite if it doesn't already exist, called when player is
   * on the same floor.
   */
  _createSprite() {
    if (!this.sprite) {
      this.sprite = this.game.matter.add.sprite(this.x, this.y, 'door');
      this.sprite.setScale(14);
      this.sprite.setStatic(true);
    }
  }


  /**
   * Calculate the distance between the door and a specific x and y
   * coordinate using Pythagoras. Used to check if the player is
   * nearby.
   *
   * @param  {number} x - The x coordinate to calculate the distance to.
   * @param  {number} y - The x coordinate to calculate the distance to.
   * @return {number}     The distance between the door and the coordinates.
   */
  _distanceTo(x, y) {
    return Math.sqrt((x - this.x)**2 + (y - this.y)**2);
  }


  /**
   * Destroy the door sprite if it exists. Called when the player is
   * on a different floor to the door.
   */
  _destroySprite() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}

var config = {
  type: Phaser.WebGL,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1000,
    height: 600,
    parent: 'phaser-div',
  },
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
var gameEnded = false;

function preload () {

  this.load.image('floor0', 'assets/floor0.png');
  this.load.image('floor1', 'assets/floor1.png');
  this.load.image('floor2', 'assets/floor2.png');
  this.load.image('floor3', 'assets/floor3.png?v=2');
  this.load.image('missing', 'assets/missing.png');
  this.load.spritesheet('assets', 'assets/spritesheet-2.png', {frameWidth: 22, frameHeight: 22});
  this.load.image('inventoryBack', 'assets/inventoryBack.png');
  this.load.image('inventoryBox', 'assets/inventoryBox.png');
  this.load.image('door', 'assets/door.png');
}

var xLimit, yLimit;

var dtDoor;

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
  this.cameras.main.setBackgroundColor('#d2d1cd');
  this.cameras.main.tint = 0xff0000;

  inventory = new Inventory(4, 6, this);
  floorManager = new FloorManager(boundary_definitions, player, inventory, this);
  floorManager.addDroppedItem("Father Wayne's key", 1500, 2200, 1);


  floorManager.addDroppedItem('Bin Lid', 3390, 2150, 1); //Kitchen
  floorManager.addDroppedItem('Flute', 590, 2340, 1); //Reception
  floorManager.addDroppedItem('Security Camera', 1960, 1540, 3); //Locker room
  floorManager.addDroppedItem('Record Player', 330, 2150, 2); //Mrs. Macmullan's room
  floorManager.addDroppedItem('Battery', 2630, 2200, 1); //Mr. Ivins' room
  floorManager.addDroppedItem('Wires', 2930, 4630, 2); //Mrs. Dinsmore's room
  floorManager.addDroppedItem('TV', 3390, 2360, 2); //Staff room
  floorManager.addDroppedItem('Calculator', 2860, 1505, 3); //Mr. George's office

  floorManager.addDroppedItem('Radio Transmitter', 1400, 2000, 1);

  this.input.on('pointerdown', on_click, this);

  this.input.keyboard.on('keydown_C', function (event) {
    this.cameras.main.shake(2000);
  }.bind(this));

  dtDoor = new Door(1442, 1757, 0, "Father Wayne's key", inventory, player, this);

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
  if (this.time.now - floorManager.lastFloorChangeTime > 300) {
    dtDoor.update(floorManager.floor);
  }

  if (inventory.contains('Radio Transmitter') && !gameEnded) {
    end_game(this);
  }
}

//on mouse click for inventory management
function on_click(pointer) {
  inventory.mouseClick(pointer.x, pointer.y);
}

//fades out the game when radio transmitter is created
function end_game(scene) {
  gameEnded = true;
  scene.time.addEvent({
    delay: 3000,
    loop: false,
    callback: function() {this.cameras.main.fadeOut(4000, 255, 255, 255)},
    callbackScope: scene
  });
  scene.cameras.main.once('camerafadeoutcomplete', function (camera) {
    //camera.fadeIn(6000, 255, 255, 255);
  }, scene);
}

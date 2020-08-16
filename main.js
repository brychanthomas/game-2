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
    console.log(game)
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

  for (let i=0; i<8; i++) {
    floorManager.addDroppedItem(ITEMS[i].name, 100+(i*100), 1750, 0);
  }

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

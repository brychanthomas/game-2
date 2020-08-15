class Barriers {
  constructor(game, barrierArray) {
    this.game = game;
    this.sprites = [];
    this.add_barriers(barrierArray);
  }

  add_barriers(barrierArray) {
    for (var b of barrierArray) {
      var vertStr = ''
      for (var vert of b['vertices']) {
        vertStr += Math.round(vert.x) + ' ' + Math.round(vert.y) + ' '
      }
      vertStr = vertStr.slice(0, -1);
      var verts = this.game.matter.verts.fromPath(vertStr);
      var originalMidpoint = this._calc_average(b['vertices']);
      var body = this.game.matter.bodies.fromVertices(-1000,-1000, verts);
      body.isStatic = true;
      var processedMidpoint = this._calc_average(body.vertices);
      var newX = originalMidpoint.x - (processedMidpoint.x+1000);
      var newY = originalMidpoint.y - (processedMidpoint.y+1000);
      var newBody = this.game.matter.bodies.fromVertices(newX, newY, verts);
      newBody.isStatic = true;
      var sprite = this.game.matter.add.sprite(newX, newY);
      sprite.setExistingBody(newBody);
      console.log(sprite);
      this.sprites.push(sprite);
    }
    console.log(this.game);
    //console.log(this.game.matter.world);
  }

  remove_barriers() {
    for (var sprite of this.sprites) {
      sprite.destroy();
    }
    this.bodyIDs = [];
  }

  //this is where the problem lies - I am calculating the midpoint
  //by averaging x and y for all vertices. However, this technique only
  //works for regular shapes, and these shapes ain't regular mate.
  //perhaps finding the max and min ys and xs and then averaging them will work?
  //good luck, you're gonna need it.
  _calc_average(vertices) {
    var maxX = Math.max.apply(Math, vertices.map((o) => o.x));
    var minX = Math.min.apply(Math, vertices.map((o) => o.x));
    var maxY = Math.max.apply(Math, vertices.map((o) => o.y));
    var minY = Math.min.apply(Math, vertices.map((o) => o.y));
    return {'x': (maxX+minX)/2, 'y': (maxY+minY)/2};
  }
}

var config = {
  type: Phaser.CANVAS,
  width: 1000,
  height: 600,
  pixelArt: true,
  physics: {
    default: 'matter',
    matter: {
      debug: true,
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
var barriers;


function preload () {

  this.load.image('floor', 'assets/ground_floor_school_house.png');
  this.load.image('obstacle','assets/obstacle.png');
  this.load.spritesheet('assets', 'assets/spritesheet_invisible.png?v=2', {frameWidth: 22, frameHeight: 22});
  this.load.image('inventoryBack', 'assets/inventoryBack.png');
  this.load.image('inventoryBox', 'assets/inventoryBox.png');
}

var xLimit, yLimit;

function create () {

  var floor = this.add.image(0, 0, 'floor').setScale(14);
  floor.angle = 0;
  floor.x = floor.displayWidth/2;
  floor.y = floor.displayHeight/2;
  xLimit = floor.displayWidth;
  yLimit = floor.displayHeight;

  player = new Player(this, 'assets', 600, 2000);

  this.matter.add.image(300, 200, 'obstacle').setStatic(true);

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

  inventory = new Inventory(4, 6, this);
  droppedHandler = new DroppedItemHandler(player, inventory, this);
  //for (let i=0; i<8; i++) {
  //  droppedHandler.add(500+(i*50), 300, ITEMS[i].name);
  //}

  this.input.on('pointerdown', on_click, this);

  barriers = new Barriers(this, floor0_boundaries);

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
  droppedHandler.update();
  // if (player.x < 2750) {
  //   this.cameras.main.setBounds(0, 1220, xLimit, 1240);
  // } else {
  //   this.cameras.main.setBounds(2580, 0, xLimit-2580, yLimit);
  // }
  //this.cameras.main.shake(1000);
}

//on mouse click for inventory management
function on_click(pointer) {
  inventory.mouseClick(pointer.x, pointer.y);
}

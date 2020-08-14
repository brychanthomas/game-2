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

function preload () {

  this.load.image('floor', 'assets/ground_floor_school_house.png');
  this.load.image('obstacle','assets/obstacle.png');
  this.load.spritesheet('assets', 'assets/spritesheet_invisible.png?v=2', {frameWidth: 22, frameHeight: 22});
  this.load.image('inventoryBack', 'assets/inventoryBack.png');
  this.load.image('inventoryBox', 'assets/inventoryBox.png');
}

function create () {

  var floor = this.add.image(1200, 900, 'floor').setScale(14);
  floor.angle = 0;
  floor.x = floor.displayWidth/2;
  floor.y = floor.displayHeight/2;

  player = new Player(this, 'assets', 300, 300);

  this.matter.add.image(300, 200, 'obstacle').setStatic(true);

  wasdKeys = {
    'w': this.input.keyboard.addKey('W'),
    'a': this.input.keyboard.addKey('A'),
    's': this.input.keyboard.addKey('S'),
    'd': this.input.keyboard.addKey('D')
  }
  eKey = this.input.keyboard.addKey('E');

  this.cameras.main.setBounds(0, 0, 2400, 1800);
  this.cameras.main.setZoom(1);
  this.cameras.main.centerOn(player.x, player.y);
  inventory = new Inventory(4, 6, this);

  droppedHandler = new DroppedItemHandler(player, inventory, this);
  for (let i=0; i<8; i++) {
    droppedHandler.add(500+(i*50), 300, ITEMS[i].name);
  }

  this.input.on('pointerdown', on_click, this);

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
}

//on mouse click for inventory management
function on_click(pointer) {
  inventory.mouseClick(pointer.x, pointer.y);
}

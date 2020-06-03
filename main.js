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

class Player {
  constructor (game, spritesheet, x, y) {
    this.sprite = game.matter.add.sprite(x, y, spritesheet);
    this.sprite.setScale(3);
    this.game = game;
    this._initialise_animations();
  }

  //create all of the animations for the player
  _initialise_animations() {
    this.game.anims.create({
        key: 'down',
        frames: game.anims.generateFrameNumbers('assets', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
    });
    this.game.anims.create({
        key: 'downStop',
        frames: [ { key: 'assets', frame: 0 } ],
        frameRate: 8
    });
    this.game.anims.create({
      key: 'right',
      frames: game.anims.generateFrameNumbers('assets', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1
    });
    this.game.anims.create({
        key: 'rightStop',
        frames: [ { key: 'assets', frame: 4 } ],
        frameRate: 8
    });
    this.game.anims.create({
      key: 'up',
      frames: game.anims.generateFrameNumbers('assets', { start: 9, end: 12 }),
      frameRate: 8,
      repeat: -1
    });
    this.game.anims.create({
        key: 'upStop',
        frames: [ { key: 'assets', frame: 9 } ],
        frameRate: 8
    });
    this.game.anims.create({
      key: 'left',
      frames: game.anims.generateFrameNumbers('assets', { start: 13, end: 16 }),
      frameRate: 8,
      repeat: -1
    });
    this.game.anims.create({
        key: 'leftStop',
        frames: [ { key: 'assets', frame: 13 } ],
        frameRate: 8
    });
  }

  //set the player sprite's x and y velocity
  setVelocity(x, y) {
    this.sprite.setVelocityX(x);
    this.sprite.setVelocityY(y);
  }

  //change the size of the player's bounding box depending on which direction
  //they are facing
  change_bounding_box(direction) {
    if (direction === 'side') {
      this.sprite.body.vertices[0].x = this.sprite.x - 12;
      this.sprite.body.vertices[0].y = this.sprite.y - 25;
      this.sprite.body.vertices[1].x = this.sprite.x + 12;
      this.sprite.body.vertices[1].y = this.sprite.y - 25;
      this.sprite.body.vertices[2].x = this.sprite.x + 12;
      this.sprite.body.vertices[2].y = this.sprite.y + 30;
      this.sprite.body.vertices[3].x = this.sprite.x - 12;
      this.sprite.body.vertices[3].y = this.sprite.y + 30;
    } else {
      this.sprite.body.vertices[0].x = this.sprite.x - 15;
      this.sprite.body.vertices[0].y = this.sprite.y - 24;
      this.sprite.body.vertices[1].x = this.sprite.x + 18;
      this.sprite.body.vertices[1].y = this.sprite.y - 24;
      this.sprite.body.vertices[2].x = this.sprite.x + 18;
      this.sprite.body.vertices[2].y = this.sprite.y + 30;
      this.sprite.body.vertices[3].x = this.sprite.x - 14;
      this.sprite.body.vertices[3].y = this.sprite.y + 30;
    }
  }

  //move and set animations
  update(cursors) {
    if (cursors.a.isDown && this.x > 0) {
      this.setVelocity(-3, 0);
      this.sprite.anims.play('left', true);
      this.change_bounding_box('side');
    }
    else if (cursors.d.isDown && this.x < 2190) {
      this.setVelocity(3, 0);
      this.sprite.anims.play('right', true);
      this.change_bounding_box('side');
    }
    else {
      if (cursors.w.isDown && this.y > 0){
        this.setVelocity(0, -3);
        this.sprite.anims.play('up', true);
        this.change_bounding_box('top');
      }
      else if (cursors.s.isDown && this.y < 1460) {
        this.setVelocity(0, 3);
        this.sprite.anims.play('down', true);
        this.change_bounding_box('top');
      }
      else {
        this.stop();
      }
    }
  }

  //stop animations and movement
  stop() {
    if(player.sprite.body.velocity.x === 0 && player.sprite.body.velocity.y === 0 && player.sprite.anims.currentAnim !== null) {
      if (player.sprite.anims.currentAnim.key.slice(-4) !== 'Stop') {
        player.sprite.anims.play(player.sprite.anims.currentAnim.key+'Stop', true);
      }
    }
    this.setVelocity(0,0);
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }
}
var player;
var inventory;
var wasdKeys;
var obstacles;

function preload () {

  this.load.image('floor', 'assets/floor.png');
  this.load.image('obstacle','assets/obstacle.png');
  this.load.spritesheet('assets', 'assets/spritesheet2.png', { frameWidth: 22, frameHeight: 22 });
  this.load.image('inventoryBack', 'assets/inventoryBack.png');
  this.load.image('inventoryBox', 'assets/inventoryBox.png');
}

function create () {

  this.add.image(1095, 730, 'floor').setScale(2);

  player = new Player(this, 'assets', 300, 300);

  this.matter.add.image(300, 200, 'obstacle').setStatic(true);

  wasdKeys = {
    'w': this.input.keyboard.addKey('W'),
    'a': this.input.keyboard.addKey('A'),
    's': this.input.keyboard.addKey('S'),
    'd': this.input.keyboard.addKey('D')
  }
  eKey = this.input.keyboard.addKey('E');

  this.cameras.main.setBounds(0, 0, 2190, 1460);
  this.cameras.main.setZoom(1);
  this.cameras.main.centerOn(player.x,player.y);
  inventory = new Inventory(4, 6, this);
  inventory.slots[0].contents = items[0];
  inventory.slots[1].contents = items[1];

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
  this.cameras.main.pan(player.x, player.y, 0, 'Sine.easeInOut');
  player.sprite.setAngle(0);
  inventory.updateInHandImage();
}

//on mouse click for inventory management
function on_click(pointer) {
  inventory.mouseClick(pointer.x, pointer.y);
}

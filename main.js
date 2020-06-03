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
      this.sprite.body.vertices[1].x = this.sprite.x + 15;
      this.sprite.body.vertices[1].y = this.sprite.y - 24;
      this.sprite.body.vertices[2].x = this.sprite.x + 15;
      this.sprite.body.vertices[2].y = this.sprite.y + 30;
      this.sprite.body.vertices[3].x = this.sprite.x - 14;
      this.sprite.body.vertices[3].y = this.sprite.y + 30;
    }
  }
  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y
  }
}
var player;
var inventory;
var cursors;
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
  //player.body.collideWorldBounds = true;

  this.matter.add.image(300, 200, 'obstacle').setStatic(true);

  cursors = this.input.keyboard.createCursorKeys();
  eKey = this.input.keyboard.addKey('E');

  this.cameras.main.setBounds(0, 0, 2190, 1460);
  this.cameras.main.setZoom(1);
  this.cameras.main.centerOn(player.x,player.y);
  inventory = new Inventory(4, 6, this);
  inventory.slots[0].contents = items[0];

  this.input.on('pointerdown', on_click, this);

}

function update () {
  if (this.input.keyboard.checkDown(eKey, 500)) {
    inventory.toggleVisibility();
  }
  if (!inventory.isVisible()) {
    if (cursors.left.isDown && player.x > 0)
    {
        player.setVelocity(-3, 0);
        player.sprite.anims.play('left', true);
        player.change_bounding_box('side');

    }
    else if (cursors.right.isDown && player.x < 2190)
    {
        player.setVelocity(3, 0);
        player.sprite.anims.play('right', true);
        player.change_bounding_box('side');
    }

    else
    {

      if (cursors.up.isDown && player.y > 0)
      {
          player.setVelocity(0, -3);
          player.sprite.anims.play('up', true);
          player.change_bounding_box('top');
      }
      else if (cursors.down.isDown && player.y < 1460) {
          player.setVelocity(0, 3);
          player.sprite.anims.play('down', true);
          player.change_bounding_box('top');
      }
      else {
          player.setVelocity(0, 0);
        }
    }
  } else {
    player.setVelocity(0, 0);
  }
  if(player.sprite.body.velocity.x === 0 && player.sprite.body.velocity.y === 0 && player.sprite.anims.currentAnim !== null) {
    if (player.sprite.anims.currentAnim.key.slice(-4) !== 'Stop') {
      player.sprite.anims.play(player.sprite.anims.currentAnim.key+'Stop', true)
    }
  }
  this.cameras.main.pan(player.sprite.x, player.sprite.y, 0, 'Sine.easeInOut')
  player.sprite.setAngle(0);
  inventory.updateInHandImage();
}

//on mouse click for inventory management
function on_click(pointer) {
  inventory.mouseClick(pointer.x, pointer.y);
}

//TODO: item held by cursor when moving things in inventory
//TODO: player class

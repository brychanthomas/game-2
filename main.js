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

//---------Code for inventory-----------
class InventorySlot {
  constructor (x, y, image, game) {
    this.baseX = x;
    this.baseY = y;
    this.imageObject = game.add.image(x, y, image);
    this.imageObject.setScale(0.8);
    this.imageObject.visible = false;
    this.contents = null;
  }

  //show/hide slot
  toggleVisibility (camera) {
    this.imageObject.visible = !this.imageObject.visible;
    this.imageObject.x = camera.scrollX + this.baseX;
    this.imageObject.y = camera.scrollY + this.baseY;
  }

  //when mouse clicked pick up and drop off item if it is on this slot
  mouseClick(mouseX, mouseY, inHand) {
    let withinX = mouseX > this.imageObject.x-this.imageObject.displayWidth/2 && mouseX < this.imageObject.x+this.imageObject.displayWidth/2;
    let withinY = mouseY > this.imageObject.y-this.imageObject.displayHeight/2 && mouseX < this.imageObject.y+this.imageObject.displayHeight/2;
    if (withinX && withinY) {
      let temp = this.contents;
      this.contents = inHand;
      inHand = temp;
    }
    return inHand;
  }
}


class Inventory {
  constructor(rows, columns, game) {
    this.imageObject = game.add.image(500, 300, 'inventoryBack');
    this.imageObject.visible = false;
    this.imageObject.setScale(0.8);
    this.baseX = 500;
    this.baseY = 300;
    let leftSide = 500 - (this.imageObject.width/2.5);
    let topSide = 300 - (this.imageObject.height/2.5);
    let xInterval = this.imageObject.width / (1.1*columns+2);
    let yInterval = this.imageObject.height / (1.1*rows+2);
    this.slots = [];
    for (let row = 1; row <= rows; row++) {
      for (let column = 1; column <= columns; column++) {
        let x = leftSide + (xInterval * column);
        let y = topSide + (yInterval * row)
        this.slots.push(new InventorySlot(x, y, 'inventoryBox', game));
      }
    }
  }

  //show/hide when E key is pressed
  toggleVisibility(camera) {
    this.imageObject.visible = !this.imageObject.visible;
    this.imageObject.x = camera.scrollX + this.baseX;
    this.imageObject.y = camera.scrollY + this.baseY;
    for (let i=0; i < this.slots.length; i++) {
      this.slots[i].toggleVisibility(camera);
    }
  }
}
//-------------------------------

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

  initialise_animations();

  player = this.matter.add.sprite(300,300, 'assets');
  player.setScale(4);
  //player.body.collideWorldBounds = true;

  this.matter.add.image(300, 200, 'obstacle').setStatic(true);

  cursors = this.input.keyboard.createCursorKeys();
  eKey = this.input.keyboard.addKey('E');

  this.cameras.main.setBounds(0, 0, 2190, 1460);
  this.cameras.main.setZoom(1);
  this.cameras.main.centerOn(player.x,player.y);
  inventory = new Inventory(4,6, this);

  this.input.on('pointerdown', on_click, this);

}

function update () {
  if (this.input.keyboard.checkDown(eKey, 500)) {
    inventory.toggleVisibility(this.cameras.main);
  }
  if (!inventory.imageObject.visible) {
    if (cursors.left.isDown && player.x > 0)
    {
        player.setVelocityX(-3);
        player.setVelocityY(0);
        player.anims.play('left', true);
        console.log(player);
        change_bounding_box('side');

    }
    else if (cursors.right.isDown && player.x < 2190)
    {
        player.setVelocityX(3);
        player.setVelocityY(0);
        player.anims.play('right', true);
        change_bounding_box('side');
    }

    else
    {
        player.setVelocityX(0);

      if (cursors.up.isDown && player.y > 0)
      {
          player.setVelocityY(-3);
          player.anims.play('up', true);
          change_bounding_box('top');
      }
      else if (cursors.down.isDown && player.y < 1460) {
          player.setVelocityY(3);
          player.anims.play('down', true);
          change_bounding_box('top');
      }
      else {
          player.setVelocityY(0);
        }
    }
  } else {
    player.setVelocityX(0);
    player.setVelocityY(0);
  }
  if(player.body.velocity.x === 0 && player.body.velocity.y === 0 && player.anims.currentAnim !== null) {
    if (player.anims.currentAnim.key.slice(-4) !== 'Stop') {
      player.anims.play(player.anims.currentAnim.key+'Stop', true)
    }
  }
  //player.anims.currentAnim.key;
  this.cameras.main.pan(player.x, player.y, 0, 'Sine.easeInOut')
  player.setAngle(0);
}

//create all of the animations for the player
function initialise_animations() {
  game.anims.create({
      key: 'down',
      frames: game.anims.generateFrameNumbers('assets', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
  });
  game.anims.create({
      key: 'downStop',
      frames: [ { key: 'assets', frame: 0 } ],
      frameRate: 8
  });
  game.anims.create({
    key: 'right',
    frames: game.anims.generateFrameNumbers('assets', { start: 4, end: 7 }),
    frameRate: 8,
    repeat: -1
  });
  game.anims.create({
      key: 'rightStop',
      frames: [ { key: 'assets', frame: 4 } ],
      frameRate: 8
  });
  game.anims.create({
    key: 'up',
    frames: game.anims.generateFrameNumbers('assets', { start: 9, end: 12 }),
    frameRate: 8,
    repeat: -1
  });
  game.anims.create({
      key: 'upStop',
      frames: [ { key: 'assets', frame: 9 } ],
      frameRate: 8
  });
  game.anims.create({
    key: 'left',
    frames: game.anims.generateFrameNumbers('assets', { start: 13, end: 16 }),
    frameRate: 8,
    repeat: -1
  });
  game.anims.create({
      key: 'leftStop',
      frames: [ { key: 'assets', frame: 13 } ],
      frameRate: 8
  });
}

//on mouse click for inventory management
function on_click(pointer) {
  if (inventory.imageObject.visible) {
    inventory.slots.forEach(function (slot, index) {
      inventory.inHand = slot.click(pointer.x, pointer.y, inventory.inHand);
    });
  }
}

//change the size of the player's bounding box depending on their direction
function change_bounding_box(direction) {
  if (direction === 'side') {
    player.body.vertices[0].x = player.x - 18;
    player.body.vertices[0].y = player.y - 32;
    player.body.vertices[1].x = player.x + 18;
    player.body.vertices[1].y = player.y - 32;
    player.body.vertices[2].x = player.x + 18;
    player.body.vertices[2].y = player.y + 40;
    player.body.vertices[3].x = player.x - 18;
    player.body.vertices[3].y = player.y + 40;
  } else {
    player.body.vertices[0].x = player.x - 20;
    player.body.vertices[0].y = player.y - 32;
    player.body.vertices[1].x = player.x + 23;
    player.body.vertices[1].y = player.y - 32;
    player.body.vertices[2].x = player.x + 23;
    player.body.vertices[2].y = player.y + 40;
    player.body.vertices[3].x = player.x - 20;
    player.body.vertices[3].y = player.y + 40;
  }
}
//object to represent player: handles sprite, movement and animations
class Player {
  constructor (game, spritesheet, x, y) {
    this.sprite = game.matter.add.sprite(x, y, spritesheet);
    this.sprite.setScale(6);
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
      this.sprite.body.vertices[0].x = this.sprite.x - 20;
      this.sprite.body.vertices[0].y = this.sprite.y + 10;
      this.sprite.body.vertices[1].x = this.sprite.x + 24;
      this.sprite.body.vertices[1].y = this.sprite.y + 10;
      this.sprite.body.vertices[2].x = this.sprite.x + 24;
      this.sprite.body.vertices[2].y = this.sprite.y + 60;
      this.sprite.body.vertices[3].x = this.sprite.x - 20;
      this.sprite.body.vertices[3].y = this.sprite.y + 60;
    } else {
      this.sprite.body.vertices[0].x = this.sprite.x - 30;
      this.sprite.body.vertices[0].y = this.sprite.y + 10;
      this.sprite.body.vertices[1].x = this.sprite.x + 36;
      this.sprite.body.vertices[1].y = this.sprite.y + 10;
      this.sprite.body.vertices[2].x = this.sprite.x + 36;
      this.sprite.body.vertices[2].y = this.sprite.y + 60;
      this.sprite.body.vertices[3].x = this.sprite.x - 28;
      this.sprite.body.vertices[3].y = this.sprite.y + 60;
    }
  }

  //move and set animations
  update(cursors) {
    if (cursors.a.isDown && this.x > 0) {
      this.setVelocity(-6, 0);
      this.sprite.anims.play('left', true);
      this.change_bounding_box('side');
    }
    else if (cursors.d.isDown && this.x < xLimit) {
      this.setVelocity(6, 0);
      this.sprite.anims.play('right', true);
      this.change_bounding_box('side');
    }
    else {
      if (cursors.w.isDown && this.y > 0){
        this.setVelocity(0, -6);
        this.sprite.anims.play('up', true);
        this.change_bounding_box('top');
      }
      else if (cursors.s.isDown && this.y < yLimit) {
        this.setVelocity(0, 6);
        this.sprite.anims.play('down', true);
        this.change_bounding_box('top');
      }
      else {
        this.stop();
      }
    }
    this.sprite.setAngle(0);
  }

  //stop animations and movement
  stop() {
    if(player.sprite.anims.currentAnim !== null) {
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

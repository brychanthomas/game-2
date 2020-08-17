/**
 * Object to represent player: handles the sprite, its movement
 * and its animations.
 */
class Player {

  /**
   * Creates a sprite of the player and initialises the animations using
   * _initialise_animations(),
   *
   * @param  {Phaser.Scene} game        - The Scene to add the player to.
   * @param  {string}       spritesheet - The name of the loaded spritesheet.
   * @param  {number}       x           - The initial x position of the player.
   * @param  {number}       y           - The initial y position of the player.
   * @constructor
   */
  constructor (game, spritesheet, x, y) {
    this.sprite = game.matter.add.sprite(x, y, spritesheet);
    this.sprite.setScale(6);
    this.sprite.depth=1;
    this.game = game;
    this._initialise_animations();
    this.disableMovement = false;
  }


  /**
   * Adds all of the animations needed by the player to the game.
   */
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

  /**
   * Sets the player's velocity.
   *
   * @param  {number} x - The x velocity.
   * @param  {number} y - The y velocity.
   */
  setVelocity(x, y) {
    this.sprite.setVelocityX(x);
    this.sprite.setVelocityY(y);
  }

  //change the size of the player's bounding box depending on which direction
  //they are facing

  /**
   * Changes the size of the bounding box around the player based
   * on which direction they are facing.
   *
   * @param  {string} direction - The name of the direction ('side' or 'top')
   */
  change_bounding_box(direction) {
    if (direction === 'side') {
      this.sprite.body.vertices[0].x = this.sprite.x - 20;
      this.sprite.body.vertices[0].y = this.sprite.y + 25;
      this.sprite.body.vertices[1].x = this.sprite.x + 24;
      this.sprite.body.vertices[1].y = this.sprite.y + 25;
      this.sprite.body.vertices[2].x = this.sprite.x + 24;
      this.sprite.body.vertices[2].y = this.sprite.y + 60;
      this.sprite.body.vertices[3].x = this.sprite.x - 20;
      this.sprite.body.vertices[3].y = this.sprite.y + 60;
    } else {
      this.sprite.body.vertices[0].x = this.sprite.x - 30;
      this.sprite.body.vertices[0].y = this.sprite.y + 25;
      this.sprite.body.vertices[1].x = this.sprite.x + 36;
      this.sprite.body.vertices[1].y = this.sprite.y + 25;
      this.sprite.body.vertices[2].x = this.sprite.x + 36;
      this.sprite.body.vertices[2].y = this.sprite.y + 60;
      this.sprite.body.vertices[3].x = this.sprite.x - 28;
      this.sprite.body.vertices[3].y = this.sprite.y + 60;
    }
  }

  //move and set animations

  /**
   * Updates the velocity, animations and bounding box of the
   * player based on which keys are being pressed. If the
   * 'disableMovement' property is true the player does
   * not move and the stop() method is called instead.
   *
   * @param  {object} cursors - An object with properties 'w', 'a',
   * 's' and 'd', each referring to Phaser.Key objects.
   */
  update(cursors) {
    console.log(cursors);
    if (!this.disableMovement) {
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
    } else {
      this.stop();
    }
    this.sprite.setAngle(0);
  }

  //stop animations and movement

  /**
   * Stops the current animation with the player facing in the
   * correct direction and sets the player's x and y velocity to 0.
   *
   */
  stop() {
    if(player.sprite.anims.currentAnim !== null) {
      if (player.sprite.anims.currentAnim.key.slice(-4) !== 'Stop') {
        player.sprite.anims.play(player.sprite.anims.currentAnim.key+'Stop', true);
      }
    }
    this.setVelocity(0,0);
  }


  /**
   * get x - Gets the player's x coordinate
   *
   * @return {number} - The x coordinate.
   */
  get x() {
    return this.sprite.x;
  }

  /**
   * get x - Gets the player's y coordinate
   *
   * @return {number} - The y coordinate.
   */
  get y() {
    return this.sprite.y;
  }


  /**
   * Sets the player's x coordinate.
   *
   * @param  {number} x - The new x coordinate.
   */
  set x(x) {
    this.sprite.x = x;
  }

  /**
   * Sets the player's y coordinate.
   *
   * @param  {number} y - The new y coordinate.
   */
  set y(y) {
    this.sprite.y = y;
  }


  /**
   * Stop the current animation and set the player to face a specific
   * direction.
   *
   * @param  {string} dir - The direction to face, one of 'up', 'down',
   * 'left' and 'right'.
   */
  set direction(dir) {
    if (['up', 'down', 'left', 'right'].indexOf(dir) !== -1) {
      player.sprite.anims.play(dir+'Stop', true);
    }
  }

}

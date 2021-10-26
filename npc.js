class Npc {
  /**
   * Create Npc object
   * @param {String}       name     - name of NPC
   * @param {String[]}     dialogue - list of catchphrases
   * @param {number}       x        - x position of NPC
   * @param {number}       y        - y position of NPC
   * @param {number}       floor    - floor NPC is on
   * @param {object}       frames   - object with start and end keys
   * @param {Phaser.Scene} scene    - scene object to show NPC in
   */
  constructor(name, dialogue, x, y, floor, frames, scene) {
    this.name = name;
    this.dialogue = dialogue;
    this._createAnimation(frames, scene);
    this.sprite = scene.add.sprite(x, y, 'assets');
    this.sprite.setScale(6)
    this.sprite.anims.play(this.name, true);
    this._floor = floor;
    this.visible = true;
  }

  _createAnimation(frames, scene) {
    scene.anims.create({
        key: this.name,
        frames: game.anims.generateFrameNumbers('assets', frames),
        frameRate: 4,
        repeat: -1
    });
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  get floor() {
    return this.floor;
  }

  set visible(visible) {
    this.sprite.visible = visible;
  }
}

class NpcManager {

}

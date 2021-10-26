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
    this.text = scene.add.text(this.x, this.y-90, '', {fontSize: '15px', fontFamily: 'Arial'});
    this.text.setColor('black');
    this.text.setOrigin(0.5)
    this.text.depth = 5;
    this.text.visible = false;
  }

  _createAnimation(frames, scene) {
    scene.anims.create({
        key: this.name,
        frames: game.anims.generateFrameNumbers('assets', frames),
        frameRate: 4,
        repeat: -1
    });
  }

  distanceTo(x, y) {
    return Math.sqrt((x-this.x)**2, (y-this.y)**2);
  }

  talk() {
    let quote = this.dialogue[Math.floor(Math.random()*this.dialogue.length)];
    this.text.text = quote;
    this.text.visible = true;
    console.log(quote);
    setTimeout(function(){this.visible = false;console.log("a");}.bind(this.text), 3000);
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  get floor() {
    return this._floor;
  }

  set visible(visible) {
    this.sprite.visible = visible;
  }
}

class NpcManager {
  constructor(scene) {
    this.npcs = [
      new Npc("Mr. Ivins", [
        "I'll give you a clue: it starts with E and ends with nergy",
        "Come on Aidan, what's wrong? These are the best days of your life! Happy! Happy! Brilliant!"
      ], 1300, 2100, 1, {start:37, end:38}, scene)
    ]
    this.scene = scene;
  }

  update(floor) {
    this.npcs.forEach((npc) => {
      if (npc.floor != floor) {
        npc.visible = false;
      } else {
        npc.visible = true;
      }
    });
  }

  click(x, y) {
    x += this.scene.cameras.main.scrollX;
    y += this.scene.cameras.main.scrollY;
    this.npcs.forEach((npc) => {
      if (npc.distanceTo(x, y) < 30) {
        npc.talk();
      }
    });
  }
}

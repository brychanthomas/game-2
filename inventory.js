//individual slots within the inventory window
class InventorySlot {
  constructor (x, y, image, game) {
    this.baseX = x;
    this.baseY = y;
    this.imageObject = game.add.image(x, y, image);
    this.imageObject.setScale(0.8);
    this.imageObject.visible = false;
    this.contentsSprite = game.add.sprite(this.imageObject.x, this.imageObject.y, 'assets');
    this.contentsSprite.setScale(3);
    this.contentsSprite.visible = false;
    this.contents = null;
    this.game = game;
  }

  //show/hide slot
  toggleVisibility () {
    this.imageObject.visible = !this.imageObject.visible;
    this.imageObject.x = this.game.cameras.main.scrollX + this.baseX;
    this.imageObject.y = this.game.cameras.main.scrollY + this.baseY;
    this._toggleVisibilityOfContents(game);

  }

  //show/hide image of contents of inventory slot
  _toggleVisibilityOfContents() {
    if (this.contents !== null && this.contents !== undefined) {
      //I'm not sure why I have to do this to change the frame but it works
      this.contentsSprite.frame = this.contentsSprite.frame.texture.frames[this.contents.frameNumber];
      this.contentsSprite.visible = !this.contentsSprite.visible;
      this.contentsSprite.x = this.game.cameras.main.scrollX + this.baseX;
      this.contentsSprite.y = this.game.cameras.main.scrollY + this.baseY;
    } else {
      this.contentsSprite.visible = false;
    }
  }

  //when mouse clicked pick up and drop off item if it is on this slot
  mouseClick(mouseX, mouseY, inHand) {
    let withinX = mouseX > this.imageObject.x-this.imageObject.displayWidth/2 && mouseX < this.imageObject.x+this.imageObject.displayWidth/2;
    let withinY = mouseY > this.imageObject.y-this.imageObject.displayHeight/2 && mouseY < this.imageObject.y+(this.imageObject.displayHeight/2);
    if (withinX && withinY) {
      console.log(this.contents);
      let temp = this.contents;
      this.contents = inHand;
      inHand = temp;
      this._toggleVisibilityOfContents();
    }
    return inHand; //return
  }
}

//the inventory window
class Inventory {
  #imageObject; //private attribute storing Phaser image object

  constructor(rows, columns, game) {
    this.#imageObject = game.add.image(500, 300, 'inventoryBack');
    this.#imageObject.visible = false;
    this.#imageObject.setScale(0.8);
    this.game = game;
    this.baseX = 500;
    this.baseY = 300;
    let leftSide = 500 - (this.#imageObject.width/2.5);
    let topSide = 300 - (this.#imageObject.height/2.5);
    let xInterval = this.#imageObject.width / (1.1*columns+2);
    let yInterval = this.#imageObject.height / (1.1*rows+2);
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
  toggleVisibility(game) {
    this.#imageObject.visible = !this.#imageObject.visible;
    this.#imageObject.x = this.game.cameras.main.scrollX + this.baseX;
    this.#imageObject.y = this.game.cameras.main.scrollY + this.baseY;
    for (let i=0; i < this.slots.length; i++) {
      this.slots[i].toggleVisibility(game);
    }
  }

  //return whether or not the inventory window is visible
  isVisible() {
    return this.#imageObject.visible;
  }

  mouseClick(x, y) {
    if (this.isVisible()) {
      for (let i=0; i<this.slots.length; i++) {
        this.inHand = this.slots[i].mouseClick(x, y, this.inHand);
      }
    }
  }
}

//individual item
class Item {
  constructor(name, frameNumber, recipe) {
    this.name = name;
    this.frameNumber = frameNumber;
    this.recipe = recipe;
  }
}

const items = [
  new Item('Battery', 20, 'TBD')
]

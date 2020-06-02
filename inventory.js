//individual slots within the inventory window
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
  toggleVisibility (game) {
    this.imageObject.visible = !this.imageObject.visible;
    this.imageObject.x = game.cameras.main.scrollX + this.baseX;
    this.imageObject.y = game.cameras.main.scrollY + this.baseY;
    this._toggleVisibilityOfContents(game);

  }

  //show/hide (or create) image of contents of inventory slot
  _toggleVisibilityOfContents(game) {
    if (this.contents !== null && this.contentsImage === undefined) {
      this.contentsImage = game.add.image(this.imageObject.x, this.imageObject.y, 'assets', this.contents.frameNumber);
      this.contentsImage.setScale(3);
      this.contentsImage.visible = this.imageObject.visible;
    } else if (this.contents !== null && this.contentsImage !== undefined) {
      this.contentsImage.visible = !this.contentsImage.visible;
      this.contentsImage.x = game.cameras.main.scrollX + this.baseX;
      this.contentsImage.y = game.cameras.main.scrollY + this.baseY;
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
    this.#imageObject.x = game.cameras.main.scrollX + this.baseX;
    this.#imageObject.y = game.cameras.main.scrollY + this.baseY;
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

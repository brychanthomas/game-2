//individual slots within the inventory window
class InventorySlot {
  constructor (x, y, image, game) {
    this.baseX = x;
    this.baseY = y;
    this.imageObject = game.add.image(x, y, image);
    this.imageObject.setScale(0.8);
    this.imageObject.visible = false;
    this.contentsSprite = game.add.sprite(x, y, 'assets');
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
    this._toggleVisibilityOfContents();

  }

  //show/hide image of contents of inventory slot
  _toggleVisibilityOfContents() {
    if (this.contents !== null && this.contents !== undefined) {
      //I'm not sure why I have to do this to change the frame but it works
      this.contentsSprite.frame = this.contentsSprite.frame.texture.frames[this.contents.frameNumber];
      this.contentsSprite.visible = this.imageObject.visible;
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

//special type of inventory slot that allows you to combine two items to make
//a new item
class CraftingSlot extends InventorySlot {
  mouseClick(mouseX, mouseY, inHand) {
    let withinX = mouseX > this.imageObject.x-this.imageObject.displayWidth/2 && mouseX < this.imageObject.x+this.imageObject.displayWidth/2;
    let withinY = mouseY > this.imageObject.y-this.imageObject.displayHeight/2 && mouseY < this.imageObject.y+(this.imageObject.displayHeight/2);
    if (withinX && withinY) {
      console.log(this.contents);
      let temp = this.contents;
      this.contents = inHand;
      inHand = temp;
      if (inHand != null && this.contents != null) {
        inHand = this.craft(inHand);
      }
      this._toggleVisibilityOfContents();
    }
    return inHand;
  }

  //try to combine the item in the player's hand and the content of the slot
  craft(inHand) {
    for (let i=0; i<ITEMS.length; i++) {
      if (ITEMS[i].recipe.includes(inHand.name) && ITEMS[i].recipe.includes(this.contents.name)) {
        inHand = null;
        this.contents = ITEMS[i];
        break;
      }
    }
    return inHand;
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
    let leftSide = 500 - (this.#imageObject.displayWidth/2);
    let topSide = 300 - (this.#imageObject.displayHeight/2);
    let xInterval = this.#imageObject.width / (1.5*columns+2);
    let yInterval = this.#imageObject.height / (1.1*rows+2);
    this.slots = [];
    for (let row = 1; row <= rows; row++) {
      for (let column = 1; column <= columns; column++) {
        let x = leftSide + (xInterval * column);
        let y = topSide + (yInterval * row)
        this.slots.push(new InventorySlot(x, y, 'inventoryBox', game));
      }
    }
    this.slots.push(new CraftingSlot(800, 300, 'inventoryBox', game));
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

    addItem(item) {
      if (typeof item === "string") {
        item = ITEMS.find((itm, ind, arr) => itm.name === item);
        if (typeof item === "string") { return }
      }
      for (let slot of this.slots) {
        if (slot.contents == null) {
          slot.contents = item;
          return;
        }
      }
    }

  //return whether or not the inventory window is visible
  isVisible() {
    return this.#imageObject.visible;
  }

  mouseClick(x, y) {
    if (this.isVisible()) {
      let relX = x + this.game.cameras.main.scrollX;
      let relY = y + this.game.cameras.main.scrollY;
      for (let i=0; i<this.slots.length; i++) {
        this.inHand = this.slots[i].mouseClick(relX, relY, this.inHand);
      }
    }
  }

  //update the visibility, frame number and position of the object being held
  //by the mouse (create the sprite if it doesn't exist)
  updateInHandImage() {
    if (this.inHandSprite === undefined) {
      this.inHandSprite = this.game.add.sprite(0, 0, 'assets');
      this.inHandSprite.setScale(3);
    }
    if (this.inHand !== null && this.inHand !== undefined) {
      this.inHandSprite.frame = this.inHandSprite.frame.texture.frames[this.inHand.frameNumber]
      this.inHandSprite.visible = true;
      this.inHandSprite.x = this.game.input.mousePointer.x + this.game.cameras.main.scrollX;
      this.inHandSprite.y = this.game.input.mousePointer.y  + this.game.cameras.main.scrollY;
    } else {
      this.inHandSprite.visible = false;
    }
  }
}

class DroppedItem {
  constructor(item, x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.spriteObject = game.add.sprite(x, y, 'assets');
    this.spriteObject.frame = this.spriteObject.frame.texture.frames[item.frameNumber];
    this.spriteObject.setScale(2);
  }
  update(playerX, playerY) {
    let y = this.y + 4;
    y -= 8*  Math.sin(this.game.time.now / 200);
    this.spriteObject.y = y;
    let distanceToPlayer = (player.x - this.x)**2 + (player.y - this.y)**2
    distanceToPlayer = Math.sqrt(distanceToPlayer);
    if (distanceToPlayer < 30) {
      return true;
    }
    return false;
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

const ITEMS = [
  new Item('Battery', 20, []),
  new Item('Cables', 23, []),
  new Item('Radio', 18, ['Battery', 'Cables']),
  new Item('Lamp', 22, [])
]

/**
 * Class representing an  individual slot that will be placed within the
 * Inventory window.
 */
class InventorySlot {

  /**
   * Create an image to show the boundary of the slot as well as
   * a sprite to show the content.
   *
   * @param  {number} x - The x coordinate of the slot relative to the camera.
   * @param  {number} y - The y coordinate of the slot relative to the camera.
   * @param  {string} image - The name of the image showing the boundaries.
   * @param  {Phaser.Scene} game - The Scene the slot should be created in.
   * @constructor
   */
  constructor (x, y, image, game) {
    this.baseX = x;
    this.baseY = y;
    this.imageObject = game.add.image(x, y, image);
    this.imageObject.setScale(0.8);
    this.imageObject.visible = false;
    this.imageObject.depth = 4;
    this.contentsSprite = game.add.sprite(x, y, 'assets');
    this.contentsSprite.setScale(3);
    this.contentsSprite.visible = false;
    this.contentsSprite.depth = 4;
    this.contents = null;
    this.game = game;
  }

  /**
   * Toggles whether the slot and its content is visible or not, ensuring
   * it is in the correct position.
   */
  toggleVisibility () {
    this.imageObject.visible = !this.imageObject.visible;
    this.imageObject.x = this.game.cameras.main.scrollX + this.baseX;
    this.imageObject.y = this.game.cameras.main.scrollY + this.baseY;
    this._toggleVisibilityOfContents();

  }

  /**
   * Toggles whether the content of the slot is visible, ensuring it is
   * set to the correct frame of the spritesheet and in the correct position.
   */
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
  //
  /**
   * Called when mouse is clicked. Checks if the mouse has clicked within the
   * boundaries of the slot and, if it has, swaps the item in the player's
   * 'hand' with the item in the slot.
   *
   * @param  {number} mouseX  - The X coordinate the mouse clicked on.
   * @param  {number} mouseY  - The Y coordinate the mouse clicked on.
   * @param  {object} inHand  - Object representation of the item in the player's 'hand'.
   * @return {object}         - Object representation of the item that is now in the
   * player's hand, no matter whether it has been swapped with the item in the slot or not.
   */

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

/**
 * Class representing a crafting slot that is placed in the Inventory window
 * and allows you to combine two items into one.
 * @extends InventorySlot
 */
class CraftingSlot extends InventorySlot {

  /**
   * Called when mouse is clicked. Checks if the mouse has clicked within the
   * boundaries of the slot and, if it has, attempts to craft the item in the
   * slot with the item in the player's 'hand'. If there is nothing in the
   * slot or the player's hand, or if the two items cannot be crafted, it
   * swaps them.
   *
   * @param  {number} mouseX  - The X coordinate the mouse clicked on.
   * @param  {number} mouseY  - The Y coordinate the mouse clicked on.
   * @param  {object} inHand  - Object representation of the item in the player's 'hand'.
   * @return {object}         - Object representation of the item that is now in the
   * player's hand, no matter whether it has been swapped with the item in the slot or
   * crafted or neither.
   */
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

  /**
   * Tries to craft the item in the slot together with the item in the player's
   * hand by checking the recipe of every item in the ITEMS array. If an item is
   * crafted it replaces the item that was originally in the slot.
   *
   * @param  {object} inHand - Object representation of the item in the player's 'hand'.
   * @return {object}        - The item that should now be in the player's hand
   * (or null if something was crafted).
   */

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
/**
 * Class representing the inventory window and the inventory slots it
 * contains.
 */

class Inventory {

  /**
   * Create an inventory window - creates the background box and positions all
   * of the slots. Everything is initially invisible.
   *
   * @param  {number}       rows    - The number of rows of slots in the inventory.
   * @param  {number}       columns - The number of columns of slots in the inventory.
   * @param  {Phaser.Scene} game    - The Scene the window should be created in.
   * @constructor
   */
  constructor(rows, columns, game) {
    this.imageObject = game.add.image(500, 300, 'inventoryBack');
    this.imageObject.visible = false;
    this.imageObject.depth = 3;
    this.imageObject.setScale(0.8);
    this.game = game;
    this.baseX = 500;
    this.baseY = 300;
    let leftSide = 500 - (this.imageObject.displayWidth/2);
    let topSide = 300 - (this.imageObject.displayHeight/2);
    let xInterval = this.imageObject.width / (1.5*columns+2);
    let yInterval = this.imageObject.height / (1.1*rows+2);
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

  /**
   * Toggles whether the inventory window and its slots are visible
   * or not (generally called when 'e' is pressed).
   */
  toggleVisibility() {
    this.imageObject.visible = !this.imageObject.visible;
    this.imageObject.x = this.game.cameras.main.scrollX + this.baseX;
    this.imageObject.y = this.game.cameras.main.scrollY + this.baseY;
    for (let i=0; i < this.slots.length; i++) {
      this.slots[i].toggleVisibility();
    }
  }

  //add an item to an empty inventory slot and return true if there was space

  /**
   * Adds an item to the first empty inventory slot if there are any empty
   * slots.
   *
   * @param  {string} item - The name of the item to be added.
   * @return {boolean}     - true is item was added successfully, false otherwise.
   */
  addItem(item) {
    item = Item.nameToObject(item);
    for (let slot of this.slots) {
      if (slot.contents == null) {
        slot.contents = item;
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the inventory window is visible.
   *
   * @return {boolean}  true if inventory is visible, false otherwise.
   */
  isVisible() {
    return this.imageObject.visible;
  }

  //when mouse clicked

  /**
   * Called when mouse is clicked - checks each slot to see if mouse clicked
   * within its boundary and, if it did, the item in the player's 'hand' is
   * swapped with the item in that slot. The sprite showing the item in the
   * player's grasp is updated the next time updateInHandImage() is called.
   *
   * @param  {number} x - The x coordinate the mouse clicked on.
   * @param  {number} y - The y coordinate the mouse clicked on.
   */
  mouseClick(x, y) {
    if (this.isVisible()) {
      let relX = x + this.game.cameras.main.scrollX;
      let relY = y + this.game.cameras.main.scrollY;
      for (let i=0; i<this.slots.length; i++) {
        this.inHand = this.slots[i].mouseClick(relX, relY, this.inHand);
      }
    }
  }

  /**
   * Update the visibility, spritesheet frame number and position of the
   * sprite representing the object held by the mouse. If the sprite doesn't
   * exist yet it is created.
   */
  updateInHandImage() {
    if (this.inHandSprite === undefined) {
      this.inHandSprite = this.game.add.sprite(0, 0, 'assets');
      this.inHandSprite.setScale(3);
      this.inHandSprite.depth = 5;
      this.inHandText = this.game.add.text(0, 0, 'Henlo', {fontSize: '15px', fontFamily: 'Arial'});
      this.inHandText.setColor('black');
    }
    if (this.inHand !== null && this.inHand !== undefined) {
      this.inHandSprite.frame = this.inHandSprite.frame.texture.frames[this.inHand.frameNumber]
      this.inHandSprite.visible = true;
      this.inHandSprite.x = this.game.input.mousePointer.x + this.game.cameras.main.scrollX;
      this.inHandSprite.y = this.game.input.mousePointer.y  + this.game.cameras.main.scrollY;
      this.inHandText.visible = true;
      this.inHandText.text = this.inHand.name;
      this.inHandText.x = this.game.input.mousePointer.x + this.game.cameras.main.scrollX - 10;
      this.inHandText.y = this.game.input.mousePointer.y  + this.game.cameras.main.scrollY + 30;
    } else {
      this.inHandSprite.visible = false;
      this.inHandText.visible = false;
    }
  }
}



/**
 * A class representing an item on the ground that can be picked up by the
 * player.
 */
class DroppedItem {

  /**
   * Creates an item on the ground.
   *
   * @param  {object}       item - The object representation of the item on the floor.
   * @param  {number}       x    - The x coordinate of the item.
   * @param  {number}       y    - The y coordinate of the item.
   * @param  {Phaser.Scene} game - The Scene the item should be created in.
   * @constructor
   */
  constructor(item, x, y, game) {
    this.x = x;
    this.y = y;
    this.item = item;
    this.game = game;
    this.spriteObject = game.add.sprite(x, y, 'assets');
    this.spriteObject.frame = this.spriteObject.frame.texture.frames[item.frameNumber];
    this.spriteObject.setScale(4);
    this.spriteObject.depth = 0; //send to back, behind other sprites
  }

  /**
   * Moves the item up/down a little each frame using the game clock
   * and the sine function.
   */
  updatePosition() {
    let y = this.y + 4;
    y -= 8 *  Math.sin(this.game.time.now / 200);
    this.spriteObject.y = y;
  }

  //get distance between item and specified x and y

  /**
   * Calculate the distance between the item and the specified coordinates
   * using Pythagoras.
   *
   * @param  {number} x - The x position to calculate the distance to.
   * @param  {number} y - The y position to calculate the distance to.
   * @return {number}     The distance between the item and the specified position.
   */
  getDistanceTo(x, y) {
    let distanceToPlayer = (player.x - this.x)**2 + (player.y - this.y)**2;
    distanceToPlayer = Math.sqrt(distanceToPlayer);
    return distanceToPlayer;
  }

  /**
   * Change whether the item is visible or not.
   *
   * @param  {boolean} visible - Whether the item should be visible or not.
   */
  setVisibility(visible) {
    this.spriteObject.visible = visible;
  }

  //delete sprite of item

  /**
   * Delete the sprite of the item from the game.
   */
  destroy() {
    this.spriteObject.destroy();
  }
}


/**
 * Class to manage all of the dropped items on a floor.
 */
class DroppedItemHandler {

  /**
   * Creates a handler to manage dropped items.
   *
   * @param  {Player}       player    - The Player instance.
   * @param  {Inventory}    inventory - The Inventory instance.
   * @param  {Phaser.Scene} game      - The Scene the items should be added to.
   * @constructor
   */
  constructor(player, inventory, game) {
    this.player = player;
    this.inventory = inventory;
    this.game = game;
    this.items = [];
  }

  /**
   * Add a dropped item.
   *
   * @param  {number} x    - The x position of the item.
   * @param  {number} y    - The x position of the item.
   * @param  {object} item - The object representation of the item.
   */
  add(x, y, item) {
    item = Item.nameToObject(item);
    this.items.push(new DroppedItem(item, x, y, this.game));
  }

  //move items up and down each frame, hide them if the inventory is opened and
  //add them to the inventory if the player is close

  /**
   * Called every frame to move the items up and down, hide them if the
   * inventory is opened and add them to the inventory is the player is
   * close, deleting the DroppedItem instance.
   */
  update() {
    let toDelete = [];
    for (let i=0; i<this.items.length; i++) {
      this.items[i].updatePosition();
      this.items[i].setVisibility(!this.inventory.isVisible() && this._visible);
      if (this.items[i].getDistanceTo(this.player.x, this.player.y) < 60) {
        if (this.inventory.addItem(this.items[i].item)) {
          this.items[i].destroy();
          toDelete.push(i);
        }
      }
    }
    toDelete.sort().reverse();
    for (let index of toDelete) {
      this.items.splice(index, 1);
    }
  }


  /**
   * Sets whether the dropped items should be visible or not (used in
   * FloorManager for changing floors).
   *
   * @param  {boolean} bool - Whether the items should be visible or not.
   */
  set itemsVisible(bool) {
    this.items.forEach((itm) => {itm.setVisibility(bool)});
    this._visible = bool;
  }
}


/**
 * Object that represents a specific item - stores its name, frame number in the
 * spritesheet and its recipe.
 */
class Item {

  /**
   * @static
   * Takes the name of an item and converts it to its object representation or, if
   * it is not a string, returns it as is.
   *
   * @param  {string} name - The name of the item.
   * @return {object}        The object representation of the item.
   */

  static nameToObject(name) {
    if (typeof name === "string") {
      let item = ITEMS.find((itm, ind, arr) => itm.name === name);
      return item;
    }
    return name;
  }


  /**
   *
   *
   * @param  {string}  name       - The name of the item.
   * @param  {number} frameNumber - The frame number of the item in the spritesheet.
   * @param  {Array}  recipe      - An array of the names of other items needed to craft this item.
   * @constructor
   */
  constructor(name, frameNumber, recipe) {
    this.name = name;
    this.frameNumber = frameNumber;
    this.recipe = recipe;
  }
}

const ITEMS = [
  new Item('Bin Lid', 27, []),
  new Item('Flute', 28, []),
  new Item('Security Camera', 25, []),
  new Item('Record Player', 24, []),
  new Item('Battery', 20, []),
  new Item('Wires', 23, []),
  new Item('TV', 22, []),
  new Item('Calculator', 21, []),
  new Item('Dish', 29, ['Bin Lid', 'Flute']),
  new Item('Rotator Thing', 30, ['Security Camera', 'Record Player']),
  new Item('Motor', 32, ['Battery', 'Wires']),
  new Item('Computer', 31, ['TV', 'Calculator']),
  new Item('Satellite Dish', 33, ['Dish', 'Rotator Thing']),
  new Item('Technical Box', 34, ['Motor', 'Computer']),
  new Item('Radio Transmitter', 18, ['Satellite Dish', 'Technical Box']),
  new Item("Father Wayne's key", 36, [])
]

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
    return inHand; //return
  }
}


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
  toggleVisibility(camera) {
    this.#imageObject.visible = !this.#imageObject.visible;
    this.#imageObject.x = camera.scrollX + this.baseX;
    this.#imageObject.y = camera.scrollY + this.baseY;
    for (let i=0; i < this.slots.length; i++) {
      this.slots[i].toggleVisibility(camera);
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
      console.log(this.inHand);
    }
  }
}

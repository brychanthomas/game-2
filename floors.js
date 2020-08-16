/**
 * Class that manages changing the floor image, boundaries and items
 * for the floor the player is on as well as allowing them to move
 * up and down via stairs.
 */
class FloorManager {
  /**
   * Creates floor image, Barriers object and DroppedItemHandlers
   * and sets everything up for floor 0.
   * @param {Array} boundary_defs - Array of arrays of boundary definitions for each floor
   * @param {Player} player - The Player object, needed for coordinates to check if on stairs
   * @param {Inventory} inventory - The Inventory object, needed to create DroppedItemHandlers
   * @param {Phaser.Scene} game - The Scene the player is in.
   * @constructor
   */
  constructor(boundary_defs, player, inventory, game) {
    this.game = game;
    this.player = player;
    this.floor = 0;
    this.floorImage = this.game.add.image(0, 0, 'floor0').setScale(14);
    this.floorImage.angle = 0;
    this.floorImage.x = this.floorImage.displayWidth/2;
    this.floorImage.y = this.floorImage.displayHeight/2;
    xLimit = this.floorImage.displayWidth;
    yLimit = this.floorImage.displayHeight;
    this.lastFloorChangeTime = 0;
    this.barriers = new Barriers(game, boundary_defs[0]);
    this.boundaryDefinitions = boundary_defs;
    this.droppedItemHandlers = [];
    for (var i=0; i<3; i++) {
      this.droppedItemHandlers.push(new DroppedItemHandler(player, inventory, game));
    }
  }

  /**
   * Check if the player is in a stairway and move them up/down if
   * they are.
   */
  update() {
    var x = this.player.x;
    var y = this.player.y + 60;
    var upMainStairway = (x > 1670 && x < 1790) && (y > 1280 && y < 1390);
    var downMainStairway = (x > 1680 && x < 1780) && (y > 1400 && y < 1500);
    var upSecondStairway = (x > 3410 && x < 3520) && (y > 1660 && y < 1840);
    var downSecondStairway = (x > 3290 && x < 3400) && (y > 1780 && y < 1850);
    if (upMainStairway || upSecondStairway) {
      this.changeFloor(+1);
    } else if (downMainStairway || downSecondStairway) {
      this.changeFloor(-1);
    }
    this.droppedItemHandlers[this.floor].update();
  }

  /**
   * Move up or down a specific number of floors.
   * @param {number} change - The number of floors to move (usually 1 or -1).
   */
  changeFloor(change) {
    var timeSinceLastChange = this.game.time.now - this.lastFloorChangeTime;
    if (this.floor+change >= 0 && this.floor+change <= 2 && timeSinceLastChange > 1500) {
      this.floor += change;
      this.lastFloorChangeTime = this.game.time.now;
      this.player.disableMovement = true;

      this.game.cameras.main.fadeOut(200, 0, 0, 0);
      this.game.cameras.main.once('camerafadeoutcomplete', function (camera) {

        if (this.player.x < 2750) {
          this.player.x = 1540;
          this.player.y = 1540;
          this.player.direction = 'down';
        } else {
          this.player.x = 3150;
          this.player.y = 1730;
          this.player.direction = 'left';
        }

        this.loadFloor();

        camera.fadeIn(1000, 0, 0, 0);
        this.game.cameras.main.once('camerafadeincomplete', function (camera) {
          this.player.disableMovement = false;
        }, this);
    }, this);
  }

  }

  /**
   * Load the current floor by replacing the barriers, setting the correct
   * floor texture and making the correct dropped items visible.
   */
  loadFloor() {
    this.barriers.removeBarriers();
    this.barriers.addBarriers(this.boundaryDefinitions[this.floor]);
    this.floorImage.setTexture('floor'+this.floor);
    this.droppedItemHandlers.forEach((handler) => {handler.itemsVisible = false});
    this.droppedItemHandlers[this.floor].itemsVisible = true;
  }

  /**
   * Adds an item to one of the floors.
   * @param {string} item - The name of the item to add.
   * @param {number} x = The x coordinate of the item.
   * @param {number} y = The y coordinate of the item.
   * @param {number} floor = The floor to add the item on.
   */
  addDroppedItem(item, x, y, floor) {
    this.droppedItemHandlers[floor].add(x, y, item);
    this.droppedItemHandlers.forEach((handler) => {handler.itemsVisible = false});
    this.droppedItemHandlers[this.floor].itemsVisible = true;
  }

}

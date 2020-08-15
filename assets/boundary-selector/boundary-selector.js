const SCALE = 14; //scale of image in game
const DIVIDER = 7; //how many times smaller image should appear than game scale

//one boundary region
class Region {
  constructor(x, y, sides) {
    this.vertices = [];
    let r = 20;
    for (let i = 0; i < sides; i++) {
      this.vertices.push({
        'x':(x*DIVIDER) + r * Math.cos(2 * Math.PI * i / sides),
        'y':(y*DIVIDER) + r * Math.sin(2 * Math.PI * i / sides)
      });
    }
  }

  //draw the shape on the canvas
  display() {
    stroke([204, 0, 255, 100]);
    strokeWeight(1);
    fill([255,0,0,70]);
    beginShape();
    for (let i=0; i<this.vertices.length; i++) {
      vertex(this.vertices[i].x/DIVIDER, this.vertices[i].y/DIVIDER);
      circle(this.vertices[i].x/DIVIDER, this.vertices[i].y/DIVIDER, 3);
    }
    vertex(this.vertices[0].x/DIVIDER, this.vertices[0].y/DIVIDER)
    endShape();
  }

  //checks if vertex is close to mouse and moves it if it is, returning true
  //if no vertex close to mouse, returns false
  drag(x, y, maxDist) {
    let closestVertex;
    var minDist = Infinity;
    for (let i=0; i<this.vertices.length; i++) {
      //BROKEN
      let distance = dist(this.vertices[i].x/DIVIDER, this.vertices[i].y/DIVIDER, x, y);
      if (distance < maxDist && distance < minDist) {
        minDist = distance;
        closestVertex = i;
      }
    }
    if (closestVertex !== undefined) {
      this.vertices[closestVertex].x = x*DIVIDER;
      this.vertices[closestVertex].y = y*DIVIDER;
      return true;
    } else {
      return false;
    }
  }
}

var img;
var shapes = [];

function preload() {
  img = loadImage('../floor1.png');
}

var copyButton;
function setup() {
  createCanvas((img.width*(SCALE/DIVIDER))+100, (img.height*(SCALE/DIVIDER)));

  copyButton = createButton('Copy bounds<br>to clipboard');
  copyButton.position((img.width*(SCALE/DIVIDER))+10, 50);
  copyButton.mousePressed(copyJSON);

}

var prevMovedShape = -1;

function draw() {
  noSmooth();
  background(255);
  image(img, 0, 0, img.width*(SCALE/DIVIDER), img.height*(SCALE/DIVIDER));
  smooth();
  shapes.forEach(function(region) {
    region.display();
  });
  if (mouseIsPressed) {
    drag();
  } else {
    prevMovedShape = -1;
  }
}

function keyPressed() {
  //if they pressed a number key other than 0, 1 or 2
  if (['3','4','5','6','7','8','9'].includes(key)) {
    //add a new region with the number of sides
    shapes.push(new Region(mouseX, mouseY, Number(key)));
  }
}

//called when mouse is held down to move shape vertices
function drag() {
  var foundVertex = false;
  if (prevMovedShape > -1) {
    foundVertex = shapes[prevMovedShape].drag(mouseX, mouseY, 15);
  }
  var i = 0;
  while (!foundVertex && i < shapes.length) {
    foundVertex = shapes[i].drag(mouseX, mouseY, 3);
    i++;
  }
  if (i > 0) {
    prevMovedShape = i-1;
  }
  console.log(prevMovedShape)
}

function copyJSON() {

  var el = document.createElement('textarea');
// Set value (string to be copied)
  el.value = JSON.stringify(shapes);
  // Set non-editable to avoid focus and move outside of view
  el.setAttribute('readonly', '');
  el.style = {position: 'absolute', left: '-9999px'};
  document.body.appendChild(el);
  // Select text inside element
  el.select();
  // Copy text to clipboard
  document.execCommand('copy');
  // Remove temporary element
  document.body.removeChild(el);

}

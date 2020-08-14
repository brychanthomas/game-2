//one boundary region
class Region {
  constructor(x, y, sides) {
    this.vertices = [];
    let r = 20;
    for (let i = 0; i < sides; i++) {
      this.vertices.push({
        'x':x + r * Math.cos(2 * Math.PI * i / sides),
        'y':y + r * Math.sin(2 * Math.PI * i / sides)
      });
    }
  }

  //draw the shape on the canvas
  display() {
    stroke([204, 0, 255, 100]);
    strokeWeight(2);
    fill([255,0,0,70]);
    beginShape();
    for (let i=0; i<this.vertices.length; i++) {
      vertex(this.vertices[i].x, this.vertices[i].y);
      circle(this.vertices[i].x, this.vertices[i].y, 8);
    }
    vertex(this.vertices[0].x, this.vertices[0].y)
    endShape();
  }

  //checks if vertex is close to mouse and moves it if it is, returning true
  //if no vertex close to mouse, returns false
  drag(x, y) {
    let minDist = Infinity;
    let closestVertex;
    for (let i=0; i<this.vertices.length; i++) {
      //BROKEN
      let distance = dist(this.vertices[i].x, this.vertices[i].y, x, y);
      if (distance < 5 && distance < minDist) {
        minDist = distance;
        closestVertex = i;
      }
    }
    if (closestVertex !== undefined) {
      this.vertices[closestVertex].x = x;
      this.vertices[closestVertex].y = y;
      return true;
    } else {
      return false;
    }
  }
}

var img;
var shapes = [];

function preload() {
  img = loadImage('../ground_floor_school_house.png');
}

var copyButton;
function setup() {
  createCanvas((img.width*4)+100, (img.height*4));
  pixelDensity(14/4);

  copyButton = createButton('Copy bounds<br>to clipboard');
  copyButton.position((img.width*4)+10, 50);
  copyButton.mousePressed(copyJSON);

}

function draw() {
  background(255);
  image(img, 0, 0, img.width*4, img.height*4);
  shapes.forEach(function(region) {
    region.display();
  });
  if (mouseIsPressed) {
    drag();
  }
}

function keyPressed() {
  console.log(key);
  //if they pressed a number key other than 0, 1 or 2
  if (['3','4','5','6','7','8','9'].includes(key)) {
    //add a new region with the number of sides
    shapes.push(new Region(mouseX, mouseY, Number(key)));
  }
}

//called when mouse is held down to move shape vertices
function drag() {
  var foundVertex = false;
  var i = 0;
  while (!foundVertex && i < shapes.length) {
    foundVertex = shapes[i].drag(mouseX, mouseY);
    i++;
    console.log(i);
  }
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

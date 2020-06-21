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
    stroke([204, 0, 255]);
    strokeWeight(3);
    fill([255,0,0,128]);
    beginShape();
    for (let i=0; i<this.vertices.length; i++) {
      vertex(this.vertices[i].x, this.vertices[i].y);
      circle(this.vertices[i].x, this.vertices[i].y, 15);
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
      if (distance < 15 && distance < minDist) {
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
  img = loadImage('../Perlin.png');
}

function setup() {
  createCanvas(img.width, img.height);

}

function draw() {
  background(0);
  image(img, 0, 0);
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

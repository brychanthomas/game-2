//one boundary region
class Region {
  constructor(x, y, sides) {
    this.vertices = [];
    let r = 20;
    for (let i = 0; i < sides; i++) {
      this.vertices.push(createVector(x + r * Math.cos(2 * Math.PI * i / sides), y + r * Math.sin(2 * Math.PI * i / sides)));
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
      circle(this.vertices[i].x, this.vertices[i].y, 10);
    }
    vertex(this.vertices[0].x, this.vertices[0].y)
    endShape();
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
}

function keyPressed() {
  //if they pressed a number key other than 0, 1 or 2
  if (['3','4','5','6','7','8','9'].includes(key)) {
    //add a new region with the number of sides
    shapes.push(new Region(mouseX, mouseY, Number(key)));
  }
}

let ripples = [];
let clickCount = 0;

let baseR = 200;
let baseG = 120;
let baseB = 255;
let mode = 0;

let Start = true;

let d = 20;
let p = [];
let img;


function preload() {
  img = loadImage("assets/Cover.jpg");
}



function setup() {

  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  img.resize(width, height);
  img.loadPixels();

  p = [];
  for (let x = 0; x < img.width; x += d) {
    for (let y = 0; y < img.height; y += d) {
      let i = (x + y * img.width) * 4;

      let r = img.pixels[i + 0];
      let g = img.pixels[i + 1];
      let b = img.pixels[i + 2];

      p.push(new Particle(x, y, d, color(r, g, b)));
    }
  }
}

// Start Text
function draw() {
  background(0, 30);

  if (Start) {
    background(0);

    push();
    fill(255, 200);
    textAlign(CENTER, CENTER);

    textSize(height * 0.055);
    text("Press SPACE to enter Ripples in Time", width / 2, height / 2);

    textSize(height * 0.026);
    text("Click, hold, drag, & repeat", width / 2, height / 2 + height * 0.05);
    pop();

    // Cover 
    for (let i = 0; i < p.length; i++) {
      if (mouseIsPressed) {
        p[i].update();
      }
      p[i].display();
    }

    return;
  }

  // Ripple

  if (mouseIsPressed) {
    let r = new Ripple(mouseX, mouseY, baseR, baseG, baseB, mode);
    ripples.push(r);

    if (ripples.length > 250) {
      ripples.splice(0, 1);
    }
  }

  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].move();
    if (ripples[i].isOut() == true) {
      ripples.splice(i, 1);
    }
  }

  // pixel trace 
  PixelSparkles();

  for (let i = 0; i < ripples.length; i++) {
    ripples[i].display();
  }
}


// mouse 
function mousePressed() {
  if (Start) {
    return;
  }

  // after ripple
  clickCount++;

  if (clickCount % 3 == 0) {
    baseR = random(0, 255);
    baseG = random(0, 255);
    baseB = random(0, 255);

    mode = mode + 1;
    if (mode > 2) {
      mode = 0;
    }
  }
}

// SPACE transitions from cover → ripples
function keyPressed() {
  if (Start && (key == ' ')) {
    Start = false;
  }
}


// pixal sparkles

function PixelSparkles() {
  if (ripples.length == 0) return;

  loadPixels();

  let sparklesPerRipple = 80;

  let maxHalo = min(width, height) * 0.06;

  for (let i = 0; i < ripples.length; i++) {
    let rp = ripples[i];

    for (let n = 0; n < sparklesPerRipple; n++) {

      let angle = random(TWO_PI);
      let radius = random(0, maxHalo);

      let sx = floor(rp.x + cos(angle) * radius);
      let sy = floor(rp.y + sin(angle) * radius);

      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {

        let index = (sx + sy * width) * 4;
        pixels[index] = pixels[index] * 0.7 + rp.r * 0.3;
        pixels[index + 1] = pixels[index + 1] * 0.7 + rp.g * 0.3;
        pixels[index + 2] = pixels[index + 2] * 0.7 + rp.b * 0.3;
      }
    }
  }

  updatePixels();
}

// Ripples

class Ripple {
  constructor(x, y, r, g, b, m) {
    this.x = x;
    this.y = y;

    this.r = r;
    this.g = g;
    this.b = b;

    this.mode = m;

    this.rings = [];
    this.addRing();

    this.age = 0;
    this.maxAge = 180;
  }

  addRing() {

    let scale = min(width, height) / 800;

    let ring = {
      radius: 0,
      alpha: 200,
      thickness: random(1, 6) * scale,
      growth: 0
    };

    if (this.mode == 0) {
      ring.growth = random(5, 6) * scale;
    } else if (this.mode == 1) {
      ring.growth = random(4, 5) * scale;
    } else if (this.mode == 2) {
      ring.growth = random(6, 8) * scale;
    }

    this.rings.push(ring);
  }

  move() {
    this.age++;

    if (this.age < this.maxAge / 2 &&
      this.age % 100 == 0 &&
      this.rings.length < 12) {
      this.addRing();
    }

    for (let i = this.rings.length - 1; i >= 0; i--) {
      let ring = this.rings[i];

      ring.radius += ring.growth;
      ring.alpha -= 3;

      if (this.mode == 1) {
        this.y += 0.1;
      } else if (this.mode == 2) {
        this.x += sin(frameCount * 0.05) * 0.3;
      }

      if (ring.alpha <= 0 || ring.radius > max(width, height)) {
        this.rings.splice(i, 1);
      }
    }
  }

  display() {
    noFill();

    for (let i = 0; i < this.rings.length; i++) {
      let ring = this.rings[i];

      stroke(this.r, this.g, this.b, ring.alpha);
      strokeWeight(ring.thickness);

      if (this.mode == 0) {
        circle(this.x, this.y, ring.radius * 2);
      } else if (this.mode == 1) {
        rect(this.x, this.y, ring.radius * 2, ring.radius * 2);
      } else if (this.mode == 2) {
        line(this.x - ring.radius, this.y,
          this.x + ring.radius, this.y);
        line(this.x, this.y - ring.radius,
          this.x, this.y + ring.radius);
      }
    }
  }

  isOut() {
    return (this.age > this.maxAge && this.rings.length == 0);
  }
}


// cover

class Particle {
  constructor(x, y, s, c) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.c = c;

    this.accX = 0;
    this.accY = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.away = 0.7;
  }

  display() {
    push();
    translate(this.s / 2, this.s / 2);
    // slightly transparent so text glows through a bit
    fill(red(this.c), green(this.c), blue(this.c), 230);
    noStroke();
    circle(this.x, this.y, this.s);
    pop();
  }

  update() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < 45) {
      this.accX = (mouseX - this.x) * -this.away;
      this.accY = (mouseY - this.y) * -this.away;
      this.speedX += this.accX;
      this.speedY += this.accY;
    }

    this.speedX = this.speedX * 0.9;
    this.speedY = this.speedY * 0.9;

    this.x += this.speedX;
    this.y += this.speedY;
  }
}

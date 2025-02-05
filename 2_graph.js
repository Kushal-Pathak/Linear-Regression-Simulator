class Graph2D {
  constructor(
    x = CENTER_X,
    y = CENTER_Y,
    width = DEFAULT_GRAPH_WIDTH,
    height = DEFAULT_GRAPH_HEIGHT,
    divisions = DEFAULT_DIVISIONS
  ) {
    this.pos = { x, y };
    this.width = width;
    this.height = height;
    this.divs = divisions;
    this.points = [];
    this.sigmaPoints = [];
    this.model = { w: 0, b: 0 };
  }

  draw() {
    push();
    rectMode(CENTER);
    fill(200);
    stroke(0);
    strokeWeight(1);

    // Draw graph outline
    rect(this.pos.x, this.pos.y, this.width, this.height);

    // Move to graph center
    translate(this.pos.x, this.pos.y);
    strokeWeight(2);
    //circle(0, 0, DEFAULT_POINT_RADIUS); // Graph center

    // Draw axes
    stroke(17);
    line(-this.width / 2, 0, this.width / 2, 0); // x-Axis
    line(0, -this.height / 2, 0, this.height / 2); // y-axis

    // Draw grid
    stroke(136);
    const gapX = this.width / (2 * this.divs);
    const gapY = this.height / (2 * this.divs);

    strokeWeight(0.2);
    for (let i = -this.divs; i <= this.divs; i++) {
      line(i * gapX, -this.height / 2, i * gapX, this.height / 2);
      line(-this.width / 2, i * gapY, this.width / 2, i * gapY);
    }
    pop();
  }

  pointWithinBounds(x, y) {
    if (x <= this.divs && x >= -this.divs && y <= this.divs && y >= -this.divs)
      return true;
    else return false;
  }

  mapPoint(x, y) {
    if (this.pointWithinBounds(x, y)) {
      x = map(x, -this.divs, this.divs, -this.width / 2, this.width / 2);
      y = map(y, -this.divs, this.divs, -this.height / 2, this.height / 2);
      return { x, y };
    }
    return null;
  }

  plotPoint(x, y) {
    // Map graph point to actual screen before plotting
    const mapped = this.mapPoint(x, y);
    if (!mapped) return;
    push();
    stroke(0, 0, 255);
    fill(0, 255, 0);
    translate(this.pos.x, this.pos.y);
    circle(mapped.x, -mapped.y, DEFAULT_POINT_RADIUS); // Draw point
    pop();
  }

  plotSigmaPoint(x, y) {
    // Plot pre-mapped point
    circle(x, -y, DEFAULT_POINT_RADIUS);
  }

  plotAllPoints() {
    if (!this.points.length) return;
    for (let point of this.points) {
      this.plotPoint(point.x, point.y);
    }
  }

  plotAllSigmaPoints() {
    // Plot all pre-mapped points
    if (!this.sigmaPoints.length) return;
    push();
    strokeWeight(1);
    stroke(0);
    fill(255, 65, 54);
    translate(this.pos.x, this.pos.y);
    for (let point of this.sigmaPoints) {
      circle(point.x, point.y, DEFAULT_POINT_RADIUS);
    }
    pop();
  }

  preMapPoints() {
    // Pre-map all points
    if (!this.points.length) return;
    this.sigmaPoints = []; // container for pre-mapped points
    for (let point of this.points) {
      const mapped = this.mapPoint(point.x, point.y);
      this.sigmaPoints.push(mapped);
    }
  }

  plotFunction(f, step = 0.01) {
    push();
    stroke(0, 116, 217);
    strokeWeight(1.5);
    noFill();

    let previousValid = false; // Track validity of last point

    translate(this.pos.x, this.pos.y);
    beginShape();
    for (let x = -this.divs; x <= this.divs; x += step) {
      let y = f(x);

      // Ignore invalid points
      if (y > this.divs || y < -this.divs || !isFinite(y) || isNaN(y)) {
        endShape(); // Stop the current curve
        beginShape(); // Start a new curve
        previousValid = false;
        continue;
      }
      const mapped = this.mapPoint(x, y);
      if (mapped) {
        //if (!previousValid) beginShape(); // Start new curve when resuming
        vertex(mapped.x, -mapped.y);
        previousValid = true;
      }
    }
    endShape();
    pop();
  }

  generateData2D(n = 20, d = 1, o = 20) {
    d = (d * this.divs) / 100;
    this.points = [];
    let theeta = random(-PI, PI);
    let A = cos(theeta);
    let B = sin(theeta);
    if (B === 0) B = 0.001;
    let C = random(-this.divs, this.divs);

    let attempts = 0;
    let maxAttempts = n * 100;
    while (this.points.length < n && attempts < maxAttempts) {
      let x = random(-this.divs, this.divs);
      let y = random(-this.divs, this.divs);
      let dist = abs(A * x + B * y + C) / sqrt(A * A + B * B);
      if (dist <= d) {
        this.points.push({ x, y: -y });
      }
      attempts++;
    }

    let out = (o * n) / 100;
    for (let i = 0; i < out; i++) {
      let x = random(-this.divs, this.divs);
      let y = random(-this.divs, this.divs);
      this.points.push({ x, y: y });
    }
  }

  joinAllPoints() {
    if (!this.points.length) return;
    push();
    beginShape();
    noFill();
    translate(this.pos.x, this.pos.y);
    for (let point of this.points) {
      let mapped = this.mapPoint(point.x, point.y);
      vertex(mapped.x, mapped.y);
    }
    endShape();
    pop();
  }

  trainModel(lr = 0.01, epochs = 10000000, tolerance = 1e-6) {
    if (!this.points || this.points.length === 0) return;

    let w = random(-1, 1);
    let b = random(-1, 1);
    let m = this.points.length;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let dw = 0,
        db = 0;
      let cost = 0;

      // Compute gradients and cost
      for (let { x, y } of this.points) {
        let y_predicted = w * x + b;
        let error = y_predicted - y;
        cost += error * error;
        dw += error * x;
        db += error;
      }
      cost = cost / (2 * m);
      dw = (dw / m) * lr;
      db = (db / m) * lr;

      let new_w = w - dw;
      let new_b = b - db;

      if (abs(w - new_w) < tolerance && abs(b - new_b) < tolerance) {
        console.log(`Converged after ${epoch} epochs.`);
        break;
      }

      // Update model parameters
      w = new_w;
      b = new_b;

      this.trainingInfo = { epoch, cost, w, b };
    }

    this.model = { w, b };
    console.log(`Trained Model: y = ${w.toFixed(4)}x + ${b.toFixed(4)}`);
  }

  reset() {
    this.points = [];
    this.sigmaPoints = [];
    this.model = { w: 0, b: 0 };
    this.trainingInfo = null;
    epch = 0;
    cst = 0;
  }
}

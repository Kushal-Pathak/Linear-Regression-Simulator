let graph;
let errorGraph;
let epch = 0,
  cst = 0;
let num_data, data_width, num_outliers;
let slider1, slider2, slider3;
function setup() {
  createCanvas(windowWidth, windowHeight);
  cx = width / 2;
  cy = height / 2;
  graph = new Graph2D(width / 2, 370, width - 10, width - 10, 10);
  //errorGraph = new Graph2D(width - 50, 50, 90, 90, 10);

  let genBtn = createButton("Gen Data");
  genBtn.position(10, 80);
  genBtn.mouseClicked(generateData);

  let trainBtn = createButton("Train Model");
  trainBtn.position(100, 80);
  trainBtn.mouseClicked(trainModel);

  let resetBtn = createButton("Reset");
  resetBtn.position(200, 80);
  resetBtn.mouseClicked(reset);

  slider1 = createSlider(1, 1000, 100, 1); // Number of data to generate
  slider1.position(10, 10);

  slider2 = createSlider(0.5, 100, 1.5, 0); // Width of data
  slider2.position(10, 30);

  slider3 = createSlider(0, 100, 0, 0); // % of outliers
  slider3.position(10, 50);
}

function draw() {
  background(44, 57, 104);
  graph.draw();
  //errorGraph.draw();
  graph.preMapPoints();
  graph.plotAllSigmaPoints();

  num_data = slider1.value();
  data_width = slider2.value();
  num_outliers = slider3.value();

  fill(255);
  stroke(0);
  textSize(13);
  text(`Data: ${num_data}`, 150, 22);
  text(`Width: ${round(data_width, 2)}%`, 150, 42);
  text(`Outliers: ${round(num_outliers, 2)}%`, 150, 62);

  if (graph.trainingInfo) {
    let { epoch, cost, w, b } = graph.trainingInfo;
    text(`Epochs: ${epoch}`, 250, 22);
    text(`Cost: ${round(cost, 3)}`, 250, 42);
    text(`Model: y = ${round(w, 3)}x + ${round(b, 3)}`, 250, 62);
    graph.plotFunction((x) => -(w * x + b));
  }

  text(`LINEAR REGRESSION SIMULATOR`, width / 3.5, height - 50);
  text(`\u00A9 2025 DEV. KUSHAL`, width / 2.7, height - 20);
}

function generateData() {
  graph.generateData2D(num_data, data_width, num_outliers);
}

function trainModel() {
  graph.trainModel();
}

function reset() {
  graph.reset();
}

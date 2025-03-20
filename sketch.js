// A higher order version of make2DArray using Array.from
function make2DArray(cols, rows) {
  return Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => 0)
  );
}

// Global variables
let grid;
let velocityGrid;
let cols, rows;
let w = 2; // default particle size
let hueValue = 200;
let gravity = 0.01;

// UI controls
let gravitySlider, particleSizeSlider, resetButton;

function setup() {
  // Create and center the canvas
  let cnv = createCanvas(600, 500);
  let canvasX = (windowWidth - width) / 2;
  let canvasY = (windowHeight - height) / 2;
  cnv.position(canvasX, canvasY);
  
  colorMode(HSB, 360, 255, 255);

  // Setup grid dimensions based on canvas size and particle size
  cols = floor(width / w);
  rows = floor(height / w);
  grid = make2DArray(cols, rows);
  velocityGrid = make2DArray(cols, rows);

  // Create a container div for the toggles and reset button
  let toggleContainer = createDiv();
  // Center the container and set its width equal to the canvas width
  toggleContainer.style('text-align', 'center');
  toggleContainer.style('width', width + 'px');
  // Position the container just below the canvas (with a 10px margin)
  toggleContainer.position(canvasX, canvasY + height + 10);

  // Create gravity toggle
  let gravityLabel = createP('Gravity:');
  gravityLabel.style('display', 'inline-block');
  gravityLabel.style('margin', '0 10px');
  gravityLabel.parent(toggleContainer);
  
  gravitySlider = createSlider(0, 0.1, gravity, 0.001);
  gravitySlider.style('width', '150px');
  gravitySlider.style('display', 'inline-block');
  gravitySlider.style('margin', '0 10px');
  gravitySlider.parent(toggleContainer);

  // Create particle size toggle
  let particleSizeLabel = createP('Particle Size:');
  particleSizeLabel.style('display', 'inline-block');
  particleSizeLabel.style('margin', '0 10px');
  particleSizeLabel.parent(toggleContainer);
  
  particleSizeSlider = createSlider(1, 10, w, 1);
  particleSizeSlider.style('width', '150px');
  particleSizeSlider.style('display', 'inline-block');
  particleSizeSlider.style('margin', '0 10px');
  particleSizeSlider.parent(toggleContainer);

  // Create reset button
  resetButton = createButton('Reset');
  resetButton.style('display', 'inline-block');
  resetButton.style('margin', '0 10px');
  resetButton.parent(toggleContainer);
  resetButton.mousePressed(resetSimulation);
}

function resetSimulation() {
  grid = make2DArray(cols, rows);
  velocityGrid = make2DArray(cols, rows);
  hueValue = 200; // reset the hue value if desired
}

function draw() {
  // Update simulation parameters from UI controls
  gravity = gravitySlider.value();
  let newSize = particleSizeSlider.value();

  // If particle size changes, update grid dimensions and reinitialize arrays.
  if (newSize !== w) {
    w = newSize;
    cols = floor(width / w);
    rows = floor(height / w);
    grid = make2DArray(cols, rows);
    velocityGrid = make2DArray(cols, rows);
  }

  background(0);

  if (mouseIsPressed) {
    let mouseCol = floor(mouseX / w);
    let mouseRow = floor(mouseY / w);

    // Add an area of sand particles around the mouse
    let matrix = 3;
    let extent = floor(matrix / 2);
    for (let i = -extent; i <= extent; i++) {
      for (let j = -extent; j <= extent; j++) {
        if (random(1) < 0.75) {
          let col = mouseCol + i;
          let row = mouseRow + j;
          if (col >= 0 && col < cols && row >= 0 && row < rows) {
            grid[col][row] = hueValue;
            velocityGrid[col][row] = 1;
          }
        }
      }
    }
    hueValue += 0.5;
    if (hueValue > 360) hueValue = 1;
  }

  // Draw the sand particles
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] > 0) {
        noStroke();
        fill(grid[i][j], 255, 255);
        square(i * w, j * w, w);
      }
    }
  }

  // Prepare arrays for the next frame of simulation
  let nextGrid = make2DArray(cols, rows);
  let nextVelocityGrid = make2DArray(cols, rows);

  // Update grid cells based on simple particle physics
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let velocity = velocityGrid[i][j];
      let moved = false;
      if (state > 0) {
        let newPos = int(j + velocity);
        for (let y = newPos; y > j; y--) {
          let below = grid[i][y];
          let dir = random(1) < 0.5 ? -1 : 1;
          let belowA =
            (i + dir >= 0 && i + dir < cols) ? grid[i + dir][y] : -1;
          let belowB =
            (i - dir >= 0 && i - dir < cols) ? grid[i - dir][y] : -1;

          if (below === 0) {
            nextGrid[i][y] = state;
            nextVelocityGrid[i][y] = velocity + gravity;
            moved = true;
            break;
          } else if (belowA === 0) {
            nextGrid[i + dir][y] = state;
            nextVelocityGrid[i + dir][y] = velocity + gravity;
            moved = true;
            break;
          } else if (belowB === 0) {
            nextGrid[i - dir][y] = state;
            nextVelocityGrid[i - dir][y] = velocity + gravity;
            moved = true;
            break;
          }
        }
      }

      if (state > 0 && !moved) {
        nextGrid[i][j] = state;
        nextVelocityGrid[i][j] = velocity + gravity;
      }
    }
  }
  
  grid = nextGrid;
  velocityGrid = nextVelocityGrid;
}

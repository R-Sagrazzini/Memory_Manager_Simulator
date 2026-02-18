//Memory Manager System
//Algoritmo di paginazione
//Memory Manager System
//Algoritmo di paginazione

let canvasContainer;

function setup() {
  canvasContainer = document.getElementById('p5Canvas');
  
  // Crea canvas con larghezza del contenitore
  let w = canvasContainer.offsetWidth;
  let h = w * 0.55; // aspect ratio
  
  var canvas = createCanvas(w, h);
  canvas.parent('p5Canvas');
}

function windowResized() {
  // Ridimensiona quando cambia la finestra
  let w = canvasContainer.offsetWidth;
  let h = w * 0.55;
  resizeCanvas(w, h);
}

function draw() {
  background("#004f59");
  rect(10, 20, width - 20, height - 40);
}
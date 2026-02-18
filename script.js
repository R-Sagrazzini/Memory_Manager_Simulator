// Memory Manager con Paginazione

let container; // contenitore del canvas
let ram = []; // array per la RAM
let swap = []; // array per lo SWAP
let processi = []; // array per i processi
let contatore = 0; // contatore per nomi e colori
// colori predefiniti per i processi (si ripetono se ci sono più di 6 processi)
let colori = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4"];

// SETUP E RESIZE

function setup() {
  container = document.getElementById('p5Canvas');
  
  // calcola dimensioni canvas
  let dim = calcolaDimensioni();
  let canvas = createCanvas(dim.w, dim.h);
  canvas.parent('p5Canvas');
  
  reset();
  collegaBottoni();
}

// calcola dimensioni del canvas
function calcolaDimensioni() {
  let style = getComputedStyle(container);
  let padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  let padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  
  return {
    w: container.clientWidth - padX,
    h: container.clientHeight - padY
  };
}

//quando la finestra viene ridimensionata, la funzione viene richiamata in automatico da p5.js
function windowResized() {
  let dim = calcolaDimensioni();
  resizeCanvas(dim.w, dim.h);
}

//reset del sistema
function reset() {
  let nRam = parseInt(document.getElementById('ramFrames').value) || 8;
  let nSwap = parseInt(document.getElementById('swapPages').value) || 8;
  
  // svuota tutto
  ram = [];
  swap = [];
  processi = [];
  
  for (let i = 0; i < nRam; i++) {
    //.push aggiunge un elemento alla fine dell'array
    // inizializza con null per indicare celle libere
    ram.push(null);
  }
  for (let i = 0; i < nSwap; i++) {
    swap.push(null);
  }
  // aggiorna selezione processi
  aggiornaSelect();
}

// collega i bottoni HTML alle funzioni
function collegaBottoni() {
  document.getElementById('addBtn').onclick = aggiungiProcesso;
  document.getElementById('allocateBtn').onclick = allocaInRam;
  document.getElementById('swapOutBtn').onclick = mandaInSwap;
  document.getElementById('swapInBtn').onclick = riportaInRam;
  document.getElementById('terminateBtn').onclick = terminaProcesso;
  document.getElementById('resetBtn').onclick = reset;
  document.getElementById('applyConfigBtn').onclick = reset;
}


// DRAW


function draw() {
  background("#0a0a1a");
  
  disegnaRam();
  disegnaSwap();
  disegnaProcessi();
  aggiornaStats();
}

//disegna la RAM
function disegnaRam() {
  //x e y sono le coordinate del box RAM, con un margine di 30px a sinistra e 50px dall'alto
  let x = 30;
  let y = 50;
  // larghezza del box RAM, 25% del canvas
  let larghezza = width * 0.25;
  let altezza = height - 80;
  // altezza di ogni cella, con un po' di margine
  let altezzaCella = (altezza - 10) / ram.length;
  
  // titolo
  fill('#03e6ff');
  noStroke();
  textAlign(CENTER);
  textSize(16);
  text("RAM", x + larghezza / 2, y - 20);
  
  // box esterno
  stroke('#03e6ff');
  strokeWeight(2);
  noFill();
  rect(x, y, larghezza, altezza, 5);
  
  // disegna ogni cella
  for (let i = 0; i < ram.length; i++) {
    let cella = ram[i];
    // posizione verticale della cella
    let yPos = y + 5 + i * altezzaCella;
    
    //colore della cella
    if (cella == null) {
      fill('#2a2a2a');
    } else {
      // se c'è un processo, usa il suo colore, .nome è il nome del processo, che è un campo dell'oggetto in RAM
      fill(trovaColore(cella.nome));
    }
    // bordo della cella
    stroke('#03e6ff');
    strokeWeight(1);
    rect(x + 5, yPos, larghezza - 10, altezzaCella - 3, 3);
    
    // testo nella cella
    fill('#fff');
    noStroke();
    textSize(10);
    
    if (cella == null) {
      // se la cella è vuota, mostra "P" + indice 
      text("P" + i, x + larghezza / 2, yPos + altezzaCella / 2);
    } else {
        // se c'è un processo, mostra nome e pagina, ad esempio "P1[0]"
      text(cella.nome + "[" + cella.pagina + "]", x + larghezza / 2, yPos + altezzaCella / 2);
    }
  }
}

// disegna lo SWAP
function disegnaSwap() {
  // posizione del box SWAP, a destra della RAM
  let x = width * 0.35;
  let y = 50;
  // larghezza del box SWAP, 25% del canvas
  let larghezza = width * 0.25;
  let altezza = height - 80;
  let altezzaCella = (altezza - 10) / swap.length;
  
  // titolo
  fill('#f5490b');
  noStroke();
  textAlign(CENTER);
  textSize(16);
  text("SWAP", x + larghezza / 2, y - 20);
  
  // box esterno
  stroke('#f5490b');
  strokeWeight(2);
  noFill();
  rect(x, y, larghezza, altezza, 5);
  
  // disegna ogni cella
  for (let i = 0; i < swap.length; i++) {
    let cella = swap[i];
    let yPos = y + 5 + i * altezzaCella;
    
    if (cella == null) {
      fill('#1a1a1a');
    } else {
      fill(trovaColore(cella.nome));
    }
    
    stroke('#f5490b');
    strokeWeight(1);
    rect(x + 5, yPos, larghezza - 10, altezzaCella - 3, 3);
    
    fill('#fff');
    noStroke();
    textSize(10);
    
    if (cella == null) {
      text("S" + i, x + larghezza / 2, yPos + altezzaCella / 2);
    } else {
      text(cella.nome + "[" + cella.pagina + "]", x + larghezza / 2, yPos + altezzaCella / 2);
    }
  }
}

// disegna lista processi
function disegnaProcessi() {
  let x = width * 0.68;
  let y = 50;
  let larghezza = width * 0.28;
  let altezza = height - 80;
  
  // titolo
  fill('#5ede4a');
  noStroke();
  textAlign(CENTER);
  textSize(16);
  text("PROCESSI", x + larghezza / 2, y - 20);
  
  // box esterno
  stroke('#5ede4a');
  strokeWeight(2);
  noFill();
  rect(x, y, larghezza, altezza, 5);
  
  // se non ci sono processi
  if (processi.length == 0) {
    fill('#555');
    textSize(12);
    text("Nessun processo", x + larghezza / 2, y + altezza / 2);
    return;
  }
  
  // disegna ogni processo
  let altProc = min(40, (altezza - 10) / processi.length);
  
  for (let i = 0; i < processi.length; i++) {
    let p = processi[i];
    let yPos = y + 5 + i * altProc;
    let stato = trovaStato(p.nome);
    
    fill(p.colore);
    stroke('#fff');
    strokeWeight(1);
    rect(x + 5, yPos, larghezza - 10, altProc - 5, 5);
    
    fill('#000');
    noStroke();
    textSize(10);
    text(p.nome + " | " + p.pagine + " pag | " + stato, x + larghezza / 2, yPos + altProc / 2 - 2);
  }
}


// FUNZIONI UTILI


// trova il colore di un processo
function trovaColore(nome) {
  // cerca il processo nella lista e restituisce il suo colore
  for (let i = 0; i < processi.length; i++) {
    // se il nome del processo corrisponde, restituisce il colore associato
    if (processi[i].nome == nome) {
      return processi[i].colore;
    }
  }
  return '#888';
}

// trova lo stato di un processo
function trovaStato(nome) {
  let inRam = false;
  let inSwap = false;
  
  // controlla se è in RAM
  for (let i = 0; i < ram.length; i++) {
    // se la cella non è vuota e il nome del processo in quella cella corrisponde al nome cercato, allora il processo è in RAM
    if (ram[i] != null && ram[i].nome == nome) {
      inRam = true;
      break;
    }
  }
  
  // controlla se è in SWAP
  for (let i = 0; i < swap.length; i++) {
    // se la cella non è vuota e il nome del processo in quella cella corrisponde al nome cercato, allora il processo è in SWAP
    if (swap[i] != null && swap[i].nome == nome) {
      inSwap = true;
      break;
    }
  }
  // restituisce lo stato in base alla presenza in RAM o SWAP
  if (inRam && inSwap) return "MISTO";
  if (inRam) return "RAM";
  if (inSwap) return "SWAP";
  return "ATTESA";
}

// conta celle libere
function contaLibere(memoria) {
  let libere = 0;
  // scorre l'array della memoria e conta quante celle sono null, cioè libere
  for (let i = 0; i < memoria.length; i++) {
    if (memoria[i] == null) {
      libere++;
    }
  }
  return libere;
}

// trova prima cella libera
function trovaCellaLibera(memoria) {
  // scorre l'array della memoria e restituisce l'indice della prima cella che è null
  for (let i = 0; i < memoria.length; i++) {
    if (memoria[i] == null) {
      return i;
    }
  }
  return -1;
}

// aggiorna il menu select (lista dei processi)
function aggiornaSelect() {
  // select è l'elemento HTML con id 'processSelect', che è un menu a tendina per selezionare i processi
  // resetta le opzioni del select, lasciando solo l'opzione di default "-- Seleziona --"
  // option è un elemento HTML che rappresenta un'opzione del menu a tendina
  let select = document.getElementById('processSelect');
  select.innerHTML = '<option value="">-- Seleziona --</option>';
  // aggiunge un'opzione per ogni processo, mostrando nome e stato
  for (let i = 0; i < processi.length; i++) {
    // creo un nuovo elemento option, imposto il suo valore e testo, e lo aggiungo al select
    let opzione = document.createElement('option');
    opzione.value = processi[i].nome;
    opzione.textContent = processi[i].nome + " (" + trovaStato(processi[i].nome) + ")";
    select.appendChild(opzione);
  }
}

// aggiorna statistiche
function aggiornaStats() {
  let usateRam = ram.length - contaLibere(ram);
  let usateSwap = swap.length - contaLibere(swap);
  // aggiorna il testo degli elementi HTML con id 'ramUsed', 'swapUsed' e 'processCount' per mostrare le statistiche correnti
  document.getElementById('ramUsed').textContent = usateRam + "/" + ram.length;
  document.getElementById('swapUsed').textContent = usateSwap + "/" + swap.length;
  document.getElementById('processCount').textContent = processi.length;
}


// AZIONI


// aggiungi processo
function aggiungiProcesso() {
  let nome = document.getElementById('processName').value;
  let pagine = parseInt(document.getElementById('processPages').value);
  
  // nome automatico se vuoto
  if (nome == "") {
    nome = "P" + contatore;
  }
  
  //controlla se esiste già
  for (let i = 0; i < processi.length; i++) {
    if (processi[i].nome == nome) {
      alert("Nome già esistente!");
      return;
    }
  }
  
  // crea il processo
  // oggetto nuovoProcesso con proprietà nome, pagine e colore, dove il colore viene scelto dall'array colori in base al contatore
  let nuovoProcesso = {
    nome: nome,
    pagine: pagine,
    colore: colori[contatore % colori.length]
  };
  // aggiunge il nuovo processo alla lista dei processi
  processi.push(nuovoProcesso);
  contatore++;
  // reset input e aggiorna selezione
  document.getElementById('processName').value = "";
  aggiornaSelect();
}

// alloca in RAM
function allocaInRam() {
  let nome = document.getElementById('processSelect').value;
  
  if (nome == "") {
    alert("Seleziona un processo!");
    return;
  }
  
  // trova il processo
  let processo = null;
  // scorre la lista dei processi per trovare quello con il nome selezionato
  // se lo trova, lo assegna alla variabile processo e esce dal ciclo
  for (let i = 0; i < processi.length; i++) {
    if (processi[i].nome == nome) {
      processo = processi[i];
      break;
    }
  }
  
  // controlla se già in RAM
  if (trovaStato(nome) == "RAM") {
    alert("Già in RAM!");
    return;
  }
  
  // controlla spazio
  if (contaLibere(ram) < processo.pagine) {
    alert("RAM insufficiente!");
    return;
  }
  
  // rimuovi da swap se presente
  // serve per evitare che lo stesso processo abbia pagine sia in RAM che in SWAP, e per liberare spazio in SWAP se il processo viene riportato in RAM
  for (let i = 0; i < swap.length; i++) {
    if (swap[i] != null && swap[i].nome == nome) {
      swap[i] = null;
    }
  }
  
  // alloca le pagine in RAM
  let paginaCorrente = 0;

  for (let i = 0; i < ram.length; i++) {
    // se la cella è libera e ci sono ancora pagine da allocare, assegna il processo a quella cella con il numero di pagina corrente, e incrementa paginaCorrente
    if (ram[i] == null && paginaCorrente < processo.pagine) {
      ram[i] = {
        nome: nome,
        pagina: paginaCorrente
      };
      paginaCorrente++;
    }
  }
  
  aggiornaSelect();
}

// manda in SWAP
function mandaInSwap() {
  let nome = document.getElementById('processSelect').value;
  
  if (nome == "") {
    alert("Seleziona un processo!");
    return;
  }
  
  // controlla se è in RAM
  let stato = trovaStato(nome);
  if (stato != "RAM" && stato != "MISTO") {
    alert("Non è in RAM!");
    return;
  }
  
  // conta pagine da spostare
  let daMovere = 0;
  for (let i = 0; i < ram.length; i++) {
    // conta quante pagine del processo sono attualmente in RAM, cioè quante celle della RAM contengono quel processo e incrementa daMovere di conseguenza
    if (ram[i] != null && ram[i].nome == nome) {
      daMovere++;
    }
  }
  
  // controlla spazio in swap
  if (contaLibere(swap) < daMovere) {
    alert("SWAP insufficiente!");
    return;
  }
  
  // sposta da RAM a SWAP
  for (let i = 0; i < ram.length; i++) {
    // se la cella contiene il processo da spostare, trova una cella libera in SWAP e sposta il processo lì, poi libera la cella in RAM
    if (ram[i] != null && ram[i].nome == nome) {
      let posSwap = trovaCellaLibera(swap);
      swap[posSwap] = {
        nome: nome,
        pagina: ram[i].pagina
      };
      ram[i] = null;
    }
  }
  
  aggiornaSelect();
}

// riporta in RAM
function riportaInRam() {
  let nome = document.getElementById('processSelect').value;
  
  if (nome == "") {
    alert("Seleziona un processo!");
    return;
  }
  
  // controlla se è in SWAP
  let stato = trovaStato(nome);
  if (stato != "SWAP" && stato != "MISTO") {
    alert("Non è in SWAP!");
    return;
  }
  
  // conta pagine da spostare
  let daMovere = 0;
  for (let i = 0; i < swap.length; i++) {
    if (swap[i] != null && swap[i].nome == nome) {
      daMovere++;
    }
  }
  
  // controlla spazio in RAM
  if (contaLibere(ram) < daMovere) {
    alert("RAM insufficiente!");
    return;
  }
  
  // sposta da SWAP a RAM
  for (let i = 0; i < swap.length; i++) {
    if (swap[i] != null && swap[i].nome == nome) {
      let posRam = trovaCellaLibera(ram);
      ram[posRam] = {
        nome: nome,
        pagina: swap[i].pagina
      };
      swap[i] = null;
    }
  }
  
  aggiornaSelect();
}

// termina processo
function terminaProcesso() {
  let nome = document.getElementById('processSelect').value;
  
  if (nome == "") {
    alert("Seleziona un processo!");
    return;
  }
  
  // libera RAM
  for (let i = 0; i < ram.length; i++) {
    if (ram[i] != null && ram[i].nome == nome) {
      ram[i] = null;
    }
  }
  
  // libera SWAP
  for (let i = 0; i < swap.length; i++) {
    if (swap[i] != null && swap[i].nome == nome) {
      swap[i] = null;
    }
  }
  
  // rimuovi dalla lista
  let nuovaLista = [];
  for (let i = 0; i < processi.length; i++) {
    if (processi[i].nome != nome) {
      nuovaLista.push(processi[i]);
    }
  }
  processi = nuovaLista;
  
  aggiornaSelect();
}
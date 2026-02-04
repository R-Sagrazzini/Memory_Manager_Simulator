function setup(){
    createCanvas(400, 400);
    background(220);
}
function draw(){
    noLoop();
    fill("lightblue");
    rect(10, 10, 100, 40);
    rect(10, 70, 100, 40);
    rect(10, 130, 100, 40);
    fill("lightgreen");
    rect(290, 10, 100, 40);
    rect(290, 70, 100, 40);
    rect(290, 130, 100, 40);

    stroke('red');
    line(110, 30, 290, 30);
    line(110, 90, 290, 90);
    line(110, 150, 290, 150);

    
}
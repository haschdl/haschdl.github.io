/// <reference path="../libraries/p5.js" />
/// <reference path="../libraries/p5.sound.js" />
/// <reference path="../libraries/p5.dom.js" />
/// <reference path="../libraries/jquery-1.11.0.min.js" />

var img, img_star;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    img = loadImage("white.jpg");
    img_star = loadImage("star.jpg");
}
;
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
;

function draw() {
    background(0);
    
    drawStars(100);
    
    rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
    //pass image as texture
    texture(img_star);
    //box(200, 200, 200);
    
    
    
    //ambientLight(255,255,255);
    //pointLight(250, 250, 250, 100, 100, 0);
    specularMaterial(250, 0, 0, 20);
    texture(image);
    sphere(200, 50);
}
;

function drawStars(howMany) {
    for (var i = 0; i < howMany; i++) {
        var x = noise(i) * 2 * width - width;
        var y = noise(i * i) * 2 * height - height;
        var z = noise(i * i * i) * 2 * height - height;
        push();
        translate(x, y, z);
        ambientMaterial(255, 255, 255);
        texture(img_star);
        var pos = createVector(x, y, -100);
        //pointLight(250, 250, 250, 10, pos);
        sphere(2, 10);
        pop();
    }

}

// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/BjoM9oKOAKY
var inc = 0.1;
var scl = 100;
var cols, rows;
var zoff = 0;
var fr;
var particles = [];
var flowfield;
var picture;

function preload() {
    picture = loadImage("../media/GALLERY_1.jpg");
 
}
function setup() {
    //createCanvas(400, 400);
    createCanvas(windowWidth, windowHeight);
    //colorMode(HSB, 255);
    cols = floor(width / scl);
    rows = floor(height / scl);
    fr = createP('');
    flowfield = new Array(cols * rows);
    for (var i = 0; i < 300; i++) {
        particles[i] = new Particle();
    }
    picture.loadPixels();
    background(51);
}




var colorAtPixel = function (image, x, y) {

    var imageWidth = image.width;
    var imagePixels = image.pixels;
    var d = 1;

    var idx = 4 * (d * imageWidth * round(y) + round(x) * d);
    var r = imagePixels[idx + 0];
    var g = imagePixels[idx + 1];
    var b = imagePixels[idx + 2];
    var a = 255; //imagePixels[idx + 2];

    return color(r, g, b, a);
}

function draw() {
    background(0,1);
    var yoff = 0;
    for (var y = 0; y < rows; y++) {
        var xoff = 0;
        for (var x = 0; x < cols; x++) {
            var index = x + y * cols;
            var angle = noise(xoff, yoff, zoff) * TWO_PI ;
            //var v = p5.Vector.fromAngle(atan2(mouseY, mouseX) + angle);
            var v = p5.Vector.fromAngle(angle);
            v.setMag(1);
            flowfield[index] = v;
            var sign = 1;
            if (mouseX < (width / 2)) {
                sign = -1;
            }
            ;xoff += inc ;
            strokeWeight(4);
            stroke(0, 80);
            //push();
            //translate(x * scl, y * scl);
            //rotate(v.heading());
            //strokeWeight(1);
            //line(0, 0, scl, 0);
            //pop();
        }
        yoff += inc;
        zoff += 0.0003;
    }
    for (var i = 0; i < particles.length; i++) {
        particles[i].follow(flowfield);
        particles[i].update();
        particles[i].edges();

        var color = colorAtPixel(picture, particles[i].pos.x, particles[i].pos.y);
        particles[i].show(color);
    }
    fr.html(floor(frameRate()));
}

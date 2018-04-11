/// <reference path="../libraries/p5.js" />
/// <reference path="../libraries/p5.sound.js" />
/// <reference path="../libraries/p5.dom.js" />
/// <reference path="../libraries/jquery-1.11.0.min.js" />


p5.Color.prototype.invert = function () {
    this.levels[0] = 255 - this.levels[0];
    this.levels[1] = 255 - this.levels[1];
    this.levels[2] = 255 - this.levels[2];
}


var palette = [];

var d;
var offset = 0;
var options;
  

var streams = [];
var capturePixels;
var enableInteraction = false;
var getRandomVector = function () {
    var vec = new createVector(Math.random() * width, Math.random() * height );   
    return vec;
};

//default blend mode
var bMode;

var colorAtPixel = function (image, x, y) {

    var imageWidth = image.width;
    var imagePixels = image.pixels;

    var idx = 4 * (d * imageWidth * round(y) + round(x) * d);
    var r = imagePixels[idx + 0];
    var g = imagePixels[idx + 1];
    var b = imagePixels[idx + 2];
    var a = 255; //imagePixels[idx + 2];

    return color(r, g, b, a);
}

function preload() {
    var params = getURLParams();

    

    imgNumber = params.img;
    if (imgNumber == undefined) {
        imgNumber = "theshining";
    }
    if (params.debug == undefined) {
        isDebug = false;
    }
    else {
        isDebug = true;
    }
    if (params.step != undefined) {
        stepSizeInit = int(params.step);
    }
    if (params.noiseMode != undefined) {
        noiseMode = int(params.noiseMode);
    }

    if (params.curveMode != undefined) {
        curveMode = int(params.curveMode);
    }

    if (params.bMode != undefined) {
        bMode = params.bMode;
    }
    if (params.interactive != undefined) {
        enableInteraction = true;
    }

    

    capturePixels = loadImage("../media/" + imgNumber + ".jpg");
}

function setup() {    
    var cv = createCanvas(windowWidth, windowHeight);
    background(0);
    palette.setup();

    options = {
        numStreams: windowWidth / 3,
        distort: 1,
        strength: Math.PI * (windowWidth > 1000 ? windowWidth / 500 : windowWidth / 200 ),
        scaler: 0.4,
        step: 3 
    };

    //default blendMode
    bMode = BLEND;

    //when using a static image and not a camere
    //loadPixels can be called just once during startup()
    capturePixels.resize(cv.width, cv.height);
    capturePixels.loadPixels();

    
    for (var i = 0; i < options.numStreams; i++) {
        streams.push(getRandomVector());
    }
    d = 1;//pixelDensity();
}


function draw() {
    if (typeof flag === 'undefined') {
       // image(capturePixels, 0, 0);
        flag = 1;
    }
    while (options.numStreams > streams.length) {
        streams.push(getRandomVector());
    }
    while (options.numStreams < streams.length) {
        streams.shift();
    }
    offset += options.distort;


    noStroke();
    blendMode(bMode);

    fill(0, 0, 0, 1);
    //rect(0, 0, width, height);
    
    if(enableInteraction == true) {
        

        fill(
            255 * noise(frameCount * .145), 
            255 * noise(frameCount * .548), 
            255 * noise(frameCount * .048), 
            1.2);

        var x0 = (frameCount * 50) % width;                        
        var y1 = (frameCount * 50) % height;;
        var r =  0.1 * height;

        //fill(200,0,0,1.2);
        drawAmeaba(10, {x: x0, y: 0}, r, 1.8, sin(millis()/200));        
        drawAmeaba(10, {x: x0, y: height}, r, 1.8, sin(millis()/200));
        drawAmeaba(10, {x: 0, y: y1}, r, 1.8, sin(millis()/200));
        drawAmeaba(10, {x: width, y: height -y1}, r, 1.8, sin(millis()/200));
    }

    var replaceIndices = [];
    var lastPos;
    for (var i = 0, l = streams.length; i < l ; i++) {
        var stream = streams[i];
        lastPos = createVector(stream.x, stream.y);

        var colorP = colorAtPixel(capturePixels, stream.x, stream.y);    

        //distance to mouse
        /*
        var m = createVector(mouseX, mouseY);        
        var dist = m.dist(lastPos);
        var ad = constrain(dist, 0, 200);
        if( ad < 100) {
            var coef = 1 - ad / 100;
           colorP.levels[0] = constrain(colorP.levels[0] * (1 + 3 * coef), 0,50);
           colorP.levels[1] = constrain(colorP.levels[1] * (1 + 3 * coef), 0,50);
           colorP.levels[2] = constrain(colorP.levels[2] * (1 + 3 * coef), 0,255);
        }
        */


        
        var noiseV = noise(stream.x * options.scaler, (offset + stream.y) * options.scaler) - 0.5;
        var angle = options.strength * noiseV;
        var dir = this.p5.Vector.fromAngle(angle); //);        
        stream.add(dir.mult(options.step ));

        var p2 = createVector(stream.x, stream.y);        
        var noiseV = noise(stream.x * options.scaler, (offset + stream.y) * options.scaler) - 0.5;        
        var angle = options.strength * noiseV;        
        var dir = new p5.Vector.fromAngle(HALF_PI+ angle);                           
        stream.add(dir.mult(options.step ));    
        
        var p3 = createVector(stream.x, stream.y);
        var noiseV = noise(stream.x * options.scaler, (offset + stream.y) * options.scaler) - 0.5;        
        var angle = options.strength * noiseV;        
        var dir = new p5.Vector.fromAngle(PI + angle);               
        stream.add(dir.mult(options.step ));  

        var p4 = createVector(stream.x, stream.y);
  
        

        


        noFill();
        stroke(colorP);        
        beginShape();
        vertex(lastPos.x, lastPos.y);
        bezierVertex(p2.x,p2.y, p3.x, p3.y, p4.x,p4.y);
        vertex(stream.x, stream.y);
        endShape();        
        
        if (stream.x < 0 || stream.x > width || stream.y < 0 || stream.y > height ) {
            replaceIndices.push(i);
        }
    };

    replaceIndices.forEach(function (streamIndex) {
        streams[streamIndex] = getRandomVector();
    });

    //text(d,20,30);

}




/*
Use a small value for factor to approximate to a hand-drawn circle.
*/
function drawAmeaba(nPoints,location, radius, factor, noiseSeed) {
    if(noiseSeed == undefined) {
        noiseSeed = 1;
    }
    if(factor == undefined) {
        factor = 0.05;
    }
    push();
    translate(location.x, location.y);     

    //vector pointing upwards from the canvas center
    var rVec = createVector(0,-radius);    
    //control points
    var rVecC = createVector(rVec.x, rVec.y);

    beginShape();        
    for(var i = 1 ; i <= nPoints ; i++) {       
        
        //last point
        rVecC.rotate(constrain(TAU /nPoints, 0, TAU  ));
        

        var j = ( (i == 1) ? (nPoints ) : i) * noiseSeed; //* sin(millis() / 3000000) ;
        var noiseV = (1 - 2 * noise(125.1 * j)) * sq(factor) * radius ;       

        rVecC.setMag(radius + noiseV);
        
        p2 =  createVector(rVecC.x, rVecC.y);

        //fill(0);text(i, p2.x, p2.y);  

        //BUG? initial point 
        if(i==1) {
            curveVertex(p2.x,p2.y);
            rVec.x = p2.x;
            rVec.y = p2.y;
        }
        curveVertex(p2.x,p2.y);
        //ellipse(p2.x,p2.y,5,5);
        
    }
    
    endShape(CLOSE);
    pop();
}



function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    capturePixels.resize(windowWidth, windowHeight);
}

// prevent scrolling of page
document.ontouchmove = function (event) {
    if (isDebug == false) {
        event.preventDefault();
    }
}
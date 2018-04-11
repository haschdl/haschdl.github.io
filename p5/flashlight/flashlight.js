/// <reference path="../libraries/p5.js" />
/// <reference path="../libraries/p5.sound.js" />
/// <reference path="../libraries/p5.dom.js" />

var isDebug = false;

// prevent scrolling of page
document.ontouchmove = function (event) {
    if (isDebug == false) {
        event.preventDefault();
    }
}

var mic;
var amp;

var scale = 1.0;

var capture, capturePixels;
var slider;
var stepSizeInit = 6;

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

    //capture = loadImage("../media/" + imgNumber + ".jpg");
    //capturePixels = loadImage("../media/" + imgNumber + ".jpg");
}
function setup() {
    createCanvas(windowWidth, windowHeight);



    //when using a static image and not a camere
    //loadPixels can be called just once during startup()
    //capturePixels.loadPixels();


    //UI
    slider = createSlider(4, 32, stepSizeInit);
    if (isDebug) {
        slider.position(20, 20);
    }
    else {
        slider.hide();
    }
    var constraints = {
        video: {
            mandatory: {
                minWidth: 1280,
                minHeight: 720
            },
            optional: [
              { maxFrameRate: 10 }
            ]
        },
        audio: false
    };

    //If using camera and not a static 
    capturePixels = createCapture(constraints);
    capture = createCapture(constraints);


    // Create a new amplitude analyzer and patch into input
    mic = new p5.AudioIn();
    if (mic.enabled) {
        mic.start();
        amp = new p5.Amplitude();

        //toggleNormalize will not provide interesting results
        //if the audio 1) is a regular level noise 2) is heavily compressed
        amp.toggleNormalize(true);
        amp.smooth(0.95);
        amp.setInput(mic);
    }
}

function draw() {
    var width_c = capture.width / windowWidth;
    var height_c = capture.height / windowHeight;


    //when using a static image and not a camere
    //loadPixels can be called just once during startup()
    capturePixels.loadPixels();

    //image(capture,0,0);

    // Draw a background that fades to black
    noStroke();
    fill(0, 18);
    rect(0, 0, width, height);

    // The analyze() method returns values between 0 and 1,&nbsp;
    // so map() is used to convert the values to larger numbers
    if (mic.enabled) {
        scale = map(amp.getLevel(), 0, 1.0, 10, width);
    }

    //filter(BLUR, 1);
    var stepSize = slider.value();



    var r_flashlight = 100;
    var d = pixelDensity();

    //adjusting mouse coordinates to image size.
    var mouseX_c = round(mouseX * width_c);
    var mouseY_c = round(mouseY * height_c);

    //playing with step and amplitude: the higher the noise, the smaller the detail
    //var stepSize_audio = round(stepSize * (1 + amp.getLevel()));

    for (var y = mouseY_c - r_flashlight; y < mouseY_c + r_flashlight; y += stepSize) {
        for (var x = mouseX_c - r_flashlight; x < mouseX_c + r_flashlight; x += stepSize) {

            var dx = x - mouseX_c;
            var dy = y - mouseY_c;
            var distance = sqrt(dx * dx + dy * dy);
            //if distance < r * r => inside circle 
            if (distance <= r_flashlight) {
                var i = 4 * (y * capture.width + x);
                var r = capturePixels.pixels[i];
                var g = capturePixels.pixels[i + 1];
                var b = capturePixels.pixels[i + 2];
                var perceivedLum = sqrt(0.299 * r ^ 2 + 0.587 * g ^ 2 + 0.114 * b ^ 2)

                //applying noise
                perceivedLum = perceivedLum * (1 + noise(x, y, millis()));

                //var darkness = capturePixels.pixels[i*4 +3] / 255;
                var radius = stepSize * constrain(perceivedLum / 10, 1, 2);
                fill(color(r, g, b, 255 * (1 - distance / r_flashlight)));
                ellipse(x / width_c, y / height_c, radius, radius);
            }
        }
    }
}

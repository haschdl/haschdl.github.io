/// <reference path="../libraries/p5.js" />
/// <reference path="../libraries/jquery-1.11.0.min.js" />

var video;

var vScale = 16;

function setup() {
    createCanvas(640, 480);
    pixelDensity(1);
    var constraints = {
    video: {
      mandatory: {
        minWidth: 320,
        minHeight: 240
      },
      optional: [
        { maxFrameRate: 10 }
      ]
    },
    audio: false
  };
  
    //video= createCapture(constraints, function(stream) {
      //console.log(stream);
    //});
    video = createCapture(VIDEO);
    video.size(width / vScale, height / vScale);

}

function draw() {
    background(51);

    video.loadPixels();
    //loadPixels();
    for (var y = 0; y < video.height; y++) {
        for (var x = 0; x < video.width; x++) {
            var index = (video.width - x + 1 + (y * video.width)) * 4;
            var r = video.pixels[index + 0];
            var g = video.pixels[index + 1];
            var b = video.pixels[index + 2];

            var bright = (r + g + b) / 3;

            var w = map(bright, 0, 255, 0, vScale);

            noStroke();
            fill(255);
            rectMode(CENTER);
            rect(x * vScale, y * vScale, w, w);

        }
    }

}

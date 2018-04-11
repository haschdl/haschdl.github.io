/// <reference path="../libraries/p5.js" />

var cols, rows;
var scl = 20;
var w = 1400;
var h = 1000;

var flying = 0;

var scene;

function setup() {
    createCanvas(windowWidth, windowHeight);
    cols = w / scl;
    rows = h/ scl;

    scene = new Scene();
    scene.init(6);
}

function draw() {
    fill(255);
    
    strokeWeight(3);
    scene.draw();
}
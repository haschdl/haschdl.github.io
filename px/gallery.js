/// <reference path="../p5/libraries/p5.js" />
/// <reference path="../p5/libraries/p5.sound.js" />
/// <reference path="../p5/libraries/p5.dom.js" />
/// <reference path="../Scripts/jquery-1.11.0.min.js" />
/// <reference path="../Scripts/progressbar.min.js" />
/// <reference path="galleryimgprovider.js" />
/// <reference path="tooltip.js" />
/// <reference path="connector.js" />
/// <reference path="speech.js" />
/// <reference path="../Scripts/pixi.min.js" />
// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.

var l = window.innerWidth,
    h = window.innerHeight;
var renderer = new PIXI.WebGLRenderer(l,h);
var stage;
// Declare a global variable for our sprite so that the animate function can access it.
var bunny = null ;
var circle;
$(document).ready(()=>{
     kinectWorker.postMessage({
        cmd: "connect",
        serverUrl: "ws://localhost:8000/kinectservice/hands"
    });
    // The renderer will create a canvas element for you that you can then insert into the DOM.
    document.body.appendChild(renderer.view);
    // You need to create a root container that will hold the scene you want to draw.
    stage = new PIXI.Container();
    // load the texture we need
    PIXI.loader.add('bunny', "../p5/media/GALLERY_1.jpg").load(function(loader, resources) {
        // This creates a texture from a 'bunny.png' image.
        bunny = new PIXI.Sprite(resources.bunny.texture);
        // Setup the position and scale of the bunny
        bunny.position.x = 0;
        bunny.position.y = 0;
        bunny.scale.x = 2;
        bunny.scale.y = 2;
        // Add the bunny to the scene we are building.
        stage.addChild(bunny);
        circle = new PIXI.Graphics();
        circle.beginFill(0x999999);
        circle.drawCircle(10, 10, 100);
        stage.addChild(circle);
        // kick off the animation loop (defined below)
        animate();
    });
}
);
function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);
    // each frame we spin the bunny around a bit
    //bunny.rotation += 0.01;

    circle.x = KINECT_LEFT_X * l;
    circle.y = KINECT_LEFT_Y * h;

    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}
var KinectMessageType = {
    INFORMATION: 1,
    ERROR: 2,
    GESTUREDETECTED: 3,
    JOINTPOSITION: 4,
    DEPTH: 5
}
var useKinect = true;
var isKinectConnected = false;
var KINECT_LEFT_X = 0.0;
var KINECT_LEFT_Y = 0.0;
var KINECT_RIGHT_X = 0.0;
var KINECT_RIGHT_Y = 0.0;
//Kinect "client"
var kinectWorker = new Worker("../Scripts/kinectWorker.js");
var depthArrayBufferDV, depthArrayBufferDVbyteLength = 0, depthArrayBufferDVVisited;
//Without Kinect, using only mouse
var nTouches = 1;
kinectWorker.onerror = function(message, filename, lineno) {
    console.log(message);
}
kinectWorker.onmessage = function(evt) {
    if (evt.data.err)
        throw new Error(evt.data.err);
    if (evt.data.depthArrayBuffer) {//Todo: rendering this image is taking too long
    //console.log("New Blob URL received from worker");
    //depthImage = loadImage(evt.data.blobUrl);
    //depthImage.resize(windowWidth, windowHeight);
    //this.depthArrayBuffer = evt.data.depthArrayBuffer;
    //this.depthArrayBuffer = ArrayBuffer.transfer(evt.data.depthArrayBuffer,0);
    }
    if (evt.data instanceof ArrayBuffer) {
        var dv = new DataView(evt.data);
        var msgType = dv.getUint8(0, true);
        if (msgType === KinectMessageType.JOINTPOSITION) {
            KINECT_LEFT_X = dv.getFloat32(1, true).toFixed(4);
            KINECT_LEFT_Y = dv.getFloat32(5, true).toFixed(4);
            KINECT_RIGHT_X = dv.getFloat32(9, true).toFixed(4);
            KINECT_RIGHT_Y = dv.getFloat32(13, true).toFixed(4);
        } else if (msgType === KinectMessageType.DEPTH) {
            depthArrayBufferDV = new DataView(evt.data.slice(2));
            depthArrayBufferDVbyteLength = depthArrayBufferDV.byteLength;
            //updateDepthImage();
        }
    }
    if (evt.data.status) {
        console.log(evt.data.status);
    }
}
;

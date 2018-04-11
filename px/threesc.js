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
var kinectWorker = new Worker("kinectWorker.js");
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
            updateDepthImage();
        }
    }
    if (evt.data.status) {
        console.log(evt.data.status);
    }
}
;
var container, stats, controls;
var camera, scene, renderer, circleShape, circleShape2;
var group1, group2, text, plane;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var symbol, circles, circle, geometryCircle, materialCircle1;
init();
animate();
function updateDepthImage() {
    for (var i = 0, len = circles.length; i < len; i++) {
        var di = i * 6;
        var x = Math.round(depthArrayBufferDV.getUint16(di, true) / 512 * windowHalfX);
        var y = Math.round(depthArrayBufferDV.getUint16(di + 2, true) / 424 * windowHalfY);
        circles[i].position.set(x, y);
    }
}
function init() {
    circles = [];
    kinectWorker.postMessage({
        cmd: "connect",
        serverUrl: "ws://localhost:8000/kinectservice"
    });
    container = document.createElement('div');
    document.body.appendChild(container);

    //See https://msdn.microsoft.com/en-us/library/dn479430(v=vs.85).aspx
    var camz = 1000;
    var ang = 2*Math.atan2(window.innerHeight / 2, camz) * 180 / Math.PI;
    camera = new THREE.PerspectiveCamera(ang,window.innerWidth / window.innerHeight,0.1,1001);
    camera.position.set(0, 0, camz);
    
    scene = new THREE.Scene();
    group1 = new THREE.Group();
    group2 = new THREE.Group();
    group1.position.y = 0;
    group2.position.y = 0;
  
    // Load the background texture
    var loader = new THREE.TextureLoader();
    var texture = loader.load("../p5/media/GALLERY_1.jpg");
    var backgroundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 8, 8),
        new THREE.MeshBasicMaterial({
            map: texture
        }));


    backgroundMesh.material.depthTest = false;
    backgroundMesh.material.depthWrite = false;
    scene.add(backgroundMesh);
    scene.add(group1);
    scene.add(group2);




    // add stuff that provides a visual frame of reference 
    material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        side: THREE.DoubleSide
    });


    

    geometryCircle = new THREE.CircleGeometry(4);
    materialCircle1 = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        envMap: reflectionCube,
        opacity: 0.3,
        transparent: true
    });

    //materialCircle1 = new THREE.MeshBasicMaterial({
    //    color: 0x00ffff,
    //    opacity: 0.2,
    //    side: THREE.FrontSide,
    //    transparent: true
    //});
    for (var i = 0; i < 1000; i++) {
        symbol = new THREE.Object3D();
        circle = new THREE.Mesh(geometryCircle,materialCircle1);
        circles.push(symbol);
    }


    function addShape(group, shape, color, x, y, z, rx, ry, rz, s) {
        // flat shape
        var geometry = new THREE.ShapeGeometry(shape);
        var material = new THREE.MeshBasicMaterial({
            color: color,
            overdraw: 0.5
        });
        var mesh = new THREE.Mesh(geometry,material);
        mesh.position.set(x, y, z);
        mesh.rotation.set(rx, ry, rz);
        mesh.scale.set(s, s, s);
    }
  
    // Circle
    var circleRadius = 20;
    circleShape = new THREE.Shape();
    circleShape.moveTo(0, circleRadius);
    circleShape.quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0);
    circleShape.quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius);
    circleShape.quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0);
    circleShape.quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius);
    addShape(group1, circleShape, 0x00ff11, 120, 150, 0, 0, 0, 0, 1);
    // Circle 2
    circleShape2 = new THREE.Mesh(geometryCircle,materialCircle1);
    group2.add(circleShape2);
    //addShape(group2, circleShape2, 0x00ff11, 120, 150, 0, 0, 0, 0, 1);
    //
    renderer = new THREE.WebGLRenderer({
	            antialias: true
	        });
    //renderer.setClearColor(0xf0f0f0);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortElements = false;
    container.appendChild(renderer.domElement);
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    stats = new Stats();
    container.appendChild(stats.dom);
   
    window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//
function animate() {
    group1.position.x = (2 * KINECT_LEFT_X - 1) * 100;
    group1.position.y = (2 * KINECT_LEFT_Y - 1) * 100 +50;
    group2.position.x = (2 * KINECT_RIGHT_X - 1) * 100;
    group2.position.y = (2 * KINECT_RIGHT_Y - 1) * 100 +50;
    requestAnimationFrame(animate);
    controls.update();
    render();
    stats.update();
}
function render() {
    //camera.lookAt(scene.position);
    //group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
    renderer.render(scene, camera);
}

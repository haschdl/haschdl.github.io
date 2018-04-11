/// <reference path="../../Scripts/KinectWorkerManager.js" />
/// <reference path="../../Scripts/threejs/Three.js" />
/// <reference path="../../Scripts/threejs/stats.min.js" />
/// <reference path="../../Scripts/threejs/GalleryRenderer.js" />


var galRender;
var kinectManager;

$(document)
        .ready(function () {
            kinectManager = new KinectWorkerManager();

            galRender = new GalleryRender();
            galRender.fragmentShaderTextContent = document.getElementById('noiseFunction').textContent +
                document.getElementById('fragmentShader').textContent;
            galRender.dummyimageEl = document.getElementById("dummyImgElement");
            galRender.init();
            galRender.bufferTextureSetup();
            kinectManager.OnNewDepthImage = (objectUrl) => {
                if (galRender.tuniform && galRender.tuniform.iKinectDepth.value) {
                    galRender.tuniform.iKinectDepth.value.image = galRender.dummyimageEl;
                    galRender.tuniform.iKinectDepth.value.needsUpdate = true;
                }
                galRender.dummyimageEl.src = objectUrl;
            }
            kinectManager.Connect("ws://localhost:8000/kinectservice/depth");
            galRender.render();

        });


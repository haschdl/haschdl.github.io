/// <reference path="../../Scripts/jquery-1.11.0.min.js" />
/// <reference path="../../Scripts/progressbar.min.js" />
/// <reference path="galleryimgprovider.js" />
/// <reference path="tooltip.js" />
/// <reference path="speech.js" />
/// <reference path="GalleryRenderer.js" />

/// <reference path="../libraries/FixedQueue.js" />
/// <reference path="../../Scripts/KinectMessageType.js" />
/// <reference path="../../Scripts/KinectWorkerManager.js" />
/// <reference path="../../Scripts/threejs/Three.js" />
/// <reference path="../../Scripts/threejs/stats.min.js" />



var galRender, kinectManager;
var isDebug = false;
var isLoadingDepthImage = false;
var isLoadingBackgroundImage = false;


// prevent scrolling of page
document.ontouchmove = function (event) {
    event.preventDefault();
};

document.onclick = function() {
    //Forcing a reload
    //window.location.reload(true);
};

var currentImgAuthor;
var backgroundImageEl, backgroundNextImageEl;
var speechClientForGallery;

var GalleryParams = {
    progressBarDuration: 2000,
    //time in ms during each the interaction is enabled; after this, a new image will be loaded
    interactionDuration: 10000,
    //The "resolution" of the pixel effect; lower step sizes mean a more detailed
    //effect, at the cost of performance
    stepSize: 8,
    //Two options for noise, 1, using x and y, and 2, using clock
    noiseMode: 1,
    //Which curve to use when drawing the light. 1=circle, 2=teardrop
    curveMode: 1,
    useSpeech: 0
};

//Image provider for gallery
var imageProvider = new GalleryImgProvider("","/apps/Interactive Gallery/");

function setupAndRun() {
        //reset locat storage
        localStorage.clear();
    
        if (getParameterByName("isDebug") === 1) {
            isDebug = true;
        };
    
        backgroundImageEl = document.getElementById("backgroundImageEl");
        backgroundNextImageEl = document.getElementById("backgroundNextImageEl");
        $("#backgroundImageEl").hide();
        $("#backgroundNextImageEl").hide();
        kinectManager = new KinectWorkerManager();
        galRender = new GalleryRender(isDebug);
        galRender.fragmentShaderTextContent = document.getElementById('noiseFunction').textContent + document.getElementById('fragmentShader').textContent;
        galRender.kinectDepthImageEl = document.getElementById("kinectDepthImageEl");
        galRender.init();
        galRender.bufferTextureSetup();
        galRender.onWindowResize();
        kinectDepthImageEl.onload = function () {
            //Only for troubleshooting
            //console.debug("GALLERY kinectDepthImageEl onload");
    
            //Reistantiating the Texture object leads to a memory leak, why?
            galRender.tuniform.iKinectDepth.value.image  = new THREE.Texture(kinectDepthImageEl);
    
            galRender.tuniform.iKinectDepth.value.image = kinectDepthImageEl;
            galRender.tuniform.iKinectDepth.value.needsUpdate = true;
            requestAnimationFrame(galRender.render.bind(galRender));
            isLoadingDepthImage = false;
            window.URL.revokeObjectURL(kinectDepthImageEl.src);
        };
        kinectDepthImageEl.onerror = function(evt) {
            //console.warn("KINECT Error loading Kinect image");
            //kinectDepthImageEl.src = "";
            
        };
        kinectManager.OnNewDepthImage = function (newObjectUrl) {
            //console.debug("KINECT New depth image arrived");
            if (isLoadingDepthImage === false && newObjectUrl) {
                isLoadingDepthImage = true;
                kinectDepthImageEl.src = newObjectUrl;
            }
        };
        imageProvider.listFoldersContinue()
            .then((files) => imageProvider.getAllImages(files))
            .then(() => loadNextImage());
}

$(document).ready(function(){ 
    setupAndRun();
    setTimeout(function(){ location.reload()}, 200000); //Forces a refresh just to reload images
});

function loadNextImage() {
    console.debug("GALLERY Fetching next image metadata...");
    if (imageProvider.galleryImagesCount === 0) {
        console.error("GALLERY Image provider has 0 images.");
        return;
    }
    imageProvider.GetNextImage().then(() =>processImage());
}
function processImage() {
    console.debug("GALLERY Process image");
    var imgObject = imageProvider.nextImage;

    if (imgObject === undefined || imgObject === null || imgObject.blobUrl === undefined || imgObject.blobUrl === "") {
        console.error("GALLERY Process image called, but image object is undefined or contain incorrect data");
        return;
    }

    //console.debug("GALLERY New image from image provider:" + imgObject.blobUrl);

    backgroundNextImageEl.onload = function () {        
        if (kinectManager.isKinectConnected === false) {
            console.debug("KINECT Client is not connected. Trying to connect...");
            kinectManager.Connect("ws://127.0.0.1:8000/kinectservice/depth",
                function(err) {
                    $("#imgLoading").hide();
                    toolTipOpen(err);
                },
                function() {
                    //console.debug("KINECT Client connected!");
                    console.debug("RENDERER Loading texture for background image");

                   

                    backgroundImageEl.onload = function() {
                        console.debug("RENDERER Texture loaded");
                        
                        /*
                        NOT WORKING
                        console.debug("RENDERER Kinect manager - Time since last:" + kinectManager.timeSinceLast);

                        if(Math.floor( (new Date() - kinectManager.timeSinceLast) ) > 5000) {
                            console.debug("RENDERER Rendering without Kinect depth");
                            galRender.tuniform.iUseKinect.value = 0.0;
                            galRender.tuniform.iUseKinect.value.needsUpdate = true;
                        }
                        else {                            
                            galRender.tuniform.iUseKinect.value = 1.0;
                            galRender.tuniform.iUseKinect.value.needsUpdate = true;
                        }
                        */
                        
                        galRender.tuniform.iChannel0.value = new THREE.Texture(backgroundNextImageEl);
                        galRender.tuniform.iChannel0.value.wrapS = THREE.RepeatWrapping;
                        galRender.tuniform.iChannel0.value.wrapT = THREE.RepeatWrapping;
                        galRender.tuniform.iChannel0.value.needsUpdate = true;

                        console.debug("RENDERER Start rendering...");
                        //if(galRender.animationFrameID === null)
                          //  galRender.render();
                        
                        
                        currentImgAuthor = imgObject.author;
                        startInteraction();
                        isLoadingBackgroundImage = false;
                        $("#imgLoading").hide();
                    };
                    if (isLoadingBackgroundImage === false) {
                        isLoadingBackgroundImage = true;
                        backgroundImageEl.src = imgObject.blobUrl;

                    }
                });
        } else {
            //galRender.tuniform.iChannel0.value = new THREE.Texture(backgroundImageEl);
            //galRender.tuniform.iChannel0.value.wrapS = THREE.RepeatWrapping;
            //galRender.tuniform.iChannel0.value.wrapT = THREE.RepeatWrapping;
            //galRender.tuniform.iChannel0.value.needsUpdate = true;
        }
    };
    backgroundNextImageEl.src = imgObject.blobUrl;
    currentImgAuthor = imgObject.author;


}


function reloadImageLoop() {
    console.debug("GALLERY: Reload image loop");
 
    $("#progressbart").width(0);
    $("#imgAuthor").css("opacity", 0);
    $("#imgAuthor").css("background", "RGBA(0, 0, 0, 0)");
    setTimeout(function () {
        if (imageProvider.nextImage !== undefined) {
            $("#imgAuthor").text(imageProvider.nextImage.author);
        }
        $("#progressbart").velocity({
            width: "100%"
        }, {
            duration: GalleryParams.progressBarDuration,
            easing: 'easeOutExpo'
        });
        console.debug("GALLERY: Renderer paused");
        //Swap pictures
        galRender.paused = true;
        $("#backgroundImageEl").show();
        $("#imgAuthor").velocity({
            opacity: "1"
        }, {
            duration: GalleryParams.progressBarDuration,
            easing: 'easeOutExpo'
        });

        window.setTimeout(function () {
            $("#progressbart").width(0);
            loadNextImage();
            window.setTimeout(function () {
                reloadImageLoop();
                backgroundImageEl.src = backgroundNextImageEl.src;
                $("#backgroundImageEl").hide();
                galRender.paused = false;
                console.debug("GALLERY: Renderer restarted");
            }, 4500);
            //duration when original image is shown
        }, GalleryParams.progressBarDuration);
    }, //this is the time reserved for the interaction.
    //after this has ellapsed, it triggers inner setTimeout function
    GalleryParams.interactionDuration);
}
; var startInteraction = (function () {
    console.debug("GALLERY Starting interaction");
    var executed = false;
    return function () {
        if (!executed) {
            executed = true;
            reloadImageLoop();
        }
    };
})();



function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
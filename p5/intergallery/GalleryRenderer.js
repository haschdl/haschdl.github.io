var GalleryRender = function (debugModep) {

    this.paused = false;
    this.debugMode = debugModep || false;

    this.textureLoader = new THREE.TextureLoader();
    this.tuniform = null;
    this.kinectDepthImageEl = null;
    this.backgroundImageEl = null;
    this.animatrionFrameID = null;

    this.fragmentShaderTextContent = "";

    this.onWindowResize = function () {
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }.bind(this);


}

GalleryRender.prototype.bufferTextureSetup = function () {
    //console.debug("GalleryRenderer: Initializing THREE.JS textures");

    //Create buffer scene
    this.bufferScene = new THREE.Scene();
    this.bufferSceneBlack = new THREE.Scene();

    //Create 2 buffer textures
    this.textureA = new THREE.WebGLRenderTarget(window.innerWidth,
        window.innerHeight,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter
        });
    this.textureB = new THREE.WebGLRenderTarget(window.innerWidth,
        window.innerHeight,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter
        });

    this.tuniform = {
        iMouse: {
            type: "v2v",
            value: [new THREE.Vector2(0, 0), new THREE.Vector2(0, 1)]
        },
        iTime: {
            type: 'f',
            value: 0.1
        },
        iChannel0: {
            type: 't',
            value: new THREE.Texture(this.backgroundImageEl)
        },
        iKinectDepth: {
            type: "t",
            value: new THREE.Texture(this.kinectDepthImageEl)
        },
        bufferTexture: {
            type: "t",
            value: this.textureA.texture
        },
        iResolution: {
            type: 'v2',
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        }        ,
        iUseKinect: {
            type: 'f',
            value: 1.0
        }
    };



    //Pass textureA to shader
    this.bufferMaterial = new THREE.ShaderMaterial({
        uniforms: this.tuniform,
        //vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: this.fragmentShaderTextContent,
        side: THREE.DoubleSide
    });
    this.plane = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);

    this.bufferObject = new THREE.Mesh(this.plane, this.bufferMaterial);
    this.bufferObjectBlack = new THREE.Mesh(this.plane,
        new THREE.LineBasicMaterial({ color: 0x000000 }));
    this.bufferSceneBlack.add(this.bufferObjectBlack);
    this.bufferScene.add(this.bufferObject);

    //Draw textureB to screen
    this.finalMaterial = new THREE.MeshBasicMaterial({
        map: this.textureB
    });

    this.quad = new THREE.Mesh(this.plane, this.finalMaterial);

    this.scene.add(this.quad);

};


GalleryRender.prototype.init = function () {
    console.debug("GalleryRenderer: Initializing THREE.JS objects");
    this.clock = new THREE.Clock();
    this.container = document.getElementById('container');
    //See https://msdn.microsoft.com/en-us/library/dn479430(v=vs.85).aspx
    var camz = 1000;
    var ang = 2 * Math.atan2(window.innerHeight / 2, camz) * 180 / Math.PI;
    this.camera = new THREE.PerspectiveCamera(ang, window.innerWidth / window.innerHeight, 0.1, 1001);
    this.camera.position.set(0, 0, camz);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setClearColor(0x000000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    //If WebGL crashes, reload the page
    this.renderer.context.canvas.addEventListener("webglcontextlost", function (event) {
        event.preventDefault();
        if (this.animatrionFrameID) {
            cancelAnimationFrame(this.animatrionFrameID);
        }
        //Forcing a reload
        window.location.reload(true);
    }.bind(this), false);


    if (this.debugMode) {
        this.tStats = new Stats();
        this.container.appendChild(this.tStats.dom);
    }

    
    window.addEventListener('resize', this.onWindowResize, false);
}



GalleryRender.prototype.render = function () {
    


    if (this.paused) {
        window.cancelAnimationFrame(this.animatrionFrameID);
        this.clearCanvas();
    }
        

    this.tuniform.iTime.value += this.clock.getDelta();
    //Moving needsUpdate to Kinect callback significantly reduces the performance...
    this.tuniform.iKinectDepth.value.needsUpdate = true;

    
    

    //Draw to textureB
    this.renderer.render(this.bufferScene, this.camera, this.textureB, true);
    //Swap textureA and B
    var t = this.textureA;
    this.textureA = this.textureB;
    this.textureB = t;
    this.quad.material.map = this.textureB.texture;
    this.bufferMaterial.uniforms.bufferTexture.value = this.textureA.texture;
    //Finally, draw to the screen
    this.renderer.render(this.scene, this.camera);

    if (this.debugMode) {
        this.tStats.update();
    }
    // this.capturer.capture(this.renderer.domElement);
    //this.animatrionFrameID = requestAnimationFrame(this.render.bind(this));
}

GalleryRender.prototype.clearCanvas = function () {
    this.renderer.clear();
    this.renderer.render(this.bufferSceneBlack, this.camera, this.textureB, true);
    ////Swap textureA and B
    var t = this.textureA;
    this.textureA = this.textureB;
    this.textureB = t;
    this.quad.material.map = this.textureB.texture;
    this.bufferMaterial.uniforms.bufferTexture.value = this.textureA.texture;
    //Finally, draw to the screen
    this.renderer.render(this.scene, this.camera);

}
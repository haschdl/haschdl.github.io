/// <reference path="colors.js" />

var pic_url = [];
var pics = [];
var picsInfo = [];
var processingDone = false;
var pic_me, pic_me_pixels_len;
var pic_me_perceivedLums;

//number of pictures loaded from Facebook
var c_pics;
var box_size = 10;
//global counter for loaded images
var load_i;
var batches = 4;
//pixel density
var d;

window.fbAsyncInit = function() {
    FB.init({
        appId: '513780735478398',
        xfbml: true,
        version: 'v2.6'
    });
}
;

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Only works after `FB.init` is called
function myFacebookLogin() {
    FB.login(function() {}, {
        scope: 'publish_actions,user_photos'
    });
}


function getPhotos() {
    $('#loadPhotos').prop('enabled', false);
    FB.api(
    '/me/photos', 
    'GET', 
    {}, 
    getPhotosComplete
    );
}

function getPhotosComplete(response) {
    console.debug("Get phot0s completed, batch " + batches );
    var ids = response.data;
    var len = ids.length;
    console.debug("Totals pics:" + len);
    for (var i = 0; i < len; i++) {
        getPhoto(ids[i].id);
    }
    if (response.paging.next) {
        if (batches > 0) {
            batches -= 1;
            FB.api(
            response.paging.next, 
            'GET', 
            {}, 
            getPhotosComplete
            );
        }
    }
    $('#loadPhotos').prop('enabled', true);
}

function getPhoto(photoId) {
    /* make the API call */
    FB.api(
    "/" + photoId + "?fields=picture&type=small", 
    function(response) {
        if (response && !response.error) {
            /* handle the result */
            //console.debug("Received picture...  " + response.picture);
            pic_url.push(response.picture);
        }
    }
    );
}

function loadPhotos() {
   /*
    if(batches == 1 && load_i == c_pics) {
        processPhotos();
        return;
    }
    */

    c_pics = pic_url.length;
    
    load_i = 0;
    
    for (var i = 0; i < c_pics; i++) {
        //var p5img = createImg(pic_url[i]);
        loadImage(pic_url[i], 
        function(pic) {
            pics.push(new picPos(pic,0,0,0));
            redraw();
            load_i += 1;
            if (load_i == c_pics) {
                processPhotos();
            }
        }, 
        loadImageErrorOverride);
    
    }

}

function processPhotos() {
    console.log("Processing pictures...");
    for (var i = 0; i < c_pics; i++) {
        var pic = pics[i].pic;
        pic.loadPixels();
        var col = getAverageRGB(pic.pixels, pic.width, pic.length);
        var pos = getPixelsPos(color);
        var picInfo_i = new picInfo(load_i, col, pos.x, pos.y);
        picsInfo.push(picInfo_i);
        //console.debug("%c n=" + i + ", avg color =" + col.r + "," + col.g + "," + col.b, "color: " + getRGBFormat(col));
    }
    processingDone = true;
}


function preload() {
    pic_me = loadImage("./media/me.png");

}

function setup() {
    //createCanvas(windowWidth, windowHeight);
    createCanvas(pic_me.width, pic_me.height);
    pic_me.loadPixels();
    
    var stepSize = 1;
    //doesnt work
    //pic_me_pixels_len = pic_me.pixels.length;
    
    d = pixelDensity();
    pic_me_pixels_len = 4 * (pic_me.width * d) * (pic_me.height * d);
    
    var pixs = pic_me.pixels;
    pic_me_perceivedLums = [];
    
    
    var count = 0;
    var d = 1;
    // pixelDensity();
    var box_pixels = box_size * box_size * d * d;
    
    
    
    var rgb = {
        r: 0,
        g: 0,
        b: 0
    };
    
    for (var x = 0; x < pic_me.width; x += box_size) {
        for (var y = 0; y < pic_me.height; y += box_size) {
            rgb = {
                r: 0,
                g: 0,
                b: 0
            };
            //loops for pixel density
            for (var i = 0; i < d; i++) {
                for (var j = 0; j < d; j++) {
                    // loop over
                    idx = 4 * ((y * d + j) * pic_me.width + (x * d + i));
                    rgb.r += pixs[idx];
                    rgb.g += pixs[idx + 1];
                    rgb.b += pixs[idx + 2];
                    //pixs[idx + 3] = a;  
                    count += 1;
                }
            }
            // ~~ used to floor values                    
            //console.assert(rgb.r > 0, "Some color..");
            rgb.r = rgb.r / count;
            rgb.g = rgb.g / count;
            rgb.b = rgb.b / count;
            
            var info = new picInfo(i,rgb,x,y);
            pic_me_perceivedLums.push(info);
            count = 0;
        }
        //loop y
    
    
    }
    //loop x


}

function draw() {
    background(0);
    //image(pic_me, 0, 0);
    
    if (processingDone == false) {
        var l = pic_me_perceivedLums.length;
        for (var i = 0; i < l; i++) {
            var info = pic_me_perceivedLums[i];
            fill(info.color.r, info.color.g, info.color.b);
            rect(info.x, info.y, box_size, box_size);
        }
    }
    
    if (processingDone == true) {
        for (var i = 0; i < pics.length; i++) {
            image(pics[i].pic, pics[i].x, pics[i].y, box_size, box_size);
            //console.debug(i + " - " + lum);
        }
    }

}

//TODO Sort picInfos and use bolzano theorem to find a close enough
function getPixelsPos(color) {
    var len = pic_me_perceivedLums.length;
    
    var x = 0
    , y = 0;
    
    var rgb_a = [color.r / 255, color.g / 255, color.b / 255, 1];
    var col_rga = new Colour(Colour.RGBA,rgb_a);
    
    for (var i = 0; i < len; i++) {
        var col2 = pic_me_perceivedLums[i].color;
        var col2_arr = [col2.r / 255, col2.g / 255, col2.b / 255, 1];
        var col2_obj = new Colour(Colour.RGBA,col2_arr);
        
        var dif = col_rga.distanceTo(col2_obj);
        console.debug("Difference = " + dif);
        if (dif < 0.4) {
            x = pic_me_perceivedLums[i].x;
            y = pic_me_perceivedLums[i].y;
            break;
        }
    }
    console.debug("pos=" + x + "," + y);
    return createVector(x, y);
}

function loadImageErrorOverride(errEvt) {
    const pic = errEvt.target;
    
    if (!pic.crossOrigin)
        return print('Failed to reload ' + pic.src + '!');
    
    print('Attempting to reload it as a tainted image now...');
    pic.crossOrigin = null ,
    pic.src = pic.src;
}


function picInfo(id, color, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.color = color;
}
function picPos(pic, color, x, y) {
    this.pic = pic;
    this.x = x;
    this.y = y;
    this.color = color;
}
/*
function getPicLum(pixels, img_width, img_height) {    
    var result = 0;
    var l = pixels.length;
    var stepSize = 10;

    for (var i = 0; i < l ; i += 4 * d * stepSize) {

        var idx = 4 * i;
        var r = pixels[idx];
        var g = pixels[idx + 1];
        var b = pixels[idx + 2];
        //var a = 255 * (1 - smoothstep(0, 1, distance));

        result += sqrt(0.299 * r ^ 2 + 0.587 * g ^ 2 + 0.114 * b ^ 2);

    }   

    //a simple average
    return result / l;

}
*/

function getAverageRGB(pixels, height, width) {
    
    var blockSize = 5
      
    
    
    , // only visit every 5 pixels                
    i = -4
      
    
    
    , 
    rgb = {
        r: 0,
        g: 0,
        b: 0
    }
      
    
    
    , 
    count = 0;
    
    var length = pixels.length;
    
    while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += pixels[i];
        rgb.g += pixels[i + 1];
        rgb.b += pixels[i + 2];
    }
    
    // ~~ used to floor values    
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);
    
    return rgb;
}

function getRGBFormat(rgb) {
    return "RGB(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
}

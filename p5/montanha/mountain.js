/// <reference path="../libraries/p5.js" />
function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

var Scene = Scene || {};

function Mountain(){
    this.points = new Array();
    this.c = 0;
    
    //center of the triangle, x-axis
    this.c = (0.15 + 0.75 * random()) * width;

    //widht of the triangle
    this.w = random()*width/10 + width/4;

    // A and B are always on the "ground" ( y = height)
    this.A = new p5.Vector(this.c - this.w, height);
    this.B = new p5.Vector(this.c + this.w, height);
    
    //C always in the upper-half ( 0 < y < 0.5 * height)
    this.C = new p5.Vector(this.c, (0.15 + random() * 0.4) * height);

    this.points.push(this.A);
    this.points.push(this.B);
    this.points.push(this.C);

    this.move = function(x) {
        this.A.x += x;
        this.B.x += x;
        this.C.x += x;        
    }

    this.moveTo = function (new_C) {
        this.c = new_C;
        this.A.x = new_C - this.w;
        this.B.x = new_C + this.w;
        this.C.x = new_C;

    }

    this.draw = function() { 
       beginShape();      
       vertex(this.A.x,this.A.y);
       vertex(this.B.x,this.B.y);

       vertex(this.C.x,this.C.y);
       
       endShape(CLOSE);
    }
};
function Scene() {
    this.mountains = new Array();
        
    this.init = function(mountain_c) {
        for(var i = 0; i < mountain_c ; i++) {
            var m = new Mountain();
            m.moveTo( map(i, 0, mountain_c - 1, 0, width));
            this.mountains.push(m);
        }
        this.mountains = shuffle(this.mountains);
    }

    this.draw = function(){
        var mountain_c = this.mountains.length;
        for(var i = 0; i < mountain_c ; i++) {
            this.mountains[i].draw();
        }
        
    }
};


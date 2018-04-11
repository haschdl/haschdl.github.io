// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/BjoM9oKOAKY

function Particle() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxspeed = 4;
    this.h = 0;

    this.gravity = createVector(0, 0);

    this.prevPos = this.pos.copy();

    this.update = function () {
        this.vel.add(this.acc);
        this.vel.limit(this.maxspeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    this.follow = function (vectors) {
        var x = floor(this.pos.x / scl);
        var y = floor(this.pos.y / scl);
        var index = x + y * cols;
        this.gravity = createVector(mouseX - width / 2, mouseY - height / 2);
        var force = vectors[index];

        this.applyForce(force);
        this.applyForce(this.gravity.normalize());
    }

    this.applyForce = function (force) {
        this.acc.add(force);
    }

    this.show = function (color) {
        //stroke(this.h, 255, 255, 25);
        //this.h = this.h + 1;
        //if (this.h > 255) {
        //    this.h = 0;
        //}

        stroke(color.levels[0], color.levels[1], color.levels[2], 25);
        
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.updatePrev();
    }

    this.updatePrev = function () {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    }

    this.edges = function () {
        if (this.pos.x > width) {
            this.pos.x = 0;
            this.updatePrev();
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
            this.updatePrev();
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
            this.updatePrev();
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
            this.updatePrev();
        }

    }

}
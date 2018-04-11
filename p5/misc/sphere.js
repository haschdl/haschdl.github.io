var sampleLocation;
var c;
var r;
var elA, elB,elC; 
function setup() {
    
    createCanvas(windowWidth, windowHeight,  WEBGL);
     elA = createP("A").addClass('text');;
     elB = createP("B").addClass('text');;
     elC = createP("C").addClass('text');;
}

function draw() {


    background(0);
    orbitControl();
    c = createVector(width/2, height/2);
    r = 200;
    sphere(10,10);
    rotateY(HALF_PI);
    var mouse = createVector(mouseX - width/2, mouseY - windowHeight / 2,0);
    var v = createVector(10,10,10);
    v = rotateZ_point(v, PI/6);
    //rotateZ(PI/6);
    //translate(v.x,v.y, v.z);

    //plane(200,200);
    var pA = createVector(200,200,0);
    var pB = createVector(200,100,0);
    var pC = createVector(0,200,0);
    
    
    
    //elA.position(mouse.x + c.x,mouse.y + c.y);
    var ang = 0 ;
    pA = rotateY_point(pA,ang);
    pB = rotateY_point(pB,ang);
    pC = rotateY_point(pC,ang);
    
    elA.position(pA.x+c.x,pA.y+c.y);
    elB.position(pB.x+c.x,pB.y+c.y);
    elC.position(pC.x+c.x,pC.y+c.y);
    beginShape();
    fill(0,255,0);     

    vertex(pA.x,pA.y,pA.z);
    vertex(pB.x,pB.y,pB.z);
    vertex(pC.x,pC.y,pC.z);    
    endShape(CLOSE);
    //our main circle    
    //sphere(r, 20);
    
    //a line from center
    //line(0, 0, mouse.x, mouse.y);
    
    //little point at mouse location
    fill(0);
    push();
    translate(mouse.x , mouse.y,0);
    sphere(10, 10);
    pop();

    //our random circle
    if (sampleLocation !== undefined) {
        push();
        //translate(sampleLocation.x, sampleLocation.y);
        //sphere( 3, 3);
        //a line from A to B
        line(sampleLocation.x, sampleLocation.y, mouse.x, mouse.y);
        pop();

        
        //draw normal
        /*
        if (theta < HALF_PI) {
            var m = 1;
            if (mouse.x < 0)
                m = -1;
            line(0, 0, m * vect_dif.mag() * sin(theta) , m * vect_dif.mag() * cos(theta),0);
        }
        */
        
       

    }
}


function mousePressed() {
    sampleLocation = createVector(mouseX - c.x, mouseY - c.y);
}

var sampleLocation;
var c;
var r;

function setup() {
    
    createCanvas(1000, 670);
}

function draw() {
    
    background(255);
    c = createVector(width / 2, height / 2);
    r = 200;
    var mouse = createVector(mouseX - c.x, mouseY - c.y);
    
    push();
    translate(width / 2, height / 2);
    
    //our main circle
    fill(200, 10);
    ellipse(0, 0, r*2, r*2);
    
    
    //a line from center
    line(0, 0, mouse.x, mouse.y);
    
    //little point at mouse location
    fill(0);
    ellipse(mouse.x, mouse.y, 3, 3);


    //little point at intersection
    fill(0);
    ellipse(mouse.x, mouse.y, 3, 3);
    
    
    
    
    
    //our random circle
    if (sampleLocation !== undefined) {
        ellipse(sampleLocation.x, sampleLocation.y, 3, 3);
        //a line from A to B
        line(sampleLocation.x, sampleLocation.y, mouse.x, mouse.y);
        
        
        var vect_dif = p5.Vector.sub(mouse, sampleLocation);
        //var vect_AB = p5.Vector.sub(sampleLocation, mouse);
        
        //line(sampleLocation.x,sampleLocation.y, vect_dif.x,vect_dif.y);
        

        //angle between two lines
        var theta = p5.Vector.angleBetween(mouse, vect_dif);

        var phi =  mouse.heading();//p5.Vector.angleBetween(mouse, createVector(1,0,0));
        
        //draw normal
        /*
        if (theta < HALF_PI) {
            var m = 1;
            if (mouse.x < 0)
                m = -1;
            line(0, 0, m * vect_dif.mag() * sin(theta) , m * vect_dif.mag() * cos(theta),0);
        }
        */
        
        var normalLength =  mouse.mag() * sin(theta);

        
        
        
        //some info
        fill(0);
        text("Radius = " + r, 25 - c.x, 10 - c.y);
        text("Normal length: " + normalLength, 25 - c.x, 30 - c.y);
        fill(0);
        text("Theta: " + degrees(theta), 25 - c.x, 50 - c.y);
        text("Phi: " + degrees(phi), 25 - c.x, 70 - c.y);
        
        arc(50 - c.x, 90 - c.y, 50, 50, 0, theta, PIE);

        var start =  PI + phi;
        var stop  = PI +  theta + phi ;

        arc(mouseX- c.x, mouseY - c.y, 50, 50,  start,  stop, PIE);
    
    }
}


function mousePressed() {
    sampleLocation = createVector(mouseX - c.x, mouseY - c.y);
}

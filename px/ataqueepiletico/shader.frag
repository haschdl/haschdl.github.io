//The width and height of our screen
uniform vec2 res;

//Our input texture
uniform sampler2D bufferTexture;

uniform float iGlobalTime;
uniform float iKinectJoints[25];
uniform sampler2D iChannel0;
uniform sampler2D iKinectDepth;
uniform vec2 iMouse[2];
varying vec2 vUv;
#define M_PI 3.1415926535897932384626433832795

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

       
void main() {
	vec2 p = gl_FragCoord.xy / res.xy;
	

    //Color of pixels comes from the the buffer
    vec4 col = texture2D( bufferTexture, p );
	
	//If pixel is not black, skip
    /*if(col.r + col.g + col.b > 0.002) {
        gl_FragColor = col; 
        return;
    }
    */
            

    float brightness;
	vec4 pPicture;
	
	float ro = 0.0001;	

	//diameter of the cell
	float d1 =  0.002;
	
	col = mix(col,texture2D(iChannel0, p),p.x);
        
    col *= clamp(texture2D(iKinectDepth, p).g, 0.2,.5);
	
    //Dividing the screen in n cells. To-do: move const
	float n =  floor(res.x/d1  * .5);

	//In each cell the pixel is located?
	float i  = floor( p.x / d1 );
	float j  = floor( p.y / d1 );
	
	//Center of the cell of the pixel
	vec2 cij = (vec2(i,j) + 0.5 ) * ( d1 ) ;

	//some variation on the position of the small circles
    cij += sin(iGlobalTime* rand(cij)*15. ) / 1500.;

	if(length(cij - p) <= d1/2. ) { //if point is inside the cell
		pPicture = texture2D(iChannel0, p); //from the background picture
		brightness = sqrt(pow(0.299 * pPicture.r,2.) + 0.587 * pow(pPicture.g, 2.) + 0.114 * pow(pPicture.b, 2.));
		d1 *= clamp(brightness* 1.1,0.25,1.5);
				
		//taking color from the center of each small circle
        float f = smoothstep(d1, d1+0.005, distance(cij,p));
	    col =  (1. - f) * texture2D(iChannel0, cij) + col*f;
	}
	       
    //Fades to black
    col -= 0.0001;
	gl_FragColor = col;
}



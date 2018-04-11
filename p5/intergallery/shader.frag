 #ifdef GL_ES
    precision mediump float;
    #endif

    //The width and height of our screen
    uniform vec2 iResolution;
    //Our input texture
    uniform sampler2D bufferTexture;
    uniform float iTime;
    uniform float iKinectJoints[25];
    uniform sampler2D iChannel0;
    uniform sampler2D iKinectDepth;
    uniform vec2 iMouse[2];
    varying vec2 vUv;


    
    // Created by inigo quilez - iq/2013 : https://www.shadertoy.com/view/4dl3zn
    // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
    // Messed up by Weyland
    
    vec3 rgb2hsv(vec3 rgb)
    {
        float Cmax = max(rgb.r, max(rgb.g, rgb.b));
        float Cmin = min(rgb.r, min(rgb.g, rgb.b));
        float delta = Cmax - Cmin;
    
        vec3 hsv = vec3(0., 0., Cmax);
        
        if (Cmax > Cmin)
        {
            hsv.y = delta / Cmax;
    
            if (rgb.r == Cmax)
                hsv.x = (rgb.g - rgb.b) / delta;
            else
            {
                if (rgb.g == Cmax)
                    hsv.x = 2. + (rgb.b - rgb.r) / delta;
                else
                    hsv.x = 4. + (rgb.r - rgb.g) / delta;
            }
            hsv.x = fract(hsv.x / 6.);
        }
        return hsv;
    }
    
    
    float chromaKey(vec3 color)
    {
        //vec3 backgroundColor = vec3(0.157, 0.576, 0.129); //green
        vec3 backgroundColor = vec3(0., 0., 0.);
        vec3 weights = vec3(4., 1., 2.);
    
        vec3 hsv = rgb2hsv(color);
        vec3 target = rgb2hsv(backgroundColor);
        
        float dist = length(weights * (target - hsv));
        
        return 1. - clamp(3. * dist - 1.5, 0.1, 1.);
    }
    
    vec4 mask(vec3 color, float alpha)
    {
        return vec4(color.xyz, alpha);
    }
    
    
    float hash( vec2 p ) {
        float h = dot(p,vec2(127.1,311.7));	
        return fract(sin(h)*43758.5453123);
    }
    float noise( in vec2 p ) {
        vec2 i = floor( p );
        vec2 f = fract( p );	
        vec2 u = f*f*(3.0-2.0*f);
        return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ), 
                         hash( i + vec2(1.0,0.0) ), u.x),
                    mix( hash( i + vec2(0.0,1.0) ), 
                         hash( i + vec2(1.0,1.0) ), u.x), u.y);
    }

    /**
    * Returns accurate MOD when arguments are approximate integers.
    */
   float modI(float a,float b) {
       float m=a-floor((a+0.5)/b)*b;
       return floor(m+0.5);
   }


    void main()
    {
        vec2 p = gl_FragCoord.xy / iResolution.xy;
        //Color of pixels comes from the the buffer
        vec4 col = texture2D( bufferTexture, vec2(p.x,p.y) );

        float alpha = texture2D(iKinectDepth, p).g;
        if(alpha <= 0.1) {
            //Fades to black
            col -= 0.001;
            gl_FragColor = col;
            return;
        }
          vec2 uv = -1.0 + 2.0*gl_FragCoord.xy / iResolution.xy;
        
          vec2 c = 	gl_FragCoord.xy / iResolution.xy;
          
          vec4 background = texture2D(iChannel0, c);
        
          uv.x *=  iResolution.x / iResolution.y;
          vec3 color = vec3(0.0);
        
        
          float radiusAroundPixel = sqrt(128.);
            
          vec4 b =  texture2D(iKinectDepth, c);
              
          for( int i=0; i<128; i++ )
          {
            
            float x_i = (gl_FragCoord.x - radiusAroundPixel / 2.0)  +  float(modI(float(i), radiusAroundPixel));
            float y_i = (gl_FragCoord.y - radiusAroundPixel / 2.0)  +  float(i  / int(radiusAroundPixel));
            float d = distance(vec2(x_i,y_i), gl_FragCoord.xy);  
            
              
            vec2 maskCoord = vec2(x_i,y_i) / iResolution.xy;        
              
              
            b.r =  max(b.r, (radiusAroundPixel - d)/radiusAroundPixel * texture2D(iKinectDepth, maskCoord).r);
              
             //b = mix(b, vec4(1.0,1.,1.,0.5), float(i)/128.);
              
              
            float pha =      sin(float(i)*546.13+1.0)*0.5 + 0.5;
            float siz = pow( sin(float(i)*651.74+5.0)*0.5 + 0.5, 4.0 );
            float pox =      sin(float(i)*321.55+4.1) * iResolution.x / iResolution.y;
            
            //radius  
            float rad = 0.1+0.5*siz+sin(pha+siz)/8.0;
              
            vec2  pos = vec2( pox+sin(iTime/15.+pha+siz), 
                             - 1.0-rad 
                             + (2.0+2.0*rad)
                             *  mod(pha+0.3*(iTime/7.)
                             * (0.2+0.8*siz),1.0));
            float dis = length( uv - pos );
            
            float amount = 0.5+0.5*sin(float(i));
            vec3 color1 = mix(background.xyz,
                              vec3(0.194*sin(iTime/6.0)+0.3,0.2,0.3), 
                              amount);
            vec3 color2 = vec3(1.1*sin(iTime)+0.3,0.2*pha,0.4);
            //vec3 color2 = background;
            
                
            vec3  col = mix( color1, color2, amount );
            //col = mix( col, background.xyz, sqrt(amount));
          
            float f = length(uv-pos)/rad;
            f = sqrt(clamp(1.0+(sin((iTime)*siz)*0.5)*f,0.0,1.0));
            color += col.zyx *(1.0-smoothstep( rad*0.15, rad, dis ));
          }
          color *= sqrt(1.5-0.5*length(uv));
          color *= b.r;
          float incrustation = chromaKey(b.xyz);
          //color = mask(color, b.w);//mix(color, vec3(0.),incrustation);
          gl_FragColor =  vec4(color,1.)  ;
    }
        
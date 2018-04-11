/*
Create based on palette returned from http://www.cssdrive.com/imagepalette/
*/
var palette = palette || { };

function palette() {     
};

palette = {

    ncolors: 0,
    alpha : 1,
    colors: [],
    setA: function (alpha) { this.alpha = alpha; return this; },
    setup: function() {
        palette.colors.push(color('#2757a1'));
        palette.colors.push(color('#409456'));
        palette.colors.push(color('#4876c4'));
        palette.colors.push(color('#2956a7'));
        palette.colors.push(color('#2f67ba'));
        palette.colors.push(color('#fcc729'));
        palette.colors.push(color('#9de941'));
        palette.colors.push(color('#2c6fb3'));
        palette.colors.push(color('#211426'));
        palette.colors.push(color('#1d5db5'));
        palette.colors.push(color('#276fc3'));
        palette.colors.push(color('#3b7ecc'));
        palette.colors.push(color('#dc0d21'));
        palette.colors.push(color('#53a553'));
        palette.colors.push(color('#20151b'));
        palette.colors.push(color('#307cca'));
        palette.colors.push(color('#357bd1'));
        palette.colors.push(color('#d40d44'));
        palette.colors.push(color('#5194db'));
        palette.colors.push(color('#3978c7'));
        palette.colors.push(color('#3d4627'));
        palette.colors.push(color('#fadf52'));
        palette.colors.push(color('#34324a'));
        palette.colors.push(color('#2460a8'));
        palette.colors.push(color('#607da7'));
        palette.colors.push(color('#3a5990'));
        palette.colors.push(color('#3b2d3e'));
        palette.colors.push(color('#7bc733'));
        palette.colors.push(color('#53573e'));
        palette.colors.push(color('#263b34'));
        palette.colors.push(color('#286fbd'));
        palette.colors.push(color('#155096'));
        palette.colors.push(color('#32202c'));
        palette.colors.push(color('#ffd239'));
        palette.colors.push(color('#dd1546'));
        palette.colors.push(color('#4084d5'));
        palette.colors.push(color('#ffd23b'));
        palette.colors.push(color('#e1114d'));
        palette.colors.push(color('#2f6eb5'));
        palette.colors.push(color('#2871be'));
        palette.colors.push(color('#db173b'));
        palette.colors.push(color('#38353e'));
        palette.colors.push(color('#1f0a33'));
        palette.colors.push(color('#1f57b4'));
        palette.colors.push(color('#261120'));
        palette.colors.push(color('#316db6'));
        palette.colors.push(color('#1b4da2'));
        palette.colors.push(color('#2978bd'));
        palette.colors.push(color('#2561a7'));



        this.ncolors = this.colors.length;
    },
    getOne: function (seed) {
        var idx = constrain(round(noise(seed || 1) * palette.ncolors), 0, palette.ncolors - 1);
        var colorOb = this.colors[idx]
        colorOb.levels[3] = this.alpha;
        return colorOb;
    }
};
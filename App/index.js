/*
    This is the main index.js file for running with Ejecta.js.
    Any changes here should be reflected in the index.html file that
    is used for testing in the browser.
*/


/*
    This establishes the canvas size and hacks for working with various
    iPhones. It's ugly, man.

    These globals should be packaged up into an window.env object
    or something, but we were runnin' like the wind to get this
    game out.
*/
canvas.width = 320;
canvas.height = 568;

// Force everyone to have iphone5 ratio (except iPad)
window.canvas_ratio_width = 1;
window.canvas_ratio_height = 1;

// Check iphone4
window.MOVE_UP_SCREEN_PIXELS = 0;
if (window.innerHeight < canvas.height) {
    window.MOVE_UP_SCREEN_PIXELS = -40;
}

if (navigator.userAgent.indexOf("iPad") > -1) {
    // Stretch the canvas
    canvas.style.width = window.innerWidth;
    canvas.style.height = window.innerHeight;

    // Set ratio (for correct button position detection)
    window.canvas_ratio_width = window.innerWidth / canvas.width;
    window.canvas_ratio_height = window.innerHeight / canvas.height;
}

ejecta.include("./lib/Ω500.js");
ejecta.include("./lib/Button.js");
ejecta.include("./src/entities/WaftyMan.js");
ejecta.include("./src/entities/Pipe.js");
ejecta.include("./src/screens/MainScreen.js");
ejecta.include("./src/screens/TitleScreen.js");
ejecta.include("./src/game.js");

window.isNative = true;
var game = new OmegaGame(canvas.width, canvas.height);
var iAds = new Ejecta.AdBanner();
var gameCenter = new Ejecta.GameCenter();

gameCenter.softAuthenticate(function(error){
    if (error) {
        console.log('gamecenter - Auth failed');
    }
    else {
        console.log('gamecenter - Auth successful');
    }
});

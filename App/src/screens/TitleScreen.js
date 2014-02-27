(function (Ω, MainScreen) {

    "use strict";

    var TitleScreen = Ω.Screen.extend({

        x: 0,
        y: 0,
        ac: 0,

        flapping: 90,

        font: new Ω.Font("res/images/flapfont.png", 16, 22, "abcdefghijklmnopqrstuvwxyz"),

        buttons: null,

        sounds: {
            "theme": new Ω.Sound("res/audio/theme", 1)
        },

        count: 0,

        init: function () {
            var w = Ω.env.w,
                h = Ω.env.h;

            this.buttons = [
                new Button([22, h - 188 + window.MOVE_UP_SCREEN_PIXELS, 120, 70], function () {
                    window.game.setScreen(new MainScreen(), {type: "inout", time:50});
                }),
                new Button([w - 15 - 125, h - 188 + window.MOVE_UP_SCREEN_PIXELS, 120, 70], function () {
                    // Open Game Center rankings
                    if ( gameCenter.authed ) {
                        gameCenter.showLeaderboard("leaderboard");
                    } else {
                        gameCenter.authenticate(function(error){
                            if (error) {
                                console.log('gamecenter - Auth failed');
                            }
                            else {
                                gameCenter.showLeaderboard("leaderboard");
                            }
                        });
                    }
                }),
                new Button([(w / 2) - 47, h - 264 + window.MOVE_UP_SCREEN_PIXELS, 94, 68], function () {
                    // Go to rating screen
                    ejecta.openURL( 'https://itunes.apple.com/us/app/wafty-man/id824792309?l=fr&ls=1&mt=8');
                    console.log("Go to Rate Screen");
                })
            ];

            this.sounds.theme.play();
        },

        tick: function () {
            this.ac = Math.min(this.ac + 0.1, 5);
            this.y += this.ac;

            if (Ω.input.pressed("jump")) {
                var xpos = (Ω.input.touch.x || Ω.input.mouse.x) | 0,
                    ypos = (Ω.input.touch.y || Ω.input.mouse.y) | 0;

                this.buttons.forEach(function (b) {
                    b.test([xpos / window.canvas_ratio_width, ypos / window.canvas_ratio_height]);
                });
            }

            this.count++;
        },

        render: function (gfx) {

            var now = Date.now(),
                atlas = window.game.atlas,
                midX = gfx.w / 2;

            if (window.MOVE_UP_SCREEN_PIXELS) {
                gfx.ctx.save();
                gfx.ctx.translate(0, window.MOVE_UP_SCREEN_PIXELS);
            }

            // -12 is the offset the ground was wrong by in the
            // original FB atlas file
            atlas.render_stretch(gfx, "bg_day", 0, -12);

            var ySin = Math.sin(now / 150) * 7;
            var titleRatio = Ω.utils.ratio(30, 62, this.count);
            atlas.render(
                gfx,
                "title",
                (midX - (202 / 2)),
                Ω.utils.ease.bounce(-53, gfx.h * 0.18, titleRatio)
            );

            atlas.render(
                gfx,
                "wafty_" + [0,1,2,1][Ω.utils.toggle(this.flapping, 4)],
                Ω.utils.lerpPerc(-35, gfx.w * 0.42, Ω.utils.ratio(0, 30, this.count)),
                gfx.h * 0.38 + ySin - 5
            );


            atlas.render(gfx, "land", -((now / 6 | 0) % 288), gfx.h - 124);
            atlas.render(gfx, "land_bum", -((now / 6 | 0) % 288), gfx.h - 12); // Original didn't quite fill screen
            atlas.render(gfx, "land", 289 - ((now / 6 | 0) % 288), gfx.h - 124);
            atlas.render(gfx, "land_bum", 289 - ((now / 6 | 0) % 288), gfx.h - 12);

            atlas.render(gfx, "button_play", 25, gfx.h - 184);
            atlas.render(gfx, "button_score", gfx.w - 25 - 116, gfx.h - 184);
            atlas.render(gfx, "button_rate", midX - (74 / 2), gfx.h - 254);

            /*this.buttons.forEach(function (b) {
                b.render(gfx);
            });*/

            if (window.MOVE_UP_SCREEN_PIXELS) {
                gfx.ctx.restore();
            }

        }
    });

    window.TitleScreen = TitleScreen;

}(window.Ω, window.MainScreen));

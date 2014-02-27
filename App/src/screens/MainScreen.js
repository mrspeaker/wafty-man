(function (Ω) {

    "use strict";

    var MainScreen = Ω.Screen.extend({

        speed: 2.3,
        waftyMan: null,
        pipes: null,

        score: 0,
        state: null,

        bg: 0,
        bgOffset: 0,

        sounds: {
            "point": new Ω.Sound("res/audio/collect", 0.15),
            "swiftin":new Ω.Sound("res/audio/swiftin3", 0.1)
        },

        shake: null,
        flash: null,

        pipeDist: 174,
        pipeGap: 114 / 2,

        buttons: null,

        blink: {
            x: 0,
            y: 0,
            count: 0
        },

        easter: 0,

        init: function () {
            this.reset();

            this.bindButtons();
        },

        buttonsEnabled: function () {
            return this.state.count > (this.score === 0 ? 100 : 135);
        },

        bindButtons: function () {

            var w = Ω.env.w,
                h = Ω.env.h,
                self = this;

            this.buttons = [
                new Button([22, h - 188 + window.MOVE_UP_SCREEN_PIXELS, 120, 70], function () {
                    if (self.buttonsEnabled()) {
                        window.game.setScreen(new MainScreen(), {type: "inout", time:50});
                    }
                }),
                new Button([w - 15 - 125, h - 188 + window.MOVE_UP_SCREEN_PIXELS, 120, 70], function () {
                    if (self.buttonsEnabled()) {
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

                    }
                })
            ];
        },

        reset: function () {
            this.score = 0;
            var offset = ((Ω.env.w * 0.5) + (Math.random() * (Ω.env.w * 1))) | 0;
            this.state = new Ω.utils.State("BORN");
            this.waftyMan = new window.WaftyMan(Ω.env.w * 0.24, Ω.env.h * 0.46, this);

            // Choose day or night
            this.bg = Ω.utils.rand(2);

            this.pipes = [
                new window.Pipe(0, "up", offset + Ω.env.w, Ω.env.h - 170, this.speed, this.pipeDist),
                new window.Pipe(0, "down", offset + Ω.env.w, - 100, this.speed, this.pipeDist),

                new window.Pipe(1, "up", offset + Ω.env.w + this.pipeDist, Ω.env.h - 170, this.speed, this.pipeDist),
                new window.Pipe(1, "down", offset + Ω.env.w + this.pipeDist, - 100, this.speed, this.pipeDist),

                new window.Pipe(2, "up", offset + Ω.env.w + this.pipeDist + this.pipeDist, Ω.env.h - 170, this.speed, this.pipeDist),
                new window.Pipe(2, "down", offset + Ω.env.w + this.pipeDist + this.pipeDist, - 100, this.speed, this.pipeDist)
            ];

            // Stupid way to choose heights, I know.
            // Refactor the pipe "pairs"!
            this.setHeight(0);
            this.setHeight(1);
            this.setHeight(2);

            // Shhh.
            if (window.game.easter) {
                window.game.easter = false;
                this.pipes[4].y = 235;
                this.pipes[5].y = -85;
            }
        },

        tick: function () {
            this.state.tick();

            this.waftyMan.tick();
            switch (this.state.get()) {
                case "BORN":
                    this.state.set("GETREADY");
                    this.waftyMan.state.set("CRUSING");
                    break;
                case "GETREADY":
                    if (this.state.count > 30 && Ω.input.pressed("jump")) {
                        this.waftyMan.state.set("RUNNING");
                        this.state.set("RUNNING");
                    }
                    this.moveLand();
                    break;
                case "RUNNING":
                    this.tick_RUNNING();
                    break;
                case "DYING":
                    if (this.state.first()) {
                        this.shake = new Ω.Shake(30);
                        this.flash = new Ω.Flash(6);
                    }
                    if (this.state.count > 20) {
                        this.state.set("GAMEOVER");
                    }
                    break;
                case "GAMEOVER":
                    if (this.state.first()) {
                        this.lastBest = window.game.best;
                        this.newBest = window.game.gotScore(this.score);

                        // send score to Game Center
                        if ( this.newBest && gameCenter.authed ) {
                            // Report highscore for the "leaderboard" list
                            gameCenter.reportScore( "leaderboard", this.score, function( error ) {
                                if( error ) {
                                    console.log( "Reporting the score failed" );
                                }
                                else {
                                    console.log( "Score successfully reported" );
                                }
                            });
                        }
                    }
                    if (this.state.count === 15) {
                        this.sounds.swiftin.play();
                    }
                    if (this.state.count === 76) {
                        this.sounds.swiftin.play();
                    }
                    if (this.state.count > 100 && Ω.input.pressed("jump")) {
                        var xpos = (Ω.input.touch.x || Ω.input.mouse.x) | 0,
                            ypos = (Ω.input.touch.y || Ω.input.mouse.y) | 0;

                        this.buttons.forEach(function (b) {
                            b.test([
                                xpos / window.canvas_ratio_width,
                                ypos / window.canvas_ratio_height]
                            );
                        });

                        if (xpos < 50 && ypos < 50) {
                            if (this.easter++ > 5) {
                                window.game.easter = true;
                            }
                        } else {
                            this.easter = 0;
                        }
                    }
                    break;
            }

            if (this.shake && !this.shake.tick()) {
                this.shake = null;
            }
            if (this.flash && !this.flash.tick()) {
                this.flash = null;
            }

        },

        tick_RUNNING: function () {

            this.moveLand();

            this.pipes = this.pipes.filter(function (p) {
                p.tick();
                if (!p.counted && p.x < this.waftyMan.x) {
                    p.counted = true;
                    this.score += 0.5;
                    this.sounds.point.play();
                }

                if (p.reset) {
                    this.setHeight(p.group);
                }
                return true;
            }, this);

            Ω.Physics.checkPointsCollision(this.waftyMan, this.pipes);
        },

        moveLand: function () {
            this.bgOffset -= this.speed;
            if (this.bgOffset < -Ω.env.w) {
                this.bgOffset += Ω.env.w;
            }
        },

        setHeight: function (group) {
            // This sets the random heights for the pipe pairs
            // needs a re-think because this is ugggly.
            var h = (Math.random() * 220 | 0) + 130,
                gap = this.pipeGap;
            this.pipes.filter(function (p) {
                return p.group === group;
            }).forEach(function (p) {
                p.y = p.dir == "up" ? h + gap : h - p.h - gap;
            });
        },

        render: function (gfx) {
            var atlas = window.game.atlas;

            gfx.ctx.save();

            if (window.MOVE_UP_SCREEN_PIXELS) {
                gfx.ctx.translate(0, window.MOVE_UP_SCREEN_PIXELS);
            }

            this.shake && this.shake.render(gfx);

            this.renderBG(gfx, atlas);

            this.renderGame(gfx, atlas);

            switch (this.state.get()) {
                case "GETREADY":
                    // ads
                    iAds.isAtBottom = false;
                    iAds.show();

                    this.renderGetReady(gfx, atlas);
                    this.renderFG(gfx, atlas);
                    break;
                case "GAMEOVER":
                    // ads
                    iAds.isAtBottom = true;
                    iAds.show();

                    this.renderFG(gfx, atlas);
                    this.renderGameOver(gfx, atlas);
                    break;
                case "RUNNING":
                    iAds.hide();
                    this.renderRunning(gfx, atlas);
                    this.renderFG(gfx, atlas);
                    break;
                default:
                    iAds.hide();
                    this.renderFG(gfx, atlas);
                    break;
            }

            gfx.ctx.restore();

            this.flash && this.flash.render(gfx);

        },

        renderBG: function (gfx, atlas) {
            // -12 is the offset the ground was wrong by (in the original FB it's stretched)
            atlas.render_stretch(gfx, "bg_" + (this.bg === 1 ? "night" : "day"), 0, -12);
        },

        renderGame: function (gfx) {
            this.pipes.forEach(function (p) {
                p.render(gfx);
            });
            this.waftyMan.render(gfx);
        },

        renderFG: function (gfx, atlas) {
            atlas.render(gfx, "land", this.bgOffset, gfx.h - 124);
            atlas.render(gfx, "land_bum", this.bgOffset, gfx.h - 12);
            atlas.render(gfx, "land", Ω.env.w + this.bgOffset, gfx.h - 124);
            atlas.render(gfx, "land_bum", Ω.env.w + this.bgOffset, gfx.h - 12);
        },

        renderRunning: function (gfx, atlas) {
            if (this.state.count < 30) {
                gfx.ctx.globalAlpha = 1 - (this.state.count / 30);
                this.renderGetReady(gfx, atlas);
                gfx.ctx.globalAlpha = 1;
            }
            this.renderScore(gfx, atlas);
        },

        renderGameOver: function (gfx, atlas) {

            var count = this.state.count,
                yOff,
                midX = gfx.w / 2,
                medal = "";

            if (count > 20) {
                yOff = Ω.utils.ease.bounce(
                    0,
                    30,
                    Ω.utils.ratio(20, 35, count));

                atlas.render(gfx, "text_game_over", midX - (204 / 2), gfx.h * 0.19 + yOff);
            }

            if (count > 70) {
                var panelEdge = midX - (238 / 2);
                yOff = Math.max(0, 330 - (count - 70) * 20);
                atlas.render(gfx, "score_panel", panelEdge, gfx.h * 0.38 + yOff);

                var scRatio = this.score * Ω.utils.ratio(100, 135, Math.max(100, count)),
                    score = (scRatio | 0) + "",
                    hiScore = "" + (this.newBest ?
                        (this.lastBest > scRatio ? this.lastBest : scRatio) | 0 :
                        window.game.best
                    ),
                    right = panelEdge + 194;
                for (var i = 0; i < score.length; i++) {
                    atlas.render(gfx, "number_score_0" + score[score.length - i - 1], right - i * 16, 251 + yOff);
                }

                for (i = 0; i < hiScore.length; i++) {
                    atlas.render(gfx, "number_score_0" + hiScore[hiScore.length - i - 1], right - i * 16, 294 + yOff);
                }

                if (this.score >= 10) medal = "3";
                if (this.score >= 20) medal = "2";
                if (this.score >= 30) medal = "1";
                if (this.score >= 40) medal = "0";
                if (medal) {
                    atlas.render(gfx, "medals_" + medal, panelEdge + 31, 260 + yOff);
                    if (count > 100) {
                        // Do blinking sparkles
                        this.blink.count -= 0.1;
                        if (this.blink.count <= 0) {
                            this.blink.x = Ω.utils.rand(44);
                            this.blink.y = Ω.utils.rand(42);
                            this.blink.count = Ω.utils.rand(7) + 3 | 0;
                        }
                        atlas.render(
                            gfx,
                            "blink_0" + [0,1,2,3,3,3,3,3,3,3,3,3][this.blink.count | 0],
                            panelEdge + this.blink.x + 26,
                            this.blink.y + 257 + yOff
                        );
                    }
                }

                if (this.newBest) {
                    atlas.render(gfx, "new", panelEdge + 140, 276 + yOff);
                }
            }

            if (this.buttonsEnabled()) {
                atlas.render(gfx, "button_play", 25, gfx.h - 184);
                atlas.render(gfx, "button_score", gfx.w - 25 - 116, gfx.h - 184);

                /*this.buttons.forEach(function (b) {
                    b.render(gfx);
                });*/
            }
        },

        renderGetReady: function (gfx, atlas) {
            var midX = gfx.w / 2;
            atlas.render(gfx, "text_ready", midX - (196 / 2), gfx.h * 0.285);
            atlas.render(gfx, "tutorial", midX - (114 / 2), gfx.h * 0.425);

            this.renderScore(gfx, atlas);
        },

        renderScore: function (gfx, atlas) {
            var sc = this.score + "",
                charWidth = 18,
                len = sc.length,
                midWidth;

            midWidth = (gfx.w / 2) - (charWidth * len / 2);

            for (var i = 0; i < len; i++) {
                atlas.render(gfx, "font_0" + (48 + parseInt(sc[i], 10)), (i * charWidth) + midWidth, gfx.h * 0.16);
            }
        }
    });

    window.MainScreen = MainScreen;

}(window.Ω));

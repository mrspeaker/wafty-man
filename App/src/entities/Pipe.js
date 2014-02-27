(function (Ω) {

    "use strict";

    var Pipe = Ω.Entity.extend({

        reset: false,
        counted: false,

        init: function (group, dir, x, y, speed, dist) {
            this._super(x, y);
            this.group = group;
            this.w = 48;
            this.h = 320;
            this.speed = speed;
            this.dir = dir;
            this.dist = dist;
        },

        tick: function () {
            this.x -= this.speed;
            if (this.reset) {
                this.reset = false;
            }
            // If pipe out of screen
            if (this.x < -this.w) {
                this.x += this.dist * 3; // Move 3 lengths upscreen
                this.reset = true;
                this.counted = false;
            }
            return true;
        },

        render: function (gfx) {
            window.game.atlas.render(gfx, this.dir === "up" ? "pipe_up" : "pipe_down", this.x - 2, this.y);
        }
    });

    window.Pipe = Pipe;

}(window.Ω));
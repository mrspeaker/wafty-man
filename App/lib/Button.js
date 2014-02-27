(function (Ω) {

    "use strict";

    var Button = Ω.Class.extend({

       init: function (rect, cb) {

            this.xp = rect[0];
            this.yp = rect[1];
            this.wp = rect[2];
            this.hp = rect[3];
            this.cb = cb;

        },

        tick: function () {},

        test: function (pos) {

            var x = pos[0],
                y = pos[1];

            if (x > this.xp &&
                x < this.xp + this.wp &&
                y > this.yp &&
                y < this.yp + this.hp) {
                this.trigger();
            }
        },

        trigger: function () {

            //audio.get("button").backPlay();
            this.cb && this.cb();

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "rgba(100, 0, 0, 0.5)";
            c.fillRect(this.xp, this.yp, this.wp, this.hp);

        }

    });

    window.Button = Button;

}(window.Ω));

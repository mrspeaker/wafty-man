(function (Ω) {

    "use strict";

    var WaftyMan = Ω.Entity.extend({
        w: 34,
        h: 23,

        angle: 0,
        rotation_point: null,
        points_init: null,
        points: null,

        slowFlap: 90,
        fastFlap: 60,


        lastTap: 0,

        /*
            So, there are two parts to the physics: gravity (controlled by "linear" velocity) and
            rotation (controlled by "angular" velocity). They both act independently to each other.

            What we have separate variables for angluar phsyics:
              rotVel is the speed that it's rotating
              rotAc is the amount each frame that is added to rotVel
              rotFriction is the amount velocity is dampened by each frame
                  (higher == less friction. 1 == no friction, infinite spinning)
              jumpRotationImpulse is the amount of power we apply once when the user taps
              downwardRotationImpluse is the amount that is applied to make wafty man spin the other way.

            We don't appy downwardRotationImpluse until after some time (500ms in the code) - this gives
            the correct effect from the game where it doesn't rotate for a while.

            The trick is getting all of these values correct: especially getting the correct amount of friction
            to dampen the rotation!

            We might also need to clamp the max and min of the rotVel to get the correct angles when you tap and when
            you fall.
        */
        ac: 0,
        jumpImpulse: -7,
        gravityImpulse: 0.4,
        maxGravity: 8.9,

        rotVel: 0,
        rotAc: 0,
        rotFriction: 0.94,
        jumpRotationImpuse: -0.03,
        downwardRotationImpulse: 0.15,
        timeBeforeRotate: 600,

        ground: 105,

        flappingSpeed: 0,
        state: null,

        sounds: {
            "hit": new Ω.Sound("res/audio/die", 1),
            //"coconuts": new Ω.Sound("res/audio/coconuts", 0.5),
            "flap": new Ω.Sound("res/audio/swoosh", 0.2)
        },

        init: function (x, y, screen) {
            this._super(x, y);
            this.screen = screen;
            this.state = new Ω.utils.State("BORN");

            this.points_init = [
                [5, 12],
                [this.w / 2, 3],
                [this.w - 2, 3],
                [5, this.h + 8],
                [this.w / 2, this.h],
                [this.w, this.h]
            ];
            this.rotation_point = [this.w * 0.75, this.h * 0.8]; // The tail
            this.points = [];
        },

        tick: function () {
            this.state.tick();
            switch (this.state.get()) {
                case "BORN":
                    this.state.set("CRUISING");
                    break;
                case "CRUSING":
                    this.y += Math.sin(Date.now() / 150) * 0.70;
                    this.flappingSpeed = this.slowFlap;
                    this.calculateCollisionPoints(this.angle, this.rotation_point);
                    break;
                case "RUNNING":
                    if (this.state.first()) {
                        this.tap();
                        this.flappingSpeed = this.fastFlap;
                    }
                    var oldy = this.y;
                    if (Ω.input.pressed("jump")) {
                        this.tap();
                    }

                    this.calculateLinearVelocity();

                    if (Ω.utils.since(this.lastTap) > this.timeBeforeRotate) {
                        this.rotAc = this.downwardRotationImpulse;
                    }
                    this.calcAngularVelocity();
                    if (this.rotVel > 1.4) {
                        this.flappingSpeed = 0;
                    }

                    this.calculateCollisionPoints(this.angle, this.rotation_point);

                    // See if hit bottom of screen
                    if (this.y > Ω.env.h - this.ground - (this.h * 2)) {
                        this.y = oldy;
                        this.die(true);
                    }
                    break;

                case "DYING":
                    this.ac = Math.min(this.ac + 0.4, 10);
                    if (this.y < Ω.env.h - this.ground - (this.h * 2)) {
                        this.rotAc = this.downwardRotationImpulse;
                        this.calculateLinearVelocity();
                        this.calcAngularVelocity();
                    }
                    this.flappingSpeed = 0;
                    break;
            }
        },

        calculateLinearVelocity: function () {
            this.ac = Math.min(this.ac + this.gravityImpulse, this.maxGravity);
            this.y = Math.max(-40, this.y + this.ac);
        },

        calcAngularVelocity: function () {
            this.rotVel += this.rotAc;
            this.rotVel = Ω.utils.clamp(this.rotVel, -0.05, 2);
            this.rotVel *= this.rotFriction;
            this.angle = this.rotVel;
        },

        tap: function () {
            this.lastTap = Ω.utils.now();
            this.applyImpulse();
            this.sounds.flap.play();
            this.flappingSpeed = this.fastFlap;
        },

        applyImpulse: function () {
            this.ac = this.jumpImpulse;
            this.rotAc = this.jumpRotationImpuse;
        },

        calculateCollisionPoints: function (angle, rotation_point) {
            var self = this;
            this.points = this.points_init.map(function (p) {
                var o = Ω.utils.rotate(angle, p, rotation_point);
                return [o[0] + self.x, o[1] + self.y];
            });
        },

        die: function (byGround) {
            if (this.screen.state.is("RUNNING")) {
                this.sounds.hit.play();
                //if (!byGround) this.sounds.coconuts.play();
                this.screen.state.set("DYING");
                this.state.set("DYING");
                this.ac = 0;
            }
        },

        hit: function (p) {
            this.die();
        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.save();

            c.translate(this.x + this.rotation_point[0], this.y + this.rotation_point[1]);
            c.rotate(this.angle);
            c.translate(-this.rotation_point[0], -this.rotation_point[1]);

            window.game.atlas.render(
                gfx,
                "wafty_" + [0,1,2,1][Ω.utils.toggle(this.flappingSpeed, 4)],
                -7,
                -7);

            c.restore();

            // Show bounding box - useful to see how the rotated hitpoints work.
            // c.fillStyle = "rgba(255, 255, 255, 1)";
            // this.points.forEach(function (p) {
            //     c.fillRect(p[0], p[1], 2, 2);
            // });
            // c.fillStyle = "#fff";
            // c.fillRect(this.rotation_point[0] + this.x - 1, this.rotation_point[1] +this.y -1, 3, 3);

        }
    });

    window.WaftyMan = WaftyMan;

}(window.Ω));

# Wafty Man

A fairly accurate Flappy Bird clone. Written in JavaScript (rendered on Canvas) and packaged for iOS with Ejecta.

[Play it fo' free now](https://itunes.apple.com/us/app/wafty-man/id824792309) on the App Store!

![Wafty Man](http://a2.mzstatic.com/us/r30/Purple6/v4/71/b2/b5/71b2b561-537d-fce3-a438-15c27da5a169/screen568x568.jpeg)

By [Mr Speaker](http://www.mrspeaker.net/) (@mrspeaker), [Anthony Aubertin](http://dribbble.com/Noxdzine) (@Noxdzine), and [S. Nizar](http://morningpotion.com)

## Playing

Test in your browser by opening `App/index.html`. Though it's better to package it up and run it on your iPhone.

## Building for iPhone/iPad

Go and grab [Ejecta]((http://impactjs.com/ejecta) and follow the instructions. Replace the `App` folder with Wafty Man's `App` folder. Run it.

If someone knows a good equivalent for Android/Win Phones etc... let us know!

## Warning about the code

This code is based off the [Flappy Bird Typing Tutor](https://github.com/mrspeaker/Omega500/tree/master/ex/flapjam) code which was written *extremely* quickly. Wafty Man improved the *feeling* of game play to match the original Flappy Bird - but the code was written just as quick. There's some dragons around: global variables, strange use of atlas rendering. Anyhoo. The actual logic is pretty easy to follow and easy to modify - but don't be afraid of doing a little refactoring.

The library used is [Ω500](https://github.com/mrspeaker/Omega500) - which is a small library I've been writing for fun for use as in Ludum Dare and other game jams. It's very simple and has a bunch of holes in it... so, more dragons.

## The texture atlas

The atlas file was taken directly from the original Flappy Bird and the graphics altered to become Wafty Man. The file is one giant image with a corresponding .txt file containing the offsets to each sprite.

    pipe_up 52 320 0.1640625 0.6308594 0.05078125 0.3125
    pipe_down 52 320 0.109375 0.6308594 0.05078125 0.3125
    ....

I "reverse engineered" the fields and found they represented:

    image_name width height position_x_ratio, position_y_ratio, width_ratio, height_ratio

The ratios are between 0 and 1 in relation to the overall image size. So `position_x_ratio * 1024` (the image width) would get you the x position of the asset. To use any images you don't have to calculate it yourself - I added an `SpriteAtlas` class to Ω500 so you can draw assets like this:

    atlas.render(gfx, "pipe_up", 10, 10);

And it will render the "pipe_up" asset at position `x = 10, y = 10`. If I was less lazy I would have cut up all the images and just loaded them the normal way in Ω500, beecause now it is a pain to add new assets to the existing atlas - you have to manually calculate the .txt entry. If you want to add more images to the game, don't bother with the atlas file just do:

    ...
    myImage: new Ω.Image("res/myImage.png")
    ...

then in the render method:

    this.myImage.render(gfx, 10, 10);

Or use the Ω.SpriteSheet if you need a sprite sheet etc. Check the Ω500 docs.

## License

It'll be pretty libre - I just have to talk to the artist to see what he wants to do about the assets. Back soon.









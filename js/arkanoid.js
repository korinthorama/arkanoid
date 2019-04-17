(function ($) {
    $.fn.extend({
        arkanoid: function () {
            var obj = $(this);
            var game = {
                terrain_colors: {
                    '1': '#1d0000',
                    '2': '#00201a',
                    '3': '#00182d',
                    '4': '#191b00'
                },
                sounds: {
                    'ball': new Audio('sounds/ball.mp3'),
                    'bonus': new Audio('sounds/bonus.mp3'),
                    'brick': new Audio('sounds/brick.mp3'),
                    'loose': new Audio('sounds/loose.mp3'),
                    'racket': new Audio('sounds/racket.mp3'),
                    'win_ball': new Audio('sounds/win_ball.mp3')
                },
                init: function () {
                    this.speed = 5; // ball's shifting for x and y
                    this.racket_speed = 10; // racket's shifting
                    this.racket_size = 'normal'; // racket size type
                    this.balls = 3; // available balls
                    this.score = this.bonus_ball = this.broken_bricks = this.pause = 0; // initializing game vars
                    this.high_score = helper.get_cookie('arkanoid_high_score') || 0;
                    this.interval_ball_ms = 35; // interval ms for ball's controller
                    this.interval_racket_ms = 58;// interval ms for racket's controller
                    this.playing = this.disable_spacebar = false; // is playing flags
                    this.create(); // create markup
                    this.tw = parseInt($('#terrain_wrapper').width()) - 15; // terrain width
                    this.th = parseInt($('#terrain_wrapper').height()) - 11; // terrain height
                    this.dir = "upleft"; // initial direction
                    this.factor = this.random(); // random factor to affect direction angle
                    this.bricks_count = 36; // total bricks count
                    this.level = this.brickID_idx = 1; // initialize game level and first brick id index
                    this.update_board(); // update board info
                    racket.drag(); // set the racket draggable
                    bricks.init(); // set up game bricks
                    this.controls(); // add keyboard event listeners
                },
                create: function () { // setup scene
                    var elements = {};
                    elements.container = $('<div id="arkanoid"></div>');
                    elements.terrain_wrapper = $('<div id="terrain_wrapper"></div>');
                    elements.terrain = $('<div id="terrain"></div>');
                    elements.brick = $('<div class="brick"></div>');
                    elements.ball = $('<div id="ball"></div>');
                    elements.racket = $('<div id="racket"><span class="racket_left"></span><span class="racket_middle"></span><span class="racket_right"></span></div>');
                    elements.game_board = $('<div id="game_board"></div>');
                    elements.score_wrapper = $('<div id="score_wrapper"></div>');
                    elements.h3_score = $('<h3>Score</h3>');
                    elements.score = $('<input class="game_info" id="score" type="text" value="0" disabled>');
                    elements.h3_balls = $(' <h3>Balls</h3>');
                    elements.balls = $(' <input class="game_info" id="balls" type="text" value="" disabled>');
                    elements.h3_high_score = $('<h3>High Score</h3>');
                    elements.high_score = $('<input class="game_info" id="high_score" type="text" value="0" disabled>');
                    elements.h3_keyboard = $('<h3>Controls</h3>');
                    elements.instructions = $('<div id="instructions">Play/Pause:<div>Spacebar</div>Game controls:<div>Cursor keys or Drag</div></div>');
                    elements.play_control = $('<input type="button" id="play_control" value="Start">');
                    elements.controls = $(' <div id="controls"><div id="game_msg">READY</div></div>');
                    elements.terrain.append(elements.brick);
                    elements.terrain.append(elements.ball);
                    elements.terrain.append(elements.racket);
                    elements.terrain_wrapper.append(elements.terrain);
                    elements.container.append(elements.terrain_wrapper);
                    elements.container.append(elements.game_board);
                    elements.game_board.append(elements.score_wrapper);
                    elements.score_wrapper.append(elements.h3_score);
                    elements.score_wrapper.append(elements.score);
                    elements.score_wrapper.append(elements.h3_balls);
                    elements.score_wrapper.append(elements.balls);
                    elements.score_wrapper.append(elements.h3_high_score);
                    elements.score_wrapper.append(elements.high_score);
                    elements.score_wrapper.append(elements.h3_keyboard);
                    elements.score_wrapper.append(elements.instructions);
                    elements.score_wrapper.append(elements.play_control);
                    elements.container.append(elements.controls);
                    obj.append(elements.container);
                },
                update_board: function () {
                    $('#score').val(this.score);
                    $('#high_score').val(this.high_score);
                    $('#balls').val(this.balls);
                },
                start: function () {
                    game.playing = true; // flag for listeners
                    racket.drag();  // set the racket draggable
                    $('#game_msg').text(''); // clear game messages
                    $('#play_control').val('Pause'); // activate pause button
                    this.interval_ball = setInterval(function () { // ball's movement handler
                        ball.move();
                    }, this.interval_ball_ms);
                },
                stop: function () {
                    clearInterval(game.interval_controll);
                    clearInterval(game.interval_ball);
                    clearInterval(game.interval_racket);
                    game.playing = false;
                },
                paused: function () {
                    game.stop();
                    $('#game_msg').text('PAUSED'); // display game message
                    $('#play_control').val('Start'); // activate pause button
                },
                newball: function () {
                    game.stop();
                    $('#game_msg').text('READY'); // display game message
                    $('#play_control').val('Start'); // activate pause button
                    game.balls--; // loose one ball
                    game.update_board();  // update board info
                    racket.size('normal');  // restore racket size
                    ball.reset(); // restore initial ball's position
                    game.disable_spacebar = false; // activate spacebar again
                },
                game_over: function () {
                    game.stop();  // remove keyboard event listeners
                    game.playing = false;
                    $('#game_msg').text('GAME OVER'); // display game message
                    $('#ball').hide('fast');  // hide the ball until new game
                    $('#racket').hide(); // hide the racket until new game starts
                    $('#play_control').val('Start').attr('disabled', true); // disable Start button until next game is prepared
                    setTimeout(function () { // display GAME OVER message for three seconds
                        racket.size('normal'); // restore racket size
                        ball.reset(); // restore initial ball's position
                        $('#ball, #racket').show(); // show ball and racket
                        $('#play_control').attr('disabled', false); // activate Start button
                        $('#game_msg').text('READY'); // display game message
                        if (game.score > game.high_score) {
                            game.high_score = game.score;
                            helper.set_cookie('arkanoid_high_score', game.high_score, 365, '/');
                        }
                        game.balls = 3; // initialize balls for new game
                        game.level = 1; // play the game from the beginning
                        game.score = this.broken_bricks = 0; // initialize game vars for new game
                        game.update_board(); // update board info
                        bricks.init();  // set up game bricks again
                        game.disable_spacebar = false; // activate spacebar again
                    }, 3000);
                },
                new_level: function () {
                    game.stop();
                    $('#play_control').val('Start'); //set Start button for next level
                    game.level++; // next level
                    if (game.level > 4) game.level = 1; // recycle levels
                    game.interval_ball_ms -= 1; // speed up ball
                    game.interval_racket_ms -= 1; // speed up racket
                    setTimeout(function () {
                        ball.reset(); // restore initial ball's position
                        $('#game_msg').text('NEXT LEVEL'); // display game message
                        game.broken_bricks = 0;// initialize var for new level
                        bricks.init();  // set up game bricks for next level
                        game.disable_spacebar = false; // activate spacebar again
                    }, 100);
                },
                toggle_play: function () { // handle start and pause game
                    game.playing = !game.playing;
                    if (game.playing) {
                        game.start();
                    } else {
                        game.paused();
                    }
                },
                random: function () { // generate random factor for ball's angle
                    return parseInt(Math.floor((Math.random() * 3) + 1));
                },
                controls: function () {
                    $('#play_control').on('click', game.toggle_play); // event listener for start / pause the game
                    // event listeners for handling keyboard strokes
                    $(document).on('keydown', function (e) {
                        if (e.keyCode == 32) e.preventDefault(); // do not scroll page with space key
                        if (e.keyCode == 37) { // handle left direction of the racket
                            e.preventDefault();
                            if (!game.playing || game.move == "left") return;
                            game.move = "left";
                            clearInterval(game.interval_racket);
                            game.interval_racket = setInterval(function () {
                                racket.move();
                            }, game.interval_racket_ms);
                        }
                        if (e.keyCode == 39) { // handle left direction of the racket
                            e.preventDefault();
                            if (!game.playing || game.move == "right") return;
                            game.move = "right";
                            clearInterval(game.interval_racket);
                            game.interval_racket = setInterval(function () {
                                racket.move();
                            }, game.interval_racket_ms);
                        }
                    });
                    $(document).on('keyup', function (e) { // handle key up event
                        if (e.keyCode == 37 || e.keyCode == 39) { // stop racket's movement
                            game.move = "";
                            clearInterval(game.interval_racket);
                        }
                        if (e.keyCode == 32) { // on space key release
                            e.preventDefault();
                            if(game.disable_spacebar) return;
                            game.toggle_play(); // handle starting / pausing the game
                        }
                    });
                },
            }

            var racket = {
                init: function () {
                    var pixels = (game.racket_size == 'normal') ? '260px' : '241px'; // position of both racket's state
                    if ($('#racket').hasClass('ui-draggable')) $('#racket').draggable('destroy'); // prevent racket from dragging when the game is not playing
                    $('#racket').css('left', pixels); // reset position of racket
                },
                move: function () { //  racket's movement based on current direction
                    if (!game.playing) return;
                    var racket_x = $('#racket').position().left;
                    if (racket_x <= 5) {
                        $('#racket').css('left', '1px');
                    }
                    if (racket_x > game.racket_speed - 1 && game.move == "left") {
                        $('#racket').css('left', (racket_x - game.racket_speed) + 'px');
                    }
                    if (racket_x + $('#racket').width() < game.tw + 10 && game.move == "right") {
                        $('#racket').css('left', (racket_x + game.racket_speed) + 'px');
                    }
                    if (racket_x + $('#racket').width() > 572) {
                        $('#racket').css('left', (game.tw + 10) - $('#racket').width() + 'px');
                    }
                },
                size: function (type) { // handles the size type of the racket
                    type = ('large') ? type : 'normal';
                    if (type == 'large') {
                        game.sounds.bonus.play(); // sound of winning the bonus
                        var elm = $('#racket');
                        var racket_left = elm.position().left;
                        var left_position = 484;
                        if (racket_left > left_position) elm.css('left', left_position + 'px'); // adjust the position before change the size
                        $('#racket .racket_middle').animate({'width': '70px', 'left': this.left - 16}, 300); // set size by animating
                    } else {
                        $('#racket .racket_middle').css('width', '34px'); // restore racket's size
                    }
                    game.racket_size = type; // save state
                },
                drag: function () { // make the racket draggable for touch devices
                    $('#racket').draggable({
                        axis: "x",
                        containment: "parent",
                        drag: function (event, ui) {
                            if (!game.playing) return false; // cancel dragging when game is stopped
                        }
                    });
                },
            }

            var ball = {
                init: function () {
                    this.reset();
                },
                reset: function () {
                    setTimeout(function () {
                        $('#ball').css({'left': '283px', 'top': '341px'}); // set ball to initial position
                    }, 100);
                    game.dir = "upleft"; // set the first direction of the ball
                    racket.init(); // handle the racket
                },
                move: function () {  //  ball's movement based on current direction
                    this.elm = $('#ball');
                    if (game.broken_bricks == game.bricks_count) { // if all bricks have been broken
                        game.new_level(); // start a new level
                    }
                    var position = this.elm.position();
                    var bx = parseInt(position.left);
                    var by = parseInt(position.top);
                    bricks.check(bx, by); // check for any collision with brick
                    var racket_x = parseInt($('#racket').position().left);
                    var racket_width = parseInt($('#racket').width());
                    if ((bx >= game.tw) && (by <= 1)) { // check for collision with wall's top right corner
                        game.dir = "downleft"; // set new direction after bouncing
                        this.elm.css('left', bx + 'px');
                        this.elm.css('top', by + 'px');
                        game.sounds.ball.play(); // play bouncing sound
                    }
                    if ((bx <= 1) && (by <= 1)) { // check for collision with wall's top left corner
                        game.dir = "downright"; // set new direction after bouncing
                        this.elm.css('left', '1px');
                        this.elm.css('top', '1px');
                        game.sounds.ball.play(); // play bouncing sound
                    }
                    if (game.dir == "upleft") { // check for collision with left wall when the direction is up
                        if (bx > 1) {
                            this.elm.css('left', bx - parseInt(game.speed + game.factor) + 'px'); // continue moving
                        } else {
                            game.dir = "upright"; // set new direction after bouncing
                            game.sounds.ball.play(); // play bouncing sound
                        }
                        if (by > 1) {
                            this.elm.css('top', parseInt(by - game.speed) + 'px'); // continue moving
                        } else {
                            game.dir = "downleft"; // set new direction after bouncing
                            game.sounds.ball.play(); // play bouncing sound
                        }
                    }
                    if (game.dir == "downleft") { // check for collision with left wall when the direction is down
                        if (bx > 1) {
                            this.elm.css('left', bx - parseInt(game.speed + game.factor) + 'px'); // continue moving
                        } else {
                            game.dir = "downright"; // set new direction after bouncing
                            game.sounds.ball.play(); // play bouncing sound
                        }
                        if (by < game.th) { // check bottom
                            if (by > 338 && by < 342) { // this is where racket is located, let's see if we have a hit
                                if (((racket_x - 5) < bx) && (bx < (racket_x + (racket_width + 5)))) { // ok we have collision with the racket
                                    this.elm.css('top', '340px'); // fix ball position
                                    game.dir = "upleft"; // set new direction after bouncing
                                    game.factor = 0 - game.random(); // change random factor for bouncing angle
                                    game.sounds.racket.play(); // play racket bouncing sound
                                }
                            }
                            if (by > 368) { // racket missed the ball
                                game.disable_spacebar = true;
                                game.sounds.loose.play(); // play loosing sound
                                setTimeout(function () {
                                    if (game.balls > 1) { // we have balls to continue the game
                                        game.newball();
                                    } else { // that's all folks, game over!
                                        game.game_over();
                                    }
                                }, 500);
                            }
                            this.elm.css('top', by + game.speed + 'px'); // continue with ball's movement
                        }
                    }
                    if (game.dir == "upright") { // check for collision with right wall when the direction is up
                        if (bx < game.tw) {
                            this.elm.css('left', bx + (game.speed + game.factor) + 'px'); // continue moving
                        } else {
                            game.dir = "upleft"; // set new direction after bouncing
                            game.sounds.ball.play(); // play bouncing sound
                        }
                        if (by > 1) {
                            this.elm.css('top', by - game.speed + 'px'); // continue moving
                        } else {
                            game.dir = "downright"; // set new direction after bouncing
                            game.sounds.ball.play(); // play bouncing sound
                        }
                    }
                    if (game.dir == "downright") { // check for collision with right wall when the direction is down
                        if (bx < game.tw) {
                            this.elm.css('left', bx + (game.speed + game.factor) + 'px'); // continue moving
                        } else {
                            game.dir = "downleft"; // set new direction after bouncing
                            game.sounds.ball.play(); // play bouncing sound
                        }
                        if (by < game.th) { // check bottom
                            if (by > 338 && by < 342) { // this is where racket is located, let's see if we have a hit
                                if (((racket_x - 5) < bx) && (bx < (racket_x + (racket_width + 5)))) { // ok we have collision with the racket
                                    this.elm.css('top', '340px'); // fix ball position
                                    game.dir = "upright"; // set new direction after bouncing
                                    game.factor = 0 - game.random(); // change random factor for bouncing angle
                                    game.sounds.racket.play(); // play racket bouncing sound
                                }
                            }
                            if (by > 368) { // racket missed the ball
                                game.playing = false;
                                game.sounds.loose.play(); // play loosing sound
                                setTimeout(function () {
                                    if (game.balls > 1) { // we have balls to continue the game
                                        game.newball();
                                    } else { // that's all folks, game over!
                                        game.game_over();
                                    }
                                }, 500);
                            }
                            this.elm.css('top', by + game.speed + 'px'); // continue with ball's movement
                        }
                    }
                },
                bonus: function () {
                    game.balls++; // get bonus ball
                    game.bonus_ball = 1; // bonus has been given flag
                    setTimeout(function () {
                        $('#game_msg').text('EXTRA BALL'); // display game message
                        setTimeout(function () {
                            $('#game_msg').text('');  // clear game messages
                        }, 2000);
                        game.sounds.win_ball.play(); // play bonus ball sound
                    }, 400);
                    game.update_board(); // update board info
                }
            }

            var bricks = {
                    colors: { // 3d colors for thew bricks
                        'red': {
                            'color': '#841e1e',
                            'light': '#b24c4c',
                            'dark': '#660000',
                        },
                        'purple': {
                            'color': '#7d2572',
                            'light': '#ab53a0',
                            'dark': '#5f0754',
                        },
                        'blue': {
                            'color': '#1e5984',
                            'light': '#4c87b2',
                            'dark': '#003b66',
                        },
                        'darkcyan': {
                            'color': '#2b626a',
                            'light': '#599098',
                            'dark': '#0d444c',
                        },
                        'green': {
                            'color': '#1e841e',
                            'light': '#4cb24c',
                            'dark': '#026002',
                        },
                        'gold': {
                            'color': '#7f8066',
                            'light': '#adae94',
                            'dark': '#52533a',
                        }
                    },
                    levels: { //brick coordinates for the four levels
                        '1': {
                            1: {x: 29, y: 33, color: 'red'},
                            2: {x: 77, y: 33, color: 'red'},
                            3: {x: 125, y: 33, color: 'red'},
                            4: {x: 173, y: 33, color: 'red'},
                            5: {x: 221, y: 33, color: 'red'},
                            6: {x: 269, y: 33, color: 'red'},
                            7: {x: 317, y: 33, color: 'red'},
                            8: {x: 365, y: 33, color: 'red'},
                            9: {x: 413, y: 33, color: 'red'},
                            10: {x: 461, y: 33, color: 'red'},
                            11: {x: 509, y: 33, color: 'red'},
                            12: {x: 77, y: 65, color: 'purple'},
                            13: {x: 125, y: 65, color: 'purple'},
                            14: {x: 173, y: 65, color: 'purple'},
                            15: {x: 221, y: 65, color: 'purple'},
                            16: {x: 269, y: 65, color: 'purple'},
                            17: {x: 317, y: 65, color: 'purple'},
                            18: {x: 365, y: 65, color: 'purple'},
                            19: {x: 413, y: 65, color: 'purple'},
                            20: {x: 461, y: 65, color: 'purple'},
                            21: {x: 125, y: 97, color: 'blue'},
                            22: {x: 173, y: 97, color: 'blue'},
                            23: {x: 221, y: 97, color: 'blue'},
                            24: {x: 269, y: 97, color: 'blue'},
                            25: {x: 317, y: 97, color: 'blue'},
                            26: {x: 365, y: 97, color: 'blue'},
                            27: {x: 413, y: 97, color: 'blue'},
                            28: {x: 172, y: 129, color: 'darkcyan'},
                            29: {x: 220, y: 129, color: 'darkcyan'},
                            30: {x: 268, y: 129, color: 'darkcyan'},
                            31: {x: 316, y: 129, color: 'darkcyan'},
                            32: {x: 364, y: 129, color: 'darkcyan'},
                            33: {x: 220, y: 161, color: 'green'},
                            34: {x: 268, y: 161, color: 'green'},
                            35: {x: 316, y: 161, color: 'green'},
                            36: {x: 268, y: 193, color: 'gold'},
                        },
                        '2': {
                            1: {x: 77, y: 33, color: 'red'},
                            2: {x: 125, y: 33, color: 'red'},
                            3: {x: 173, y: 33, color: 'red'},
                            4: {x: 221, y: 33, color: 'red'},
                            5: {x: 269, y: 33, color: 'red'},
                            6: {x: 317, y: 33, color: 'red'},
                            7: {x: 365, y: 33, color: 'red'},
                            8: {x: 413, y: 33, color: 'red'},
                            9: {x: 461, y: 33, color: 'red'},
                            10: {x: 125, y: 65, color: 'red'},
                            11: {x: 413, y: 65, color: 'red'},
                            12: {x: 221, y: 65, color: 'purple'},
                            13: {x: 269, y: 65, color: 'purple'},
                            14: {x: 317, y: 65, color: 'purple'},
                            15: {x: 77, y: 129, color: 'purple'},
                            16: {x: 221, y: 129, color: 'purple'},
                            17: {x: 317, y: 129, color: 'purple'},
                            18: {x: 461, y: 129, color: 'purple'},
                            19: {x: 77, y: 153, color: 'purple'},
                            20: {x: 461, y: 153, color: 'purple'},
                            21: {x: 173, y: 65, color: 'blue'},
                            22: {x: 365, y: 65, color: 'blue'},
                            23: {x: 173, y: 97, color: 'blue'},
                            24: {x: 269, y: 97, color: 'blue'},
                            25: {x: 365, y: 97, color: 'blue'},
                            26: {x: 125, y: 153, color: 'blue'},
                            27: {x: 413, y: 153, color: 'blue'},
                            28: {x: 124, y: 129, color: 'darkcyan'},
                            29: {x: 172, y: 129, color: 'darkcyan'},
                            30: {x: 268, y: 129, color: 'darkcyan'},
                            31: {x: 364, y: 129, color: 'darkcyan'},
                            32: {x: 412, y: 129, color: 'darkcyan'},
                            33: {x: 220, y: 97, color: 'green'},
                            34: {x: 316, y: 97, color: 'green'},
                            35: {x: 268, y: 161, color: 'green'},
                            36: {x: 268, y: 193, color: 'gold'},
                        },
                        '3': {
                            1: {x: 29, y: 33, color: 'red'},
                            2: {x: 221, y: 33, color: 'red'},
                            3: {x: 269, y: 33, color: 'red'},
                            4: {x: 317, y: 33, color: 'red'},
                            5: {x: 509, y: 33, color: 'red'},
                            6: {x: 29, y: 65, color: 'red'},
                            7: {x: 509, y: 65, color: 'red'},
                            8: {x: 29, y: 97, color: 'red'},
                            9: {x: 509, y: 97, color: 'red'},
                            10: {x: 29, y: 129, color: 'red'},
                            11: {x: 509, y: 129, color: 'red'},
                            12: {x: 77, y: 65, color: 'purple'},
                            13: {x: 125, y: 65, color: 'purple'},
                            14: {x: 173, y: 65, color: 'purple'},
                            15: {x: 221, y: 65, color: 'purple'},
                            16: {x: 269, y: 65, color: 'purple'},
                            17: {x: 317, y: 65, color: 'purple'},
                            18: {x: 365, y: 65, color: 'purple'},
                            19: {x: 413, y: 65, color: 'purple'},
                            20: {x: 461, y: 65, color: 'purple'},
                            21: {x: 125, y: 97, color: 'blue'},
                            22: {x: 269, y: 97, color: 'blue'},
                            23: {x: 413, y: 97, color: 'blue'},
                            24: {x: 125, y: 129, color: 'blue'},
                            25: {x: 413, y: 129, color: 'blue'},
                            26: {x: 125, y: 161, color: 'blue'},
                            27: {x: 413, y: 161, color: 'blue'},
                            28: {x: 172, y: 129, color: 'darkcyan'},
                            29: {x: 220, y: 129, color: 'darkcyan'},
                            30: {x: 268, y: 129, color: 'darkcyan'},
                            31: {x: 316, y: 129, color: 'darkcyan'},
                            32: {x: 364, y: 129, color: 'darkcyan'},
                            33: {x: 220, y: 161, color: 'green'},
                            34: {x: 268, y: 161, color: 'green'},
                            35: {x: 316, y: 161, color: 'green'},
                            36: {x: 268, y: 193, color: 'gold'},
                        },
                        '4': {
                            1: {x: 269, y: 9, color: 'red'},
                            2: {x: 29, y: 33, color: 'red'},
                            3: {x: 509, y: 33, color: 'red'},
                            4: {x: 29, y: 65, color: 'red'},
                            5: {x: 509, y: 65, color: 'red'},
                            6: {x: 29, y: 97, color: 'red'},
                            7: {x: 509, y: 97, color: 'red'},
                            8: {x: 29, y: 129, color: 'red'},
                            9: {x: 509, y: 129, color: 'red'},
                            10: {x: 29, y: 161, color: 'red'},
                            11: {x: 509, y: 161, color: 'red'},
                            12: {x: 125, y: 33, color: 'purple'},
                            13: {x: 221, y: 33, color: 'purple'},
                            14: {x: 317, y: 33, color: 'purple'},
                            15: {x: 413, y: 33, color: 'purple'},
                            16: {x: 77, y: 65, color: 'purple'},
                            17: {x: 173, y: 65, color: 'purple'},
                            18: {x: 269, y: 65, color: 'purple'},
                            19: {x: 365, y: 65, color: 'purple'},
                            20: {x: 461, y: 65, color: 'purple'},
                            21: {x: 77, y: 97, color: 'blue'},
                            22: {x: 269, y: 97, color: 'blue'},
                            23: {x: 461, y: 97, color: 'blue'},
                            24: {x: 77, y: 129, color: 'blue'},
                            25: {x: 461, y: 129, color: 'blue'},
                            26: {x: 77, y: 161, color: 'blue'},
                            27: {x: 461, y: 161, color: 'blue'},
                            28: {x: 172, y: 129, color: 'darkcyan'},
                            29: {x: 268, y: 129, color: 'darkcyan'},
                            30: {x: 364, y: 129, color: 'darkcyan'},
                            31: {x: 220, y: 161, color: 'darkcyan'},
                            32: {x: 316, y: 161, color: 'darkcyan'},
                            33: {x: 220, y: 129, color: 'green'},
                            34: {x: 316, y: 129, color: 'green'},
                            35: {x: 268, y: 161, color: 'green'},
                            36: {x: 268, y: 193, color: 'gold'},
                        }
                    },
                    init: function () {
                        game.level = game.level || 1; // set level
                        $('#terrain_wrapper').css('background-color', game.terrain_colors[game.level]); // set the level's background color
                        this.populate(); // place the bricks
                        ball.init(); // initialize the ball
                    },
                    populate: function () {
                        game.level = game.level || 1; // set level
                        var terrain = $('#terrain');
                        $('.clone').remove(); // remove bricks from previous level cause they still  exist outside the scene
                        var brick_prototype = $('.brick').clone(); // create a clone of  the prototype brick
                        var brick, bg_color, light_color, dark_color;
                        for (i in this.levels[game.level]) { // loop to place all bricks to the corresponding level's positions
                            brick = brick_prototype.clone(); // create new brick
                            brick.attr('id', 'brick' + i).addClass('clone'); // add id and class attributes
                            bg_color = this.colors[this.levels[game.level][i].color].color;
                            light_color = this.colors[this.levels[game.level][i].color].light;
                            dark_color = this.colors[this.levels[game.level][i].color].dark;
                            brick.css({ // set colors and positioning
                                'display': 'block',
                                'left': this.levels[game.level][i].x,
                                'top': this.levels[game.level][i].y,
                                'background-color': bg_color,
                                'border-top-color': light_color,
                                'border-right-color': light_color,
                                'border-bottom-color': dark_color,
                                'border-left-color': dark_color,
                            });
                            terrain.append(brick); // place the brick to the scene
                        }
                    },
                    check: function (bx, by) { // check for ball's collision with any of the remaining bricks
                        var id = 1; // starting id index
                        var position, elm, choice;
                        while (id <= game.bricks_count) {
                            elm = $('#brick' + id);
                            position = elm.position(); // get position of current brick
                            cx = position.left; // left position
                            cy = position.top; // top position
                            cw = elm.width(); //brick's width
                            ch = elm.height(); //brick's height
                            if ((bx + 2 >= cx || bx - 2 >= cx)) { //  brick's left side in x-axis is positive
                                if ((bx + 2 <= (cx + cw)) || (bx - 2 <= (cx + cw))) { //  brick's right side in x-axis is positive
                                    if (by + 2 >= cy || by - 2 >= cy) { // brick's top side in y-axis is positive
                                        if ((by + 2 <= (cy + ch)) || (by - 2 <= (cy + ch))) { //  brick's bottom side in y-axis is positive
                                            elm.css('left', '-2000px'); // we have collision, remove this brick from the scene
                                            game.broken_bricks++; // increase broken bricks
                                            game.sounds.brick.cloneNode(true).play(); // play brick's explosion sound
                                            if (id == game.bricks_count)  racket.size('large'); // give racket bonus if its a gold brick
                                            game.score += 50; // increase score;
                                            if (game.score > 9999 && game.bonus_ball == 0) ball.bonus(); // give ball bonus if the score is greater than 9999 and no other bonus has been given so far
                                            // change direction accordingly
                                            switch(game.dir) {
                                                case "upleft":
                                                    game.dir = "downleft";
                                                    break;
                                                case "upright":
                                                    game.dir = "downright";
                                                    break;
                                                case "downleft":
                                                    game.dir = "upleft";
                                                    break;
                                                case "downright":
                                                    game.dir = "upright";
                                                    break;
                                            }
                                            game.update_board(); // update board info
                                        }
                                    }
                                }
                            }
                            id++; // next brick id index
                        }
                    },
                },
                helper = {
                    set_cookie: function (name, value, expires, path, domain, secure) {
                        var today = new Date();
                        today.setTime(today.getTime());
                        if (expires)expires = expires * 1000 * 60 * 60 * 24;
                        var expires_date = new Date(today.getTime() + (expires));
                        document.cookie = name + "=" + escape(value) +
                            ((expires) ? ";expires=" + expires_date.toGMTString() : "") +
                            ((path) ? ";path=" + path : "") +
                            ((domain) ? ";domain=" + domain : "") +
                            ((secure) ? ";secure" : "" );
                    },
                    get_cookie: function (check_name) {
                        var a_all_cookies = document.cookie.split(';');
                        var a_temp_cookie = '';
                        var cookie_name = '';
                        var cookie_value = '';
                        var b_cookie_found = false;
                        for (i = 0; i < a_all_cookies.length; i++) {
                            a_temp_cookie = a_all_cookies[i].split('=');
                            cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
                            if (cookie_name == check_name) {
                                b_cookie_found = true;
                                if (a_temp_cookie.length > 1) {
                                    cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
                                }
                                return cookie_value;
                                break;
                            }
                            a_temp_cookie = null;
                            cookie_name = '';
                        }
                        if (!b_cookie_found) {
                            return null;
                        }
                    }
                }
            game.init(); // start game
        }
    });
})(jQuery);



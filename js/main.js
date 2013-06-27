/*---------------------------------------------------------------
     ______  __  __   ______   __       __   ______
    /\  == \/\ \/\ \ /\  == \ /\ \     /\ \ /\  ___\
    \ \  _-/\ \ \_\ \\ \  __< \ \ \____\ \ \\ \ \____
     \ \_\   \ \_____\\ \_____\\ \_____\\ \_\\ \_____\
      \/_/    \/_____/ \/_____/ \/_____/ \/_/ \/_____/
     ______   ______   __   ______   __   __   ______   ______
    /\  ___\ /\  ___\ /\ \ /\  ___\ /\ "-.\ \ /\  ___\ /\  ___\
    \ \___  \\ \ \____\ \ \\ \  __\ \ \ \-.  \\ \ \____\ \  __\
     \/\_____\\ \_____\\ \_\\ \_____\\ \_\\"\_\\ \_____\\ \_____\
      \/_____/ \/_____/ \/_/ \/_____/ \/_/ \/_/ \/_____/ \/_____/

                        // publicscience.co //
---------------------------------------------------------------*/

(function() {

    // On load, setup the audio.
    window.addEventListener('load', function() {
        window.aural = new Aural();
        //window.aural.play();
    }, false);

    // Audio controls
    $('.controls').on('click', '.icon-play', function() {
        window.aural.play();
        $(this)
            .removeClass('icon-play')
            .addClass('icon-pause');
    });
    $('.controls').on('click', '.icon-pause', function() {
        window.aural.pause();
        $(this)
            .removeClass('icon-pause')
            .addClass('icon-play');
    });

    // Nav
    $('[data-target=releases]').on('click', function(e) {
        e.preventDefault();
        $('.releases').fadeToggle();
        return false;
    });
    $('[data-target=activity]').on('click', function(e) {
        e.preventDefault();
        $('.activity').fadeToggle();
        return false;
    });
    $('.icon-close').on('click', function() {
        $(this).parent().fadeToggle();
    });

    // Sampha logo/contact reveal
    $('.icon-logo').on('mouseenter', function() {
        $(this).closest('li').fadeOut();
        $('.contact').animate({
            bottom: 0
        });
    });
    $('.contact').on('mouseleave', function() {
        $('.icon-logo').closest('li').fadeIn();
        $('.contact').animate({
            bottom: '-9em'
        });
    });

    // External links pause the track.
    $('a:not([data-target])').on('click', function() {
        $('.icon-pause').click();
    });


    // Visual elements (i.e. canvas)
    var Visual = (function() {

        function Visual() {
            var ø = this;

            // Setup canvas.
            ø.canvas = document.getElementById('stage'),
            ø.ctx = ø.canvas.getContext('2d'),

            // Number of frequency bins/sections.
            ø.binLength = 4,

            // Rotation angle.
            ø.theta = 0,

            // Keep track of data.
            ø.points = [],
            ø.magnitudes = [],

            // Keep track of rotated points.
            // This will be updated quite often.
            ø.pointsCache = [],

            // Set up the images.
            ø.baseImg = document.createElement('IMG'),
            ø.colorImg = document.createElement('IMG');
            ø.baseImg.src = "img/base.jpg";
            ø.colorImg.src = "img/color.jpg";

            // Setup the points.
            ø.start = new Point(ø.canvas.width/2, -50),
            ø.end = new Point(ø.canvas.width/2, ø.canvas.height);

            // Get the proper requestAnimationFrame.
            // Thanks http://bit.ly/13vtjf7
            var vendors = ['ms','moz','webkit','o'];
            for (var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
                window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            }

            // Setup devicePixelRatio.
            window.devicePixelRatio = window.devicePixelRatio || 1;

            // Listen for window resize
            // and resize the canvas.
            window.addEventListener('resize', ø.calibrate.bind(ø), false);

            // Bind polygon shapes to horizontal mouse movement.
            $(window).on('mousemove', function(e){
                // Calculate theta.
                var mouse_x = e.pageX * window.devicePixelRatio;
                ø.start.x = e.pageX * window.devicePixelRatio,
                ø.end.x = ø.canvas.width - ø.start.x;
                ø.theta = Math.atan((mouse_x - (ø.canvas.width/2)) / (ø.canvas.height/2));

                ø.setupPoints();
                ø.draw();
            });


            // When the image is ready.
            ø.baseImg.onload = function() {
                ø.calibrate();
            }
        }

        // Rotate all points.
        Visual.prototype.rotatePoints = function(theta) {
            var ø = this;

            // Rotate all points.
            for (var i = 0; i < ø.points.length; i++) {
                ø.pointsCache[i] = ø.rotatePoint(ø.points[i], theta);
            }
        }

        // Setup points.
        Visual.prototype.setupPoints = function() {
            var ø = this,
                dist, diff;
            ø.start.y = -50;
            ø.end.y = ø.canvas.height;
            dist = Math.sqrt( Math.pow(ø.end.x - ø.start.x,2) + Math.pow(ø.end.y - ø.start.y, 2) ),
            diff = dist - ø.canvas.height;
            ø.numBins = dist + (1.2*diff)/ø.binLength;

            ø.points = [];
            ø.pointsCache = [];
            for (var i = 0; i < ø.numBins; i++) {
                ø.points.push( new Point() );
            }

            ø.start.y = -diff/1.2;
            ø.end.y = ø.canvas.height + diff/1.2;

            // Setup the points.
            for (var i = 0; i < ø.points.length; i++) {
                var p = ø.points[i],
                    _p = ø.points[i-1] || ø.start;
                p.x = ø.canvas.width/2;
                p.y = _p.y + ø.binLength;
            }

            ø.rotatePoints(ø.theta);
        }

        // Setup the canvas for retina support.
        Visual.prototype.retinatize = function() {
            var ø    = this,
                el   = $('#stage'),
                el_w = ø.canvas.width,
                el_h = ø.canvas.height;
            el.attr('width', el_w * window.devicePixelRatio);
            el.attr('height', el_h * window.devicePixelRatio);
            el.css('width', el_w);
            el.css('height', el_h);
        }

        // Setup the canvas for retina support.
        Visual.prototype.calibrate = function() {
            var ø = this,
                canvas = ø.canvas;

            // Set the canvas to full window.
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Re-retinatize the canvas.
            ø.retinatize();

            // Adjust the end point's y position.
            ø.end.y = canvas.height;

            // Setup the points.
            ø.setupPoints();

            // Draw to reflect calibration.
            ø.draw();
        }

        // Rotate a point around an origin.
        Visual.prototype.rotatePoint = function(point, angle) {
            var ø      = this,
                origin = new Point(ø.canvas.width/2, ø.canvas.height/2),
                cos    = Math.cos(angle),
                sin    = Math.sin(angle),
                dif_x  = point.x - origin.x,
                dif_y  = point.y - origin.y,
                new_x  = (cos * dif_x) - (sin * dif_y) + origin.x,
                new_y  = (sin * dif_x) + (cos * dif_y) + origin.y;

            return new Point(new_x, new_y);
        }

        Visual.prototype.draw = function() {
            var ø      = this,
                ctx    = ø.ctx,
                canvas = ø.canvas,
                theta  = ø.theta,
                mags   = ø.magnitudes,
                pCache = ø.pointsCache;

            // Clear the canvas.
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the base image.
            ctx.drawImage(ø.baseImg, 0,0, canvas.width, canvas.height);

            // To restore non-clipped state.
            ctx.save();

            // Draw the soundwave.
            ctx.beginPath();
            ctx.moveTo(ø.start.x, ø.start.y);
            for (var i = 0; i < pCache.length + 1; i++) {
                var _p  = pCache[i-1] || ø.start,
                    p   = pCache[i] || ø.end,
                    mag = mags[i] || mags[i-1],
                    x_len = mag,
                    _ctrl = {}, ctrl = {}, angle;

                // Straighten the beginning and ending segments.
                if ( _p === ø.start || p === ø.end ) {
                    x_len = 0,
                    _ctrl.y = _p.y,
                    ctrl.y = p.y;
                    _ctrl.x = _p.x,
                    ctrl.x = p.x;
                } else {
                    // Theta needs to be shifted by π/2,
                    // and then our target angle is
                    // π/2 - the adjusted theta.
                    angle = (Math.PI/2) - (ø.theta + (Math.PI/2)),
                    _ctrl.y = _p.y - (Math.tan(angle) * x_len),
                    ctrl.y = p.y - (Math.tan(angle) * x_len);
                    _ctrl.x = _p.x + x_len,
                    ctrl.x = p.x + x_len;
                }

                // Draw the curve.
                ctx.bezierCurveTo(_ctrl.x, _ctrl.y,
                                  ctrl.x, ctrl.y,
                                  p.x, p.y);
            }

            for (var i = pCache.length; i >= 0; i--) {
                var _p  = pCache[i] || ø.end,
                    p   = pCache[i-1] || ø.start,
                    mag = mags[i] || mags[i-1],
                    x_len = mag,
                    _ctrl = {}, ctrl = {}, angle;

                // Straighten the beginning and ending segments.
                if ( p === ø.start || _p === ø.end ) {
                    x_len = 0,
                    _ctrl.y = _p.y,
                    ctrl.y = p.y;
                } else {
                    // Theta needs to be shifted by π/2,
                    // and then our target angle is
                    // π/2 - the adjusted theta.
                    angle = (Math.PI/2) - (ø.theta + (Math.PI/2)),
                    _ctrl.y = _p.y + (Math.tan(angle) * x_len),
                    ctrl.y = p.y + (Math.tan(angle) * x_len);
                }

                    _ctrl.x = _p.x - x_len,
                    ctrl.x = p.x - x_len;
                // Draw the curve.
                ctx.bezierCurveTo(_ctrl.x, _ctrl.y,
                                  ctrl.x, ctrl.y,
                                  p.x, p.y);
            }
            ctx.closePath();
            ctx.clip();

            // Draw the image.
            ctx.drawImage(ø.colorImg, 0,0, canvas.width, canvas.height);

            // Restores non-clipped state while preserving
            // the rendered clipping.
            ctx.restore();
        }

        return Visual;

    })();


    // Audio elements (i.e. music)
    var Aural = (function() {

        function Aural() {
            var ø    = this;
            ø.audio  = document.getElementById('audio');
            ø.visual = new Visual();

            // Try to setup the AudioContext, if supported.
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (window.AudioContext == null) {
                alert("The Web Audio API is not yet supported by your browser. Please use the latest Chrome or Safari.");
                return false;
            }

            // Create the audio context, analyser,
            // and source from the <audio> element.
            var audioCtx = new AudioContext(),
                src      = audioCtx.createMediaElementSource(ø.audio);
            ø.analyser   = audioCtx.createAnalyser();

            // Connect src ==> analyser,
            // i.e. src output into analyser's input.
            src.connect(ø.analyser);

            // Connect analyser ==> output,
            // i.e. analyser output to the audio context's destination,
            // i.e. the speakers.
            ø.analyser.connect(audioCtx.destination);

            // Start the frequency detection and visualization.
            ø.visualize();
        }

        Aural.prototype.visualize = function() {
            var ø = this;

            // Call this on each new frame.
            window.requestAnimationFrame(ø.visualize.bind(ø));

            // Get frequency data
            var freqByteData = new Uint8Array(ø.analyser.frequencyBinCount);
            ø.analyser.getByteFrequencyData(freqByteData);
            for (var i = 0; i < ø.visual.numBins; i++) {
                ø.visual.magnitudes[i] = freqByteData[i];
            }

            // Re-draw.
            ø.visual.draw();
        }

        Aural.prototype.play = function() {
            this.audio.play();
        }

        Aural.prototype.pause = function() {
            this.audio.pause();
        }

        return Aural;
    })();


    // Point object
    function Point(x, y) {
        this.x = x || 0,
        this.y = y || 0;
    }


})();

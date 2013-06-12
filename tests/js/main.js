(function() {

    // On load, setup the audio.
    window.addEventListener('load', function() {
        window.aural = new Aural();
    }, false);


    // Visual elements (i.e. canvas)
    var Visual = (function() {

        function Visual() {
            var ø = this;

            // Setup canvas.
            ø.canvas = document.getElementById('stage'),
            ø.ctx = ø.canvas.getContext('2d'),

            // Number of frequency bins/sections.
            ø.numBins = 10,

            // Keep track of data.
            ø.points = [],
            ø.magnitudes = [],

            // Keep track of rotated points.
            // This will be updated quite often.
            ø.pointsCache = [],

            // Set up the images.
            ø.leftImg = document.createElement('IMG'),
            ø.rightImg = document.createElement('IMG');
            ø.leftImg.src = "img/left.jpg";
            ø.rightImg.src = "img/right.jpg";

            // Setup the points.
            ø.start = new Point(canvas.width/2, 0),
            ø.end = new Point(canvas.width/2, canvas.height);
            for (var i = 0; i < ø.numBins; i++) {
                points.push( new Point() );
            }

            // Get the proper requestAnimationFrame.
            // Thanks http://bit.ly/13vtjf7
            var vendors = ['ms','moz','webkit','o'];
            for (var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
                window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            }

            // Setup devicePixelRatio.
            window.devicePixelRatio = window.devicePixelRatio || 1

            // Listen for window resize
            // and resize the canvas.
            window.addEventListener('resize', ø.calibrate.bind(ø), false);

            // Bind polygon shapes to horizontal mouse movement.
            $(window).on('mousemove', function(e){
                // Gets a little fuzzy around 0,
                // so force it down.
                //if ( ø.b.x <= 3 ) {
                    //ø.b.x = 0;
                //}

                // Calculate theta.
                var mouse_x = e.pageX * window.devicePixelRatio,
                    theta = Math.atan( (mouse_x - (ø.canvas.width/2)) / (ø.canvas.height/2));
                ø.rotatePoints(theta);
                ø.draw();
            });

            // When the image is ready.
            ø.leftImg.onload = function() {
                ø.calibrate();
            }
        }


        // Rotate all points.
        Visual.prototype.rotatePoints = function(theta) {
            var ø = this;

            // Rotate all points.
            for (var i = 0; i < ø.points.length + 2; i++) {
                switch(i) {
                    // Starting point.
                    case 1:
                        ø.pointsCache[i] = ø.rotatePoint(ø.start, theta);
                        break;
                    // Ending point.
                    case points.length + 1:
                        ø.pointsCache[i] = ø.rotatePoints(ø.end, theta);
                        break;
                    // All other points.
                    default:
                        ø.pointsCache[i] = ø.rotatePoint(ø.points[i] - 1, theta);
                }
            }
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

            // Calculate the length of each bin/section.
            var binLength = canvas.height/ø.numBins;

            // Setup the points.
            for (var i = 0; i < ø.points.length; i++) {
                var p = points[i],
                    _p = points[i-1] || ø.start;
                p.x = ø.canvas.width/2;
                p.y = _p.y + binLength;
            }

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
                new_y  = (sin * dif_x) + (cos * dif_y) + origin.y,

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

            // To restore non-clipped state.
            ctx.save();

            // Note: the polygons are drawn: start => end => corner => corner

            // Rotate the points.
            var start = pCache[0],
                end   = pCache[pCache.length - 1];

            // Right
            // Draw the clipping polygon.
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            for (var i = 1; i < pCache.length - 1; i++) {
                var p  = pCache[i],

                    // Get the next point
                    // (which may be the end point).
                    _p = pCache[i+1] || end;

                // Draw the curve.
                ctx.bezierCurveTo(p.x + mags[i], p.y,
                                  _p.x + mags[i], _p.y,
                                  _p.x, _p.y);
            }
            ctx.lineTo(0, canvas.height);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.clip();

            // Draw the image.
            ctx.drawImage(ø.leftImg, 0,0, canvas.width, canvas.height);

            // Restores non-clipped state while preserving
            // the rendered clipping.
            ctx.restore();
            // Re-save the state.
            ctx.save();

            // Left
            // Draw the clipping polygon.
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            for (var i = 1; i < pCache.length - 1; i++) {
                var p  = pCache[i],

                    // Get the next point
                    // (which may be the end point).
                    _p = pCache[i+1] || end;

                // Draw the curve.
                ctx.bezierCurveTo(p.x - mags[i], p.y,
                                  _p.x - mags[i], _p.y,
                                  _p.x, _p.y);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(canvas.width, 0);
            ctx.closePath();
            ctx.clip();

            // Draw the image.
            ctx.drawImage(ø.rightImg, 0,0, canvas.width, canvas.height);

            // Restores non-clipped state while preserving
            // the rendered clipping.
            ctx.restore();
        }

        return Visual;

    })();


    // Audio elements (i.e. music)
    var Aural = (function() {

        function Aural() {
            var ø = this;
            ø.audio = document.getElementById('audio');
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
                src = audioCtx.createMediaElementSource(ø.audio);
            ø.analyser = audioCtx.createAnalyser();

            // Connect src ==> analyser,
            // i.e. src output into analyser's input.
            src.connect(ø.analyser);

            // Connect analyser ==> output,
            // i.e. analyser output to the audio context's destination,
            // i.e. the speakers.
            ø.analyser.connect(audioCtx.destination);

            // Play the <audio> element.
            //ø.audio.play();

            // Start the visualization.
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

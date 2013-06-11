(function() {

    // On load, setup the audio.
    window.addEventListener('load', function() {
        window.aural = new Aural();
    }, false);


    // Visual elements (i.e. canvas)
    var Visual = (function() {

        function Visual() {
            var ø = this;

            ø.canvas = document.getElementById('stage'),
            ø.ctx = ø.canvas.getContext('2d'),
            ø.magnitude = 0,
            ø.theta = 0,

            // The two moving points are a & b
            ø.a = {
                x: ø.canvas.width/2,
                y: 0
            },
            ø.b = {
                x: ø.canvas.width/2,
                y: ø.canvas.height
            };

            // Set up the images.
            ø.leftImg = document.createElement('IMG'),
            ø.rightImg = document.createElement('IMG');
            ø.leftImg.src = "img/left.jpg";
            ø.rightImg.src = "img/right.jpg";

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
            window.addEventListener('resize', ø.resizeCanvas.bind(ø), false);

            // Bind polygon shapes to horizontal mouse movement.
            $(window).on('mousemove', function(e){
                ø.a.x = e.pageX * window.devicePixelRatio,
                ø.b.x = ø.canvas.width - ø.a.x;

                // Gets a little fuzzy around 0,
                // so force it down.
                if ( ø.b.x <= 3 ) {
                    ø.b.x = 0;
                }

                // Calculate new theta.
                ø.theta = Math.atan( (ø.a.x - (ø.canvas.width/2)) / (ø.canvas.height/2));
                ø.draw();
            });

            // When the image is ready.
            ø.leftImg.onload = function() {
                ø.resizeCanvas();
            }
        }


       // Setup the canvas for retina support.
       Visual.prototype.retinatize = function() {
            var ø = this,
                el = $('#stage'),
                el_w = ø.canvas.width,
                el_h = ø.canvas.height;
            el.attr('width', el_w * window.devicePixelRatio);
            el.attr('height', el_h * window.devicePixelRatio);
            el.css('width', el_w);
            el.css('height', el_h);
       }

        Visual.prototype.resizeCanvas = function() {
            var ø = this;

            // Set the canvas to full window.
            ø.canvas.width = window.innerWidth;
            ø.canvas.height = window.innerHeight;

            // Re-retinatize the canvas.
            ø.retinatize();

            // Need to set b's y to be proper:
            ø.b.y = ø.canvas.height;

            // Draw.
            ø.draw();
        }

        // Rotate a point around an origin.
        Visual.prototype.rotatePoint = function(point, angle) {
            var ø = this,
                origin = { x: ø.canvas.width/2, y: ø.canvas.height/2 },
                cos_a = Math.cos(angle),
                sin_a = Math.sin(angle),
                dif_x = point.x - origin.x,
                dif_y = point.y - origin.y,
                new_x = (cos_a * dif_x) - (sin_a * dif_y) + origin.x,
                new_y = (sin_a * dif_x) + (cos_a * dif_y) + origin.y;

            point.x = new_x;
            point.y = new_y;
            return point;
        }

        Visual.prototype.draw = function() {
            var ø = this,
                ctx = ø.ctx,
                canvas = ø.canvas,
                a = ø.a,
                b = ø.b,
                magnitude = ø.magnitude,
                leftImg = ø.leftImg,
                rightImg = ø.rightImg;

            // Clear the canvas.
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // To restore non-clipped state.
            ctx.save();

            // Right
            // Draw the clipping polygon.
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            //ctx.lineTo(a.x, a.y); // make this a bezier
            ctx.bezierCurveTo(canvas.width/2 + (4 * magnitude), canvas.height/2, canvas.width/2, canvas.height/2, a.x, a.y);
            ctx.lineTo(0, 0);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.clip();

            // Draw the image.
            ctx.drawImage(leftImg, 0,0, canvas.width, canvas.height);

            // Restores non-clipped state while preserving
            // the rendered clipping.
            ctx.restore();
            // Re-save the state.
            ctx.save();

            // Left
            // Draw the clipping polygon.
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            //ctx.lineTo(a.x, a.y);
            ctx.bezierCurveTo(canvas.width/2 + (4 * magnitude), canvas.height/2, canvas.width/2, canvas.height/2, a.x, a.y);
            ctx.lineTo(canvas.width, 0);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.clip();

            // Draw the image.
            ctx.drawImage(rightImg, 0,0, canvas.width, canvas.height);

            // Restores non-clipped state while preserving
            // the rendered clipping.
            ctx.restore();

            var start = { x: canvas.width/2, y: 0 },
                end = { x: canvas.width/2, y: canvas.height },
                //start_ctrl = { x: canvas.width/2, y: canvas.height/2 },
                start_ctrl = { x: canvas.width/2 + (2 * magnitude), y: canvas.height/2 },
                end_ctrl = { x: canvas.width/2, y: canvas.height/2 };
            rotatePoint(start, theta);
            rotatePoint(end, theta);

            // Draw the right audio-reactive bezier line.
            //ctx.beginPath();
            //rotatePoint(start_ctrl, theta);
            //rotatePoint(end_ctrl, theta);
            //ctx.moveTo(start.x, start.y);
            //ctx.bezierCurveTo(start_ctrl.x, start_ctrl.y, end_ctrl.x, end_ctrl.y, end.x, end.y);
            //ctx.strokeStyle="#FF0000";
            //ctx.stroke();
            //ctx.closePath();

            // Draw the left audio-reactive bezier line.
            //ctx.beginPath();
            //start_ctrl = { x: canvas.width/2 - (2 * magnitude), y: canvas.height/2 },
            //end_ctrl = { x: canvas.width/2, y: canvas.height/2 };
            //rotatePoint(start_ctrl, theta);
            //rotatePoint(end_ctrl, theta);
            //ctx.moveTo(start.x, start.y);
            //ctx.bezierCurveTo(start_ctrl.x, start_ctrl.y, end_ctrl.x, end_ctrl.y, end.x, end.y);
            //ctx.strokeStyle="#00FF00";
            //ctx.stroke();
            //ctx.closePath();
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
            ø.audio.play();

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

            var numBins = 10;
            for (var i = 0; i < numBins; i++) {
                ø.visual.magnitude = freqByteData[i];

                // Re-draw.
                ø.visual.draw();
            }
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
        this.x = x,
        this.y = y;
    }


})();

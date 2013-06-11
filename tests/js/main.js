(function() {
    // Set up the canvas.
    var canvas = document.getElementById('stage'),
        ctx = canvas.getContext('2d'),
        magnitude = 0,
        theta = 0,

        // The two moving points are a & b
        a = {
            x: canvas.width/2,
            y: 0
        },
        b = {
            x: canvas.width/2,
            y: canvas.height
        };

    // Get the proper requestAnimationFrame.
    // Thanks http://bit.ly/13vtjf7
    var vendors = ['ms','moz','webkit','o'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
        window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
    }

    // On load, setup the audio.
    window.addEventListener('load', function() {
        window.aural = new Aural();
    }, false);

    var Aural = (function() {

        function Aural() {
            this.audio = document.getElementById('audio');

            // Try to setup the AudioContext, if supported.
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (window.AudioContext == null) {
                alert("The Web Audio API is not yet supported by your browser. Please use the latest Chrome or Safari.");
                return false;
            }

            // Create the audio context, analyser,
            // and source from the <audio> element.
            var audioCtx = new AudioContext(),
                src = audioCtx.createMediaElementSource(this.audio);
            this.analyser = audioCtx.createAnalyser();

            // Connect src ==> analyser,
            // i.e. src output into analyser's input.
            src.connect(this.analyser);

            // Connect analyser ==> output,
            // i.e. analyser output to the audio context's destination,
            // i.e. the speakers.
            this.analyser.connect(audioCtx.destination);

            // Play the <audio> element.
            this.audio.play();

            // Start the visualization.
            this.visualize();
        }

        Aural.prototype.visualize = function() {
            // Call this on each new frame.
            window.requestAnimationFrame(this.visualize.bind(this));

            // Get frequency data
            var freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(freqByteData);

            var numBins = 10;
            for (var i = 0; i < numBins; i++) {
                magnitude = freqByteData[i];

                // Re-draw.
                draw();
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

   // Setup the canvas for retina support.
   function retinatize() {
        if ( window.devicePixelRatio ) {
            var el = $('#stage'),
                el_w = canvas.width,
                el_h = canvas.height;
            el.attr('width', el_w * window.devicePixelRatio);
            el.attr('height', el_h * window.devicePixelRatio);
            el.css('width', el_w);
            el.css('height', el_h);
        }
   }

    // Listen for window resize
    // and resize the canvas.
    window.addEventListener('resize', resizeCanvas, false);

    // Set up the images.
    var leftImg = document.createElement('IMG');
    leftImg.src = "img/left.jpg";

    var rightImg = document.createElement('IMG');
    rightImg.src = "img/right.jpg";

    function resizeCanvas() {
        // Set the canvas to full window.
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Re-retinatize the canvas.
        retinatize();

        // Need to set b's y to be proper:
        b.y = canvas.height;

        // Draw.
        draw();
    }


    function draw() {
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

    // Rotate a point around an origin.
    function rotatePoint(point, angle) {
        var origin = { x: canvas.width/2, y: canvas.height/2 },
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

    // Point object
    function Point(x, y) {
        this.x = x,
        this.y = y;
    }

    // When the image is ready.
    leftImg.onload = function() {
        resizeCanvas();
    }

    // Bind polygon shapes to horizontal mouse movement.
    $(window).on('mousemove', function(e){
        a.x = window.devicePixelRatio ? e.pageX * window.devicePixelRatio : e.pageX;
        b.x = canvas.width - a.x;

        // Gets a little fuzzy around 0,
        // so force it down.
        if ( b.x <= 3 ) {
            b.x = 0;
        }

        // Calculate new theta.
        theta = Math.atan( (a.x - (canvas.width/2)) / (canvas.height/2));
            // Interesting...but not right.
            //if ( e.pageX < canvas.width/2 ) {
                //theta = Math.atan(-e.pageX / (canvas.height/2));
            //} else {
                //theta = Math.atan(e.pageX / (canvas.height/2));
            //}

        draw();
    });
})();

(function() {
    // Set up the canvas.
    var canvas = document.getElementById('stage'),
        ctx = canvas.getContext('2d'),

        // The two moving points are a & b
        a = {
            y: 0,
            x: canvas.width/2
        },
        b = {
            y: canvas.height,
            x: canvas.width/2
        };

    // Get the proper requestAnimationFrame.
    // Thanks http://bit.ly/13vtjf7
    var vendors = ['ms','moz','webkit','o'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
        window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
    }

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
                var magnitude = freqByteData[i];
                console.log(magnitude);

                // Update bezier curve.

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
        // Have to draw each side to a separate canvas,
        // then copy and render them together on a master canvas.

        // Clear the canvas.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // To restore non-clipped state.
        ctx.save();

        // Left
        // Draw the clipping polygon.
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(a.x, a.y); // this will become a bezierCurveTo
        //ctx.bezierCurveTo(236, 96, 307, 313, a.x, a.y);
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

        // Right
        // Draw the clipping polygon.
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(a.x, a.y); // this will become a bezierCurveTo
        //ctx.bezierCurveTo(236, 96, 307, 313, a.x, a.y);
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.clip();

        // Draw the image.
        ctx.drawImage(rightImg, 0,0, canvas.width, canvas.height);

        // Restores non-clipped state while preserving
        // the rendered clipping.
        ctx.restore();
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
        draw();
    });
})();

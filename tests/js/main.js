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

        // Draw the polygons.
        // Left
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(a.x, a.y); // this will become a bezierCurveTo
        ctx.lineTo(0, 0);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(leftImg, 0,0, canvas.width, canvas.height);

        // Restores non-clipped state while preserving
        // the rendered clipping.
        ctx.restore();
        // Re-save the state.
        ctx.save();

        // Right
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(a.x, a.y); // this will become a bezierCurveTo
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(rightImg, 0,0, canvas.width, canvas.height);

        // Restores non-clipped state while preserving
        // the rendered clipping.
        ctx.restore();
    }

    // When the image is ready.
    leftImg.onload = function() {
        resizeCanvas();
    }

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

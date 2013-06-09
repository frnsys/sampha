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
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the polygons
        // Left
        ctx.fillStyle = '#DF5475';
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(a.x, a.y); // this will become a bezierCurveTo
        ctx.lineTo(0, 0);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Right
        ctx.fillStyle = '#7D65D7';
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(a.x, a.y); // this will become a bezierCurveTo
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    resizeCanvas();

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

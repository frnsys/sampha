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


    // Retina wizardry!
    if ( window.devicePixelRatio ) {
        console.log(window.devicePixelRatio);
        var el = $('#canvas');
        var elWidth = canvas.width;
        var elHeight = canvas.height;
        el.attr('width', elWidth * window.devicePixelRatio);
        el.attr('height', elHeight * window.devicePixelRatio);
        el.css('width', elWidth);
        el.css('height', elHeight);
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // Listen for window resize
    // and resize the canvas.
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        // Set the canvas to full window.
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Need to set b's y to be proper:
        b.y = canvas.height;

        // Draw.
        draw();
    }

    function draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);



        // Draw the polygons
        ctx.fillStyle = '#DF5475';
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(0, canvas.height);
        ctx.lineTo(0, 0);
        ctx.lineTo(a.x, a.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#7D65D7';
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(a.x, a.y);
        ctx.closePath();
        ctx.fill();
    }

    resizeCanvas();

    $(window).on('mousemove', function(e){
        a.x = e.pageX;
        b.x = canvas.width - a.x;

        // Gets a little fuzzy around 0,
        // so force it down.
        if ( b.x <= 3 ) {
            b.x = 0;
        }
        draw();
    });
})();

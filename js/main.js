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

    var playlist = [
        'without',
        'indecision',
        'what_you_wont_do_for_love'
    ];

    // Also check if the browser is Safari.
    // This is really hacky, but Safari support is REALLY wonky right now.
    var isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;

    function isMobile() {
        // Treat mobile/tablet devices differently.
        var mobileBreakpoint = 768;
        return $(window).width() < mobileBreakpoint
    }

    // On load, setup the audio.
    window.addEventListener('load', function() {
        // Try to setup the AudioContext, if supported.
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext == null) {
            //alert("The Web Audio API is not yet supported by your browser. For the full experience, please use the latest version of Chrome.");
        }
        window.aural = new Aural();
    }, false);


    // Get URL params by names
    // Thx: http://bit.ly/1bE7KiC
    function getParameterByName(url, name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(url);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    // Nav
    $('[data-target=releases]').on('click', function(e) {
        var r = $('.releases');
        e.preventDefault();

        // Toggle release pane
        if ( parseInt(r.css('left'), 10) < 0 ) {
            r.stop().animate({
                'left': 0
            });
        } else {
            r.stop().animate({
                'left': '-400px'
            });
        }

        // Hide activity pane if on mobile
        if ( isMobile() ) {
            $('.activity').animate({
                'right': '-400px'
            });
        }
        return false;
    });
    $('[data-target=activity]').on('click', function(e) {
        var a = $('.activity');
        e.preventDefault();

        // Toggle activity pane
        if ( parseInt(a.css('right'), 10) < 0 ) {
            a.stop().animate({
                'right': 0
            });
        } else {
            a.stop().animate({
                'right': '-400px'
            });
        }

        // Hide releases pane if on mobile
        if ( isMobile() ) {
            $('.releases').animate({
                'left': '-400px'
            });
        }
        return false;
    });
    $('.icon-close').on('click', function() {
        $(this).parent().fadeToggle();
    });

    // Sampha logo/contact reveal
    $('.contact-trigger').on('mouseenter', function() {
        $('.icon-logo').addClass('on');
        $('.contact').animate({
            bottom: 0
        });
    });
    $('.contact-trigger, .icon-logo').on('click', function() {
        if ( $('.icon-logo').hasClass('on') ) {
            $('.icon-logo').removeClass('on');
            $('.contact').animate({
                bottom: '-14em'
            });
        } else {
            $('.icon-logo').addClass('on');
            $('.contact').animate({
                bottom: 0
            });
        }
    });
    $('.contact > div').on('mouseleave', function() {
        $('.icon-logo').removeClass('on');
        $('.contact').animate({
            bottom: '-14em'
        });
    });

    // Release dropdowns
    var dropping = false;
    $('.release').on('mouseenter', function() {
        if (!dropping) {
            dropping = true;
            $(this).find('ul').slideDown(function() {
                dropping = false;
            });
        }
    }).on('mouseleave', function() {
        $(this).find('ul').slideUp();
    });

    // External links pause the track.
    $('a:not([data-target])').on('click', function() {
        $('.icon-pause').click();
    });

    // Videos
    $('[data-type=video]').on('click', function(e) {
        if ( !isMobile() ) {
            e.preventDefault();

            var url = $(this).attr('href'),
                chunks, video_id, source, embedCode;

            if ( url.match(/youtube/g) ) {
                video_id = getParameterByName(url, 'v');
                source = "//www.youtube.com/embed/" + video_id + "?autoplay=1";
            } else if ( url.match(/vimeo/g) ) {
                chunks = url.replace(/^\/|\/$/g, '').split('/');
                console.log(chunks);
                video_id = chunks[chunks.length - 1];
                source = 'http://player.vimeo.com/video/' + video_id + '?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;color=c34166&amp;autoplay=1'
            }


            embedCode = '<div class="has-video">'+
                            '<div class="embed-container">'+
                                '<iframe src="' + source + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'+
                                '<div class="icon-close"></div>'+
                            '</div>'+
                        '</div>';
            $('.overlay').append( embedCode ).fadeIn('600');
        }
    });

    $('.overlay').on('click', '.icon-close', function() {
		$('.overlay').fadeOut('600', function() {
			$(this).html('');
		});
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
                window.cancelAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            }

            // Setup devicePixelRatio.
            window.devicePixelRatio = window.devicePixelRatio || 1;

            // Listen for window resize
            // and resize the canvas.
            window.addEventListener('resize', ø.calibrate.bind(ø), false);

            // Bind polygon shapes to horizontal mouse movement.
            $(window).on('mousemove', function(e){
                if ( !isMobile() ) {
                    // Calculate theta.
                    var mouse_x = e.pageX * window.devicePixelRatio;
                    ø.start.x = e.pageX * window.devicePixelRatio,
                    ø.end.x = ø.canvas.width - ø.start.x;
                    ø.theta = Math.atan((mouse_x - (ø.canvas.width/2)) / (ø.canvas.height/2));

                    ø.setupPoints();
                    ø.draw();
                }
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
                    _ctrl = {}, ctrl = {}, ymod;

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
                    // note: the angle is (Math.PI/2) - (ø.theta + Math.PI/2)
                    ymod = Math.tan((Math.PI/2) - (ø.theta + (Math.PI/2))) * x_len,
                    _ctrl.y = _p.y - ymod,
                    ctrl.y = p.y - ymod;
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
                    // note: the angle is (Math.PI/2) - (ø.theta + Math.PI/2)
                    ymod = Math.tan((Math.PI/2) - (ø.theta + (Math.PI/2))) * x_len,
                    _ctrl.y = _p.y + ymod,
                    ctrl.y = p.y + ymod;
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

            // Keep track of which track we are on.
            ø.current_track = 0;

            if ( !isSafari ) {
                // Create the visualizer.
                ø.visual = new Visual();
            }

            if (window.AudioContext != null) {
                // Create the audio context and analyser.
                ø.audioCtx = new AudioContext();
                ø.analyser = ø.audioCtx.createAnalyser();

                // Connect analyser ==> output,
                // i.e. analyser output to the audio context's destination,
                // i.e. the speakers.
                ø.analyser.connect(ø.audioCtx.destination);
            }

            // Set up the audio
            ø.setup(playlist[ø.current_track]);

            // Audio controls
            $('.controls').on('click', '.icon-play', function() {
                ø.play();
                $(this)
                    .removeClass('icon-play')
                    .addClass('icon-pause');
            });
            $('.controls').on('click', '.icon-pause', function() {
                ø.pause();
                $(this)
                    .removeClass('icon-pause')
                    .addClass('icon-play');
            });
            $('.icon-next').click(function() {
                ø.next();
            });
            $('.icon-prev').click(function() {
                ø.prev();
            });
        }

        Aural.prototype.setup = function(filename) {
            var ø = this;

            // Create a new audio element.
            ø.audio = new Audio();
            if (ø.audio.canPlayType('audio/mpeg')) {
                ø.audio.src = 'audio/' + filename + '.mp3';
            } else {
                ø.audio.src = 'audio/' + filename + '.ogg';
            }
            ø.audio.load();

            if (window.AudioContext != null) {
                // Create the source.
                var src = ø.audioCtx.createMediaElementSource(ø.audio);

                // Connect src ==> analyser,
                // i.e. src output into analyser's input.
                src.connect(ø.analyser);
            }

            // Bind next track to the ending of this track.
            ø.audio.addEventListener('ended', ø.next.bind(ø), false);

            $('.now-playing').html('now playing... \'' + filename.replace(/_/g, ' ') + '\'');
        }

        Aural.prototype.visualize = function() {
            var ø = this;

            // Call this on each new frame.
            ø.animation = window.requestAnimationFrame(ø.visualize.bind(ø));

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


            if (window.AudioContext != null && !isSafari ) {
                this.visualize();
            }
        }

        Aural.prototype.pause = function() {
            this.audio.pause();
            if (this.animation) {
                window.cancelAnimationFrame(this.animation);
                this.animation = undefined;
            }
        }

        Aural.prototype.next = function() {
            var ø = this;

            // Pause the current audio.
            if (ø.audio) {
                ø.pause();
            }

            // If we are not at the end of the playlist...
            if ( ø.current_track < playlist.length - 1 ) {
                ø.current_track++;
            } else {
                ø.current_track = 0;
            }

            // Setup the new track.
            ø.setup(playlist[ø.current_track]);

            // Play!
            ø.play();
        }

        Aural.prototype.prev = function() {
            var ø = this;

            // Pause the current audio.
            if (ø.audio) {
                ø.pause();
            }

            // If we are not at the end of the playlist...
            if ( ø.current_track > 0 ) {
                ø.current_track--;
            } else {
                ø.current_track = playlist.length - 1;
            }

            // Setup the new track.
            ø.setup(playlist[ø.current_track]);

            // Play!
            ø.play();
        }

        return Aural;
    })();



    // Point object
    function Point(x, y) {
        this.x = x || 0,
        this.y = y || 0;
    }


})();

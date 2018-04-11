var UI = {
    //If forMilliseconds is provided, it will open and close the offCanvas
    offCanvasShow: function offCanvasShow(event) {
        var toggle = function () { $('#fh5co-offcanvass').toggleClass('fh5co-awake') };
        toggle();
        if (event.data && event.data.forMilliseconds !== undefined) {
            window.setTimeout(toggle, event.data.forMilliseconds);
        }

    }
}
; (function () {

    'use strict';

    // iPad and iPod detection	
    var isiPad = function () {
        return (navigator.platform.indexOf("iPad") != -1);
    };

    var isiPhone = function () {
        return (
			(navigator.platform.indexOf("iPhone") != -1) ||
			(navigator.platform.indexOf("iPod") != -1)
	    );
    };

    // OffCanvass    
    var offCanvass = function () {
        $('body').on('click', '.js-fh5co-menu-btn, .js-fh5co-offcanvass-close',
            UI.offCanvasShow)
    };



    // Click outside of offcanvass
    var mobileMenuOutsideClick = function () {
        $(document).click(function (e) {
            var container = $("#fh5co-offcanvass, .js-fh5co-menu-btn");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                if ($('#fh5co-offcanvass').hasClass('fh5co-awake')) {
                    $('#fh5co-offcanvass').removeClass('fh5co-awake');
                }
            }
        });

        $(window).scroll(function () {
            if ($(window).scrollTop() > 500) {
                if ($('#fh5co-offcanvass').hasClass('fh5co-awake')) {
                    $('#fh5co-offcanvass').removeClass('fh5co-awake');
                }
            }
        });
    };

    // Magnific Popup

    var magnifPopup = function () {
        $('.image-popup').magnificPopup({
            type: 'image',
            removalDelay: 300,
            mainClass: 'mfp-with-zoom',
            //titleSrc: 'title',
            image: {
                titleSrc: function (item) {
                    var returnV = item.el.attr('title') || '';
                    var subcaption = item.el.siblings(".description").html();
                    if (subcaption)
                        returnV += '<small>' + subcaption + '</small>';// '<small>by Marsel Van Oosten</small>';

                    return returnV;

                }
            },
            gallery: {
                enabled: true
            },
            zoom: {
                enabled: true, // By default it's false, so don't forget to enable it

                duration: 300, // duration of the effect, in milliseconds
                easing: 'ease-in-out', // CSS transition easing function

                // The "opener" function should return the element from which popup will be zoomed in
                // and to which popup will be scaled down
                // By defailt it looks for an image tag:
                opener: function (openerElement) {

                    // openerElement is the element on which popup was initialized, in this case its <a> tag
                    // you don't need to add "opener" option if this code matches your needs, it's defailt one.
                    return openerElement.is('img') ? openerElement : openerElement.find('img');

                }
            }
        });
    };
    var magnifPopupVid = function () {
        //Magnific pop-up, YouTube
        $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
            disableOn: 700,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,

            fixedContentPos: false
        });
    };

    var animateBoxWayPoint = function () {

        if ($('.animate-box').length > 0) {
            $('.animate-box').waypoint(function (direction) {

                if (direction === 'down' && !$(this).hasClass('animated')) {
                    $(this.element).addClass('bounceIn animated');
                }

            }, { offset: '75%' });
        }

    };

    $('#fh5co-footer').load('/templ/footer.html');
    $('#fh5co-header').load('/templ/header.html');

    //Offcanvas relative 
    $('#fh5co-offcanvass').load('offcanvas.html');


    $(document).ready(function () {
        magnifPopup();
        magnifPopupVid();
        offCanvass();
        mobileMenuOutsideClick();
        animateBoxWayPoint();
    });


    //Azure Web Apps 
    var appInsights = window.appInsights || function (config) {
        function r(config) { t[config] = function () { var i = arguments; t.queue.push(function () { t[config].apply(t, i) }) } } var t = { config: config }, u = document, e = window, o = "script", s = u.createElement(o), i, f; for (s.src = config.url || "//az416426.vo.msecnd.net/scripts/a/ai.0.js", u.getElementsByTagName(o)[0].parentNode.appendChild(s), t.cookie = u.cookie, t.queue = [], i = ["Event", "Exception", "Metric", "PageView", "Trace"]; i.length;) r("track" + i.pop()); return r("setAuthenticatedUserContext"), r("clearAuthenticatedUserContext"), config.disableExceptionTracking || (i = "onerror", r("_" + i), f = e[i], e[i] = function (config, r, u, e, o) { var s = f && f(config, r, u, e, o); return s !== !0 && t["_" + i](config, r, u, e, o), s }), t
    }({
        instrumentationKey: "8f904864-e54b-4fa0-899f-8c0f3df0739f"
    });

    window.appInsights = appInsights;
    appInsights.trackPageView();


}());

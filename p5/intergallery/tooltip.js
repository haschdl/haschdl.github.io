function toolTipOpenAndClose(message) {
    if (message !== undefined)
        $("#spanBackground").tooltipster("content", message);


    $("#spanBackground").tooltipster("open");
    window.setTimeout(function () {
        $("#spanBackground").tooltipster("close");
        $(this).dequeue();
    },
    3000);
}


function toolTipOpen(message) {
    $("#spanBackground").tooltipster("content", message);
    var instance = $.tooltipster.instances('#spanBackground');
    instance[0].option('animationDuration', 5000);
    instance[0].close = function(event) {
        window.location = location; //refreshes the page
    };
    $("#spanBackground")
        .tooltipster("open");
}

function AnimateUpDown(toolTipElement) {
    $(toolTipElement).velocity({ top: "+=20" }, 1000);
    $(toolTipElement).velocity({ top: "-=20" }, 1000, AnimateUpDown);
}

$(document).ready(function () {
    jQuery.fn.animate = jQuery.fn.velocity;
    jQuery.fx.interval = 50;

    $("#spanBackground")
        .tooltipster(
        {
            //animation: "fade",
            arrow: false,
            //Custom trigger effectively disables the default onhover trigger
            trigger: "custom",
            functionReady: function(instance, helper) {
                AnimateUpDown(helper.tooltip);

            },
            triggerClose: {
                click: true,
                scroll: true
            },
            close: function(event) {
                event.stop();
            }
});

    toolTipOpenAndClose();

});
function toolTipOpenAndClose() {
    //$("#spanBackground").tooltipster("content", "Touch to interact");
    $("#spanBackground").tooltipster("open");
    window.setTimeout(function () {
        $("#spanBackground").tooltipster("close");
        $(this).dequeue();
    }, 3000);
}


function AnimateUpDown(toolTipElement) {
    $(toolTipElement).velocity({ top: "+=20" }, 1000);
    $(toolTipElement).velocity({ top: "-=20" }, 1000, AnimateUpDown);
}

$(document).ready(function () {
    jQuery.fn.animate = jQuery.fn.velocity;
    jQuery.fx.interval = 50;
    $(".tooltipjs")
        .tooltipster(
        {
            animation: "fade",
            arrow: false,
            //Custom trigger effectively disables the default onhover trigger
            trigger: "custom",
            functionReady: function (instance, helper) {
                AnimateUpDown(helper.tooltip);
                
            }

        });

    toolTipOpenAndClose();
    $("dummyImgElement").hide();
    //reset locat storage
    localStorage.clear();
});
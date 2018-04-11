$(window).load(function () {
    var columns = 3,
        setColumns = function () { columns = $(window).width() > 640 ? 3 : $(window).width() > 320 ? 2 : 1; };

    setColumns();
    $(window).resize(setColumns);

    $('#list').masonry(
    {
        itemSelector: '.item',
        columnWidth: function (containerWidth) { return containerWidth / columns; }
    });
});

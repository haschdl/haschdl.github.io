var Connector = function() {
};

Connector.connect = function () {
    $("#topBar").css('background-color', '').css('background-color', 'yellow');
    kinectWorker.postMessage({
        cmd: "connect",
        serverUrl: $("#serverUrl").val()
    });
}
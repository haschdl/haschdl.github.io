"use strict";

var ws;


self.addEventListener('message', function (e) {
    var cmd = e.data.cmd;
    switch (cmd) {
        case "connect":
            KinectConnect(e.data.serverUrl);
            break;
        case "disconnect":
            KinectDisconnect();
            break;
        default:
            self.postMessage('Unknown command: ' + e.data);
    }
    ;
}, false);
function close() {
    KinectDisconnect();
    //Mark it as no longer running
    this.isRunning = false;
    //Call original close function
    this._selfClose();
}
function KinectConnect(serverUrl) {
    if (ws !== undefined && ws.readyState === 0) {//CONNECTING
        return;
    }
    if (ws !== undefined && ws.readyState === 1) {//OPEN
        ws.close();
    }
    ws = new WebSocket(serverUrl);

    ws.binaryType = "arraybuffer";
    //ws.binaryType = "blob";

    ws.onopen = function () {
        postMessage({
            status: "Connected"
        });
    };

    ws.onmessage = function (evt) {
        if (evt.data instanceof ArrayBuffer) {
            postMessage(evt.data, [evt.data]);
            //buffer = null;
            //evt.data = null;
        } else {
            //If not a ArrayBuffer, treat it as status message
            MessageReceived({
                status: evt.data
            });
        }
    };

    ws.onerror = function (evt) {
        //ResetKinectPositions();
        //Note that ws.onerror does not give details about the error
        //See https://www.w3.org/TR/websockets/#concept-websocket-close-fail
        postMessage({
            err: "An error occurred while stablishing a connection to the server. Please make sure Kinect is connected and server is running."
        });

    }
    ws.onclose = function (event) {

        //$("#topBar").css('background-color', '').css('background-color', 'red');
        //$("#spanStatus").text("disconnected");
        var reason;
        // See http://tools.ietf.org/html/rfc6455#section-7.4.1
        if (event.code === 1000)
            reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
        else if (event.code === 1001)
            reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
        else if (event.code === 1002)
            reason = "An endpoint is terminating the connection due to a protocol error";
        else if (event.code === 1003)
            reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
        else if (event.code === 1004)
            reason = "Reserved. The specific meaning might be defined in the future.";
        else if (event.code === 1005)
            reason = "No status code was actually present.";
        else if (event.code === 1006)
            //reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
            reason = "It was not possible to connect to " + serverUrl + ". Make sure the service is running.";
        else if (event.code === 1007)
            reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
        else if (event.code === 1008)
            reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
        else if (event.code === 1009)
            reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
        else if (event.code === 1010)
            // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
            reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
        else if (event.code === 1011)
            reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
        else if (event.code === 1015)
            reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
        else
            reason = "Unknown reason";


        postMessage({
            status: "WebSocket disconnected. Reason:" + reason
        });

    }
    ;
}
; function KinectDisconnect() {
    console.debug("KINECT Worker, WebSocket closing...");
    if (ws !== undefined && ws.readyState === WebSocket.OPEN) {
        ws.close();
    }
}

function MessageReceived(dataObject) {
    //if (IsWorker()) {
    postMessage(dataObject);
    //} 
}

function IsWorker() {
    return hasOwnProperty(document);
}
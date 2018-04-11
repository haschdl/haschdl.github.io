/// <reference path="../Scripts/KinectMessageType.js" />
var KinectWorkerManager = function () {

    this.kinectWorker = new Worker("/Scripts/kinectWorker.js");
    this.isKinectConnected = false;
    this.OnConnectCompleted = null;
    this.timeSinceLast = new Date();

    this.Connect = function (serviceUrl, OnError, OnConnectCompleted) {
        this.kinectWorker.postMessage({
            cmd: "connect",
            serverUrl: serviceUrl
        });
        this.OnConnectCompleted = OnConnectCompleted;
        this.OnError = OnError;


    };
    this.objectUrl = "";

    //    this.OnNewDepthImage = function (url) { };

    this.kinectWorker.onmessage = function (evt) {
        if (evt.data.err) {
            this.OnError.call(this, "KINECT Worker error: " + evt.data.err);
        }
        else if (evt.data instanceof ArrayBuffer) {
            if (this.lastObjectUrl)
                window.URL.revokeObjectURL(this.lastObjectUrl);
           
            let blob = new Blob([evt.data]);
            this.objectUrl = window.URL.createObjectURL(blob); //, { type: "image/jpg" });
            //delete evt.data;
            //delete blob;
            this.OnNewDepthImage.call(this, this.objectUrl);
            this.lastObjectUrl = this.objectUrl;
            this.timeSinceLast = new Date();

        } else if (evt.data.status) {            
            if (evt.data.status === "Connected") {
                this.isKinectConnected = true;
                this.OnConnectCompleted.call(this);
                this.monitorSocket();
            }
            else {
                console.debug("KINECT Status message: " + evt.data.status);
            }
        }
    }.bind(this);


    this.kinectWorker.onerror = function (error, filename, lineno) {
        console.log("KINECT Worker error: " + error.message);
        this.OnError.call(this, "KINECT Worker error: " + message);
    }.bind(this);

    ///If the last Kinect message was received more than a second ago,
    ///forces a page reload. This is just an attempt to reconnect to service
    ///in case e.g. Kinect was disconneted or service host was restarted
    this.monitorSocket = function () {
        //setTimeout(function () {
        //    if (Date.now() - this.lastBlobReceivedTime > 2000)
        //        window.location = window.location; //reload page
        //    this.monitorSocket();
        //}.bind(this), 5000)
    };


    $(window)
        .on("beforeunload",
            function () {
                this.kinectWorker.postMessage({
                    cmd: "disconnect"
                });
            }.bind(this));



}






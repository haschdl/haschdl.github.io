/// <reference path="../libraries/speech.1.0.0.min.js" />
//Reference:https://github.com/Microsoft/Cognitive-Speech-STT-JavaScript
var logText = function(text) {
    console.log("Speech recognition: " + text);
}
var bingClient;
var SpeechClient = function(key, luisAppid, luisSubid) {
    //this.client;    
    this.useMic = true;
    this.appid = luisAppid;
    this.subid = luisSubid;
    this.key = key;
    this.getMode = function() {      

        return Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionMode.shortPhrase;
    }
    this.getLanguage = function() {
        return "en-us";
    }
    this.getLuisConfig = function() {
        if (this.appid.length > 0 && this.subid.length > 0) {
            return {
                appid: this.appid,
                subid: this.subid
            };
        }
        return null;
    }

    loopTimeOut = function() {
         bingClient.startMicAndRecognition();
          setTimeout(function() {
                bingClient.endMicAndRecognition();
                loopTimeOut();
            }, 6000);
        
    }
    this.start = function() {
        var mode = this.
        getMode();
        var luisCfg = this.getLuisConfig();
        if (this.useMic) {
            if (luisCfg) {
                //this.client = Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionServiceFactory.createMicrophoneClientWithIntent(this.getLanguage(), this.key, luisCfg.appid, luisCfg.subid);
                bingClient = Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionServiceFactory.createMicrophoneClientWithIntent(this.getLanguage(), this.key, luisCfg.appid, luisCfg.subid);
            } else {
               bingClient =  Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionServiceFactory.createMicrophoneClient(mode, this.getLanguage(), this.key);
            }
            //bingClient.startMicAndRecognition();
            bingClient.onPartialResponseReceived = function(response) {
                logText(response);
            }
            bingClient.onFinalResponseReceived = function(response) {
                var speechRec  = JSON.stringify(response);
                logText(response.Transcript);
            }
            bingClient.onIntentReceived = function(response) {
                logText(response);
            }
            bingClient.onError = function(code, message) {
                
                console.log("Code:" + code + " Message:" + message);
            }
            
            loopTimeOut();           

        }
    }
}

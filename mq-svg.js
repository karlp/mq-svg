document.addEventListener('DOMContentLoaded', function() {
   console.log('document is ready. I can sleep now');
    snap = Snap("#topsvg");
    devs = {};

    function wsOnMessage(message) {
        var topics = message.destinationName.split("/");
        if (topics.length < 1) {
            console.log("shouldn't happen, ignoring message on topic: " + message.destinationName);
            return;
        }
        var payload = JSON.parse(message.payloadString);
        if (!payload) {
            console.log("shouldn't happen, getting sent invalid json on topic: " + message.destinationName);
            return;
        }

        if (topics[0] === "mqsvg") { // not needed, we only subbed once in this test case
            //console.log("Got data!", payload);
            var dev = devs[payload.name];
            if (!dev) {
                Snap.load("resources/mqblob.svg", function(f) {
                    var container = f.select("#container");
                    container.drag();
                    // This seems gross
                    devs[payload.name] = f;
                    dev = devs[payload.name];
                    dev.select("#tname").node.innerHTML = payload.name;
                    snap.append(dev);
                });
            } else {
                // This seems gross
		        dev.select("#tvalue").node.innerHTML = payload.value;
		        // make the border red briefly as it updates...
	            dev.select("#frame").attr({stroke: "#e00"});
                setTimeout(function() { dev.select("#frame").attr({stroke: "#000"})}, 500);
	        }
        }
    }

    function wsLostHandler(obj) {
        var code = obj.errorCode;
        var msg = obj.errorMessage;
        console.log("oops " + msg + " : " + code);
        setTimeout(wsDoConnect, 5000);
    }

    function wsConnected(obj) {
        function subFail(obj) {
            mqclient.disconnect();
            setTimeout(wsDoConnect, 5000);
        }

        mqclient.subscribe("mqsvg/json/#", {
            qos: 0, onFailure: subFail
        });
        var m = new Paho.MQTT.Message("{}");
        m.destinationName = "command/local/json/gethardwareconfiguration";
        mqclient.send(m);
    }

    function wsDoConnect() {
        mqclient.connect({
            mqttVersion: 4,
            onFailure: wsLostHandler,
            onSuccess: wsConnected
        });
    }

    // FIXME - need a try here, if no websockets?
    var mqclient;
    try {
        mqclient = new Paho.MQTT.Client("192.168.255.74", 8083,
            "cabview-" + (Math.random() + 1).toString(36).substring(2,8));
        mqclient.onConnectionLost = wsLostHandler;
        mqclient.onMessageArrived = wsOnMessage;
        wsDoConnect();
    } catch (e) {
        $("#browser_not_supported").show();
    }

});

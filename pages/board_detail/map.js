var map = null;

document.addEventListener("DOMContentLoaded", init);

window.addEventListener("message", processMessage);

function processMessage(msg) {
    //Verify data and origin (in this case the local context page)
    if (!msg.data || msg.origin !== "ms-appx://" + document.location.host) {
        return;
    }
    var call = JSON.parse(msg.data);
    if (!call.functionName) {
        throw "Message does not contain a valid function name.";
    }
    var target = this[call.functionName];
    if (typeof target != 'function') {
        throw "The function name does not resolve to an actual function";
    }
    return target.apply(this, call.args);
}

function notifyParent(event, args) {
    //Add event name to the arguments object and stringify as the message
    args["event"] = event;
    window.parent.postMessage(JSON.stringify(args),
    "ms-appx://" + document.location.host);
}

function init() {
    if (typeof Microsoft == "undefined") {
        return;
    }
    map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), {
        credentials: "AiIFfBTlfW_Cv6tlaaT4fFBAj2p7D1kn24bAmPS5e3xOH8XJXMB9bb78woB4J5GV",
        zoom: 12,
        mapTypeId: Microsoft.Maps.MapTypeId.road
    });
}

function pinLocation(lat, long) {
    if (map === null) {
        throw "No map has been created";
    }
    var location = new Microsoft.Maps.Location(lat, long);
    var pushpin = new Microsoft.Maps.Pushpin(location, { draggable: true });
    Microsoft.Maps.Events.addHandler(pushpin, "dragend", function (e) {
        var location = e.entity.getLocation();
        notifyParent("locationChanged",
        { latitude: location.latitude, longitude: location.longitude });
    });
    map.entities.push(pushpin);
    map.setView({ center: location, zoom: 12, });
    return;
}

function setZoom(zoom) {
    if (map === null) {
        throw "No map has been created";
    }
    map.setView({ zoom: zoom });
}
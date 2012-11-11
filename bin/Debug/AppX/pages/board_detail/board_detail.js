// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var lastCapture = null;
    var counter = 0;
    //Drop this after the line: var activation = Windows.ApplicationModel.Activation;
    var lastPosition = null;
    var serverAddress = '192.168.33.35:3000';
    var map_open = false;

    var socket = io.connect('http://192.168.9.111:3000/media');
    socket.on('connect', function () {
        socket.emit('media-subscribe', 'NAT611');
    });

    WinJS.UI.Pages.define("/pages/board_detail/board_detail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            document.getElementById('photoBtn').addEventListener('click', photoHandler, false);
            document.getElementById('mapBtn').addEventListener('click', mapHandler, false);
            document.getElementById('videoBtn').addEventListener('click', videoHandler, false);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });

    function pageToWinRT(pageX, pageY) {
        var zoomfactor = document.documentElement.msContentZoomFactor;
        return {
            x: (pageX - window.pageXOffset) * zoomfactor,
            y: (pageY - window.pageXOffset) * zoomfactor
        };
    }

    function photoHandler(e) {
        // Create a menu and add commands with callbacks.
        var menu = new Windows.UI.Popups.PopupMenu();
        menu.commands.append(new Windows.UI.Popups.UICommand("From library", pickSinglePhoto));
        menu.commands.append(new Windows.UI.Popups.UICommand("Camera", capturePhoto));
        menu.showAsync(pageToWinRT(e.pageX, e.pageY)).then(function (invokedCommand) {
            if (invokedCommand === null) {
                // The command is null if no command was invoked.
                WinJS.log && WinJS.log("Context menu dismissed", "sample", "status");
            }
        });
    }

    function processFrameEvent(message) {
        //Verify data and origin (in this case the web context page)
        if (!message.data || message.origin !== "ms-appx-web://" + document.location.host) {
            return;
        }
        if (!message.data) {
            return;
        }
        var eventObj = JSON.parse(message.data);
        switch (eventObj.event) {
            case "locationChanged":
                var data = {
                    type: 'map',
                    x: eventObj.latitude,
                    y: eventObj.longitude,
                    rotation: 0,
                    relativePoints: [],
                    thickness: 0,
                    color: null,
                    counter: counter
                };
                lastPosition = { latitude: eventObj.latitude, longitude: eventObj.longitude };
                break;
            default:
                break;
        }
    };

    socket.on('media-server-update', function (data) {
        if (data.type == "map") {
            var location = { latitude: data.x, longitude: data.y };
            callFrameScript(document.frames["map"], "pinLocation",
                [data.x, data.y]);
        }
    });

    function videoHandler(e) {

    }

    function mapHandler(e) {
        if (!map_open) {
            document.getElementById("map").style.visibility = "visible";
            var gl = new Windows.Devices.Geolocation.Geolocator();
            gl.getGeopositionAsync().done(function (position) {
                //Save for share
                lastPosition = {
                    latitude: position.coordinate.latitude,
                    longitude: position.coordinate.longitude
                };
                callFrameScript(document.frames["map"], "pinLocation",
                [position.coordinate.latitude, position.coordinate.longitude]);
            }, function (error) {
                console.log("Unable to get location.");
            });
            document.getElementById("mapBtn").style.label = "Close map";
        } else {
            
        }
    }

    function callFrameScript(frame, targetFunction, args) {
        var message = { functionName: targetFunction, args: args };
        frame.postMessage(JSON.stringify(message), "ms-appx-web://" + document.location.host);
    }
    
    function pickSinglePhoto() {
        // Verify that we are currently not snapped, or that we can unsnap to open the picker
        var currentState = Windows.UI.ViewManagement.ApplicationView.value;
        if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
        !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
            // Fail silently if we can't unsnap
            return;
        }

        // Create the picker object and set options
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;

        // Users expect to have a filtered view of their folders depending on the scenario.
        // For example, when choosing a documents folder, restrict the filetypes to documents 
        // for your application.
        openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);
        // Open the picker for the user to pick a file
        openPicker.pickSingleFileAsync().done(function (file) {
            if (file) {
                var img = document.createElement("IMG");
                img.width = 480;
                img.style.position = "absolute";
                img.style.zIndex = counter;
                counter++;
                $(img).draggable({
                    drag: function (event, ui) {
                    }
                });

                var url = URL.createObjectURL(file, { oneTimeOnly: true });
                img.src = url;
                document.getElementById('media_board').appendChild(img);

                uploadImage(file);
            } else {
                // The picker was dismissed with no selected file
            }
        });
    }

    function capturePhoto() {
        var captureUI = new Windows.Media.Capture.CameraCaptureUI();

        captureUI.photoSettings.format = Windows.Media.Capture.CameraCaptureUIPhotoFormat.png;
        captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo)
        .done(function (capturedFile) {
            //Be sure to check validity of the item returned; could be null if the user canceled.
            if (capturedFile) {
                lastCapture = capturedFile; //Save for Share
                var img = document.createElement("IMG");
                
                img.width = 480;
                img.style.position = "absolute";
                img.style.zIndex = counter;
                counter++;
                $(img).draggable({
                    drag: function (event, ui) {
                       
                    }
                });
                
                var url = URL.createObjectURL(capturedFile, { oneTimeOnly: true });
                img.src = url;
                document.getElementById('media_board').appendChild(img);

                uploadImage(capturedFile);
            }
        }, function (error) {
            console.log("Unable to invoke capture UI.");
        });
    }

    function uploadImage(file) {
        file.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function (stream) {
            var blob = MSApp.createBlobFromRandomAccessStream(file.type, stream);

            var formData = new FormData();
            formData.append('image', blob, file.name);

            var url = 'http://' + serverAddress + '/api/media/image-upload';

            return WinJS.xhr({
                type: "POST",
                url: url,
                data: formData
            });
        }).then(function (request) {
            console.log('uploaded image okie');
        }, function (error) {
            console.error('problem uploading image');
        });

        
    }

    function loadPhoto() {
    }
    
})();

(function () {
    "use strict";
    
    var serverAddress = '192.168.6.108:3000';
    var collectionsList = new WinJS.Binding.List();
    var boardsListsArray = [];

    var collectionsFetched = 0;
    var broadsFetchedArray = [];

    function getCollectionsList() {
        if (collectionsFetched == 0) {
            fetchJson('http://' + serverAddress + '/api/collections').then(function (collections) {
                for (var i = 0; i < collections.length; i++) {
                    collectionsList.push(collections[i]);
                }
            });

            collectionsFetched = 1;
        }

        return collectionsList;
    }

    function getBoardsList(collectionId) {
        if (!boardsListsArray[collectionId]) {
            boardsListsArray[collectionId] = new WinJS.Binding.List();
            broadsFetchedArray[collectionId] = 0;
        }

        if (broadsFetchedArray[collectionId] == 0) {
            fetchJson('http://' + serverAddress + '/api/collections/' + collectionId).then(function (collection) {
                for (var i = 0; i < collection.boards.length; i++) {
                    boardsListsArray[collectionId].push(collection.boards[i]);
                }
            });

            broadsFetchedArray[collectionId] = 1
        }

        return boardsListsArray[collectionId];
    }

    function fetchJson(url) {
        return WinJS.xhr({
            url: url,
            headers: { "If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT" }
        }).then(function (response) {
            var json = JSON.parse(response.responseText);
            return json;
        });
    }

    WinJS.Namespace.define("Data", {
        collections: getCollectionsList,
        boards: getBoardsList
    });
})();

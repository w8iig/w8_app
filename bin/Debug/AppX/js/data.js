(function () {
    "use strict";
    
    var serverAddress = '192.168.4.169:3000';
    var collectionsList = new WinJS.Binding.List();
    var boardsListsArray = [];

    var collectionsFetched = 0;
    var broadsFetchedArray = [];

    function getCollectionsList() {
        if (collectionsFetched == 0) {
            fetchJson('http://' + serverAddress + '/api/collections').then(function (collections) {
                if (collections != null) {
                    for (var i = 0; i < collections.length; i++) {
                        var collection = collections[i];
                        collection.thumbnail = 'http://' + serverAddress + '/collections/' + collections[i].collectionId + '/thumbnail';
                        collectionsList.push(collection);
                    }
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
                if (collection != null && collection.boards) {
                    for (var i = 0; i < collection.boards.length; i++) {
                        var board = collection.boards[i];
                        board.thumbnail = 'http://' + serverAddress + '/boards/' + board.boardId + '/thumbnail';
                        boardsListsArray[collectionId].push(board);
                    }
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
        }).then(function (request) {
            var json = JSON.parse(request.responseText);
            return json;
        }, function (request) {
            return null;
        });
    }

    WinJS.Namespace.define("Data", {
        collections: getCollectionsList,
        boards: getBoardsList
    });
})();

// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var output;

    WinJS.UI.Pages.define("/pages/boards/boards.html", {
        ready: function (element, options) {
            this.listView = element.querySelector(".itemslist").winControl;
            this.boardsList = Data.boards(options.collection.collectionId);

            element.querySelector(".pagetitle").innerText = options.collection.collectionName;

            this.listView.itemDataSource = this.boardsList.dataSource;

            this.listView.itemTemplate = element.querySelector(".itemtemplate");
            this.listView.oniteminvoked = this._itemInvoked.bind(this);

            this._initializeLayout(this.listView, Windows.UI.ViewManagement.ApplicationView.value);
            this.listView.element.focus();

            output = document.getElementById('output');
            WinJS.Resources.processAll(output);
        },

        updateLayout: function (element, viewState, lastViewState) {
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var listView = this.listView;
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    var firstVisible = listView.indexOfFirstVisible;
                    this._initializeLayout(listView, viewState);
                    if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                }
            }
        },

        _initializeLayout: function (listView, viewState) {
            if (viewState === appViewState.snapped) {
                this.listView.layout = new ui.ListLayout();
            } else {
                this.listView.layout = new ui.GridLayout();
            }
        },

        _itemInvoked: function (args) {
            WinJS.Navigation.navigate("/pages/board_detail/board_detail.html", { board: this.boardsList.getAt(args.detail.itemIndex) });
        }
    });
})();
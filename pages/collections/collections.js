(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;

    ui.Pages.define("/pages/collections/collections.html", {
        ready: function (element, options) {
            this.listView = element.querySelector(".itemslist").winControl;
            this.collectionsList = Data.collections();

            this.listView.itemDataSource = this.collectionsList.dataSource;

            this.listView.itemTemplate = element.querySelector(".itemtemplate");
            this.listView.oniteminvoked = this._itemInvoked.bind(this);

            this._initializeLayout(this.listView, Windows.UI.ViewManagement.ApplicationView.value);
            this.listView.element.focus();
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
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.GridLayout();
            }
        },

        _itemInvoked: function (args) {
            WinJS.Navigation.navigate("/pages/boards/boards.html", {
                collection: this.collectionsList.getAt(args.detail.itemIndex)
            });
        }
    });
})();
import loading from '../../components/loading/loading';
import libraryBrowser from '../../scripts/libraryBrowser';
import imageLoader from '../../components/images/imageLoader';
import listView from '../../components/listview/listview';
import cardBuilder from '../../components/cardbuilder/cardBuilder';
import * as userSettings from '../../scripts/settings/userSettings';
import globalize from '../../scripts/globalize';
import '../../elements/emby-itemscontainer/emby-itemscontainer';

class MovieCollections {
    isLoading = false;
    constructor(params, tabContent) {
        this.params = params;
        this.tabContent = tabContent;
    }

    onViewStyleChange = () => {
        const viewStyle = this.getCurrentViewStyle();
        const itemsContainer = this.tabContent.querySelector('.itemsContainer');

        if (viewStyle == 'List') {
            itemsContainer.classList.add('vertical-list');
            itemsContainer.classList.remove('vertical-wrap');
        } else {
            itemsContainer.classList.remove('vertical-list');
            itemsContainer.classList.add('vertical-wrap');
        }

        itemsContainer.innerHTML = '';
    };

    reloadItems(page) {
        loading.show();
        this.isLoading = true;
        const query = this.query;
        ApiClient.getItems(ApiClient.getCurrentUserId(), query).then((result) => {
            window.scrollTo(0, 0);
            let html;
            const pagingHtml = libraryBrowser.getQueryPagingHtml({
                startIndex: query.StartIndex,
                limit: query.Limit,
                totalRecordCount: result.TotalRecordCount,
                showLimit: false,
                updatePageSizeSetting: false,
                addLayoutButton: false,
                sortButton: false,
                filterButton: false
            });
            const viewStyle = this.getCurrentViewStyle();
            if (viewStyle == 'Thumb') {
                html = cardBuilder.getCardsHtml(result.Items, {
                    items: result.Items,
                    shape: 'backdrop',
                    preferThumb: true,
                    context: 'movies',
                    overlayPlayButton: true,
                    centerText: true,
                    showTitle: true
                });
            } else if (viewStyle == 'ThumbCard') {
                html = cardBuilder.getCardsHtml(result.Items, {
                    items: result.Items,
                    shape: 'backdrop',
                    preferThumb: true,
                    context: 'movies',
                    lazy: true,
                    cardLayout: true,
                    showTitle: true
                });
            } else if (viewStyle == 'Banner') {
                html = cardBuilder.getCardsHtml(result.Items, {
                    items: result.Items,
                    shape: 'banner',
                    preferBanner: true,
                    context: 'movies',
                    lazy: true
                });
            } else if (viewStyle == 'List') {
                html = listView.getListViewHtml(result.Items, {
                    items: result.Items,
                    context: 'movies',
                    sortBy: query.SortBy
                });
            } else if (viewStyle == 'PosterCard') {
                html = cardBuilder.getCardsHtml(result.Items, {
                    items: result.Items,
                    shape: 'auto',
                    context: 'movies',
                    showTitle: true,
                    centerText: false,
                    cardLayout: true
                });
            } else {
                html = cardBuilder.getCardsHtml(result.Items, {
                    items: result.Items,
                    shape: 'auto',
                    context: 'movies',
                    centerText: true,
                    overlayPlayButton: true,
                    showTitle: true
                });
            }

            let elems = page.querySelectorAll('.paging');

            for (const paging of elems) {
                paging.innerHTML = pagingHtml;
            }

            elems = page.querySelectorAll('.btnNextPage');
            for (const btnNextPage of elems) {
                btnNextPage.addEventListener('click', this.onNextPageClick.bind(this));
            }

            elems = page.querySelectorAll('.btnPreviousPage');
            for (const btnPreviousPage of elems) {
                btnPreviousPage.addEventListener('click', this.onPreviousPageClick.bind(this));
            }

            if (!result.Items.length) {
                html = '';

                html += '<div class="noItemsMessage centerMessage">';
                html += '<h1>' + globalize.translate('MessageNothingHere') + '</h1>';
                html += '<p>' + globalize.translate('MessageNoCollectionsAvailable') + '</p>';
                html += '</div>';
            }

            const itemsContainer = page.querySelector('.itemsContainer');
            itemsContainer.innerHTML = html;
            imageLoader.lazyChildren(itemsContainer);
            userSettings.saveQuerySettings(this.savedQueryKey, query);
            loading.hide();
            this.isLoading = false;

            import('../../components/autoFocuser').then(({ default: autoFocuser }) => {
                autoFocuser.autoFocus(page);
            });
        });
    }

    onNextPageClick() {
        if (this.isLoading) {
            return;
        }

        if (userSettings.libraryPageSize() > 0) {
            this.query.StartIndex += this.query.Limit;
        }
        this.reloadItems(this.tabContent);
    }

    onPreviousPageClick() {
        if (this.isLoading) {
            return;
        }

        if (userSettings.libraryPageSize() > 0) {
            this.query.StartIndex = Math.max(0, this.query.StartIndex - this.query.Limit);
        }
        this.reloadItems(this.tabContent);
    }

    getCurrentViewStyle() {
        return userSettings.get(this.savedViewKey) || 'Poster';
    }

    initPage(tabContent) {
        this.savedQueryKey = this.params.topParentId + '-moviecollections';
        this.savedViewKey = this.savedQueryKey + '-view';
        this.query = {
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            IncludeItemTypes: 'BoxSet',
            Recursive: true,
            Fields: 'PrimaryImageAspectRatio,SortName',
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
            StartIndex: 0,
            ParentId: this.params.topParentId
        };

        if (userSettings.libraryPageSize() > 0) {
            this.query['Limit'] = userSettings.libraryPageSize();
        }

        this.query = userSettings.loadQuerySettings(this.savedQueryKey, this.query);
        const btnSelectView = tabContent.querySelector('.btnSelectView');
        btnSelectView.addEventListener('click', (e) => {
            libraryBrowser.showLayoutMenu(e.target, this.getCurrentViewStyle(), 'List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
        });
        btnSelectView.addEventListener('layoutchange', (e) => {
            const viewStyle = e.detail.viewStyle;
            userSettings.set(this.savedViewKey, viewStyle);
            this.query.StartIndex = 0;
            this.onViewStyleChange();
            this.reloadItems(tabContent);
        });

        const btnSort = tabContent.querySelector('.btnSort');

        if (btnSort) {
            btnSort.addEventListener('click', (e) => {
                libraryBrowser.showSortMenu({
                    items: [{
                        name: globalize.translate('Name'),
                        id: 'SortName'
                    }, {
                        name: globalize.translate('OptionDateAdded'),
                        id: 'DateCreated,SortName'
                    }],
                    callback: () => {
                        this.query.StartIndex = 0;
                        this.reloadItems(tabContent);
                    },
                    query: this.query,
                    button: e.target
                });
            });
        }

        tabContent.querySelector('.btnNewCollection').addEventListener('click', () => {
            import('../../components/collectionEditor/collectionEditor').then(({ default: collectionEditor }) => {
                const serverId = ApiClient.serverInfo().Id;
                new collectionEditor({
                    items: [],
                    serverId: serverId
                });
            });
        });
    }

    initTab = () => {
        this.initPage(this.tabContent);
        this.onViewStyleChange();
    };

    renderTab() {
        this.reloadItems(this.tabContent);
    }
}

export default MovieCollections;

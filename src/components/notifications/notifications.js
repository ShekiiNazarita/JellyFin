import serverNotifications from '../../scripts/serverNotifications';
import { playbackManager } from '../playback/playbackmanager';
import { events } from 'jellyfin-apiclient';
import globalize from '../../scripts/globalize';

function onOneDocumentClick() {
    document.removeEventListener('click', onOneDocumentClick);
    document.removeEventListener('keydown', onOneDocumentClick);

    // don't request notification permissions if they're already granted or denied
    if (window.Notification && window.Notification.permission === 'default') {
        /* eslint-disable-next-line compat/compat */
        Notification.requestPermission();
    }
}

document.addEventListener('click', onOneDocumentClick);
document.addEventListener('keydown', onOneDocumentClick);

let serviceWorkerRegistration;

function closeAfter(notification, timeoutMs) {
    setTimeout(function () {
        if (notification.close) {
            notification.close();
        } else if (notification.cancel) {
            notification.cancel();
        }
    }, timeoutMs);
}

function resetRegistration() {
    /* eslint-disable-next-line compat/compat */
    let serviceWorker = navigator.serviceWorker;
    if (serviceWorker) {
        serviceWorker.ready.then(function (registration) {
            serviceWorkerRegistration = registration;
        });
    }
}

resetRegistration();

function showPersistentNotification(title, options, timeoutMs) {
    serviceWorkerRegistration.showNotification(title, options);
}

function showNonPersistentNotification(title, options, timeoutMs) {
    try {
        let notif = new Notification(title, options); /* eslint-disable-line compat/compat */

        if (notif.show) {
            notif.show();
        }

        if (timeoutMs) {
            closeAfter(notif, timeoutMs);
        }
    } catch (err) {
        if (options.actions) {
            options.actions = [];
            showNonPersistentNotification(title, options, timeoutMs);
        } else {
            throw err;
        }
    }
}

function showNotification(options, timeoutMs, apiClient) {
    let title = options.title;

    options.data = options.data || {};
    options.data.serverId = apiClient.serverInfo().Id;
    options.icon = options.icon || getIconUrl();
    options.badge = options.badge || getIconUrl('badge.png');

    resetRegistration();

    if (serviceWorkerRegistration) {
        showPersistentNotification(title, options, timeoutMs);
        return;
    }

    showNonPersistentNotification(title, options, timeoutMs);
}

function showNewItemNotification(item, apiClient) {
    if (playbackManager.isPlayingLocally(['Video'])) {
        return;
    }

    let body = item.Name;

    if (item.SeriesName) {
        body = item.SeriesName + ' - ' + body;
    }

    let notification = {
        title: 'New ' + item.Type,
        body: body,
        vibrate: true,
        tag: 'newItem' + item.Id,
        data: {}
    };

    let imageTags = item.ImageTags || {};

    if (imageTags.Primary) {
        notification.icon = apiClient.getScaledImageUrl(item.Id, {
            width: 80,
            tag: imageTags.Primary,
            type: 'Primary'
        });
    }

    showNotification(notification, 15000, apiClient);
}

function onLibraryChanged(data, apiClient) {
    let newItems = data.ItemsAdded;

    if (!newItems.length) {
        return;
    }

    // Don't put a massive number of Id's onto the query string
    if (newItems.length > 12) {
        newItems.length = 12;
    }

    apiClient.getItems(apiClient.getCurrentUserId(), {

        Recursive: true,
        Limit: 3,
        Filters: 'IsNotFolder',
        SortBy: 'DateCreated',
        SortOrder: 'Descending',
        Ids: newItems.join(','),
        MediaTypes: 'Audio,Video',
        EnableTotalRecordCount: false

    }).then(function (result) {
        let items = result.Items;

        for (const item of items) {
            showNewItemNotification(item, apiClient);
        }
    });
}

function getIconUrl(name) {
    name = name || 'notificationicon.png';
    return './components/notifications/' + name;
}

function showPackageInstallNotification(apiClient, installation, status) {
    apiClient.getCurrentUser().then(function (user) {
        if (!user.Policy.IsAdministrator) {
            return;
        }

        let notification = {
            tag: 'install' + installation.Id,
            data: {}
        };

        if (status === 'completed') {
            notification.title = globalize.translate('PackageInstallCompleted', installation.Name, installation.Version);
            notification.vibrate = true;
        } else if (status === 'cancelled') {
            notification.title = globalize.translate('PackageInstallCancelled', installation.Name, installation.Version);
        } else if (status === 'failed') {
            notification.title = globalize.translate('PackageInstallFailed', installation.Name, installation.Version);
            notification.vibrate = true;
        } else if (status === 'progress') {
            notification.title = globalize.translate('InstallingPackage', installation.Name, installation.Version);

            notification.actions =
                [
                    {
                        action: 'cancel-install',
                        title: globalize.translate('ButtonCancel'),
                        icon: getIconUrl()
                    }
                ];

            notification.data.id = installation.id;
        }

        if (status === 'progress') {
            let percentComplete = Math.round(installation.PercentComplete || 0);

            notification.body = percentComplete + '% complete.';
        }

        let timeout = status === 'cancelled' ? 5000 : 0;

        showNotification(notification, timeout, apiClient);
    });
}

events.on(serverNotifications, 'LibraryChanged', function (e, apiClient, data) {
    onLibraryChanged(data, apiClient);
});

events.on(serverNotifications, 'PackageInstallationCompleted', function (e, apiClient, data) {
    showPackageInstallNotification(apiClient, data, 'completed');
});

events.on(serverNotifications, 'PackageInstallationFailed', function (e, apiClient, data) {
    showPackageInstallNotification(apiClient, data, 'failed');
});

events.on(serverNotifications, 'PackageInstallationCancelled', function (e, apiClient, data) {
    showPackageInstallNotification(apiClient, data, 'cancelled');
});

events.on(serverNotifications, 'PackageInstalling', function (e, apiClient, data) {
    showPackageInstallNotification(apiClient, data, 'progress');
});

events.on(serverNotifications, 'ServerShuttingDown', function (e, apiClient, data) {
    let serverId = apiClient.serverInfo().Id;
    let notification = {
        tag: 'restart' + serverId,
        title: globalize.translate('ServerNameIsShuttingDown', apiClient.serverInfo().Name)
    };
    showNotification(notification, 0, apiClient);
});

events.on(serverNotifications, 'ServerRestarting', function (e, apiClient, data) {
    let serverId = apiClient.serverInfo().Id;
    let notification = {
        tag: 'restart' + serverId,
        title: globalize.translate('ServerNameIsRestarting', apiClient.serverInfo().Name)
    };
    showNotification(notification, 0, apiClient);
});

events.on(serverNotifications, 'RestartRequired', function (e, apiClient) {
    let serverId = apiClient.serverInfo().Id;
    let notification = {
        tag: 'restart' + serverId,
        title: globalize.translate('PleaseRestartServerName', apiClient.serverInfo().Name)
    };

    notification.actions =
        [
            {
                action: 'restart',
                title: globalize.translate('ButtonRestart'),
                icon: getIconUrl()
            }
        ];

    showNotification(notification, 0, apiClient);
});


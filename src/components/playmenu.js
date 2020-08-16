import actionsheet from './actionSheet/actionSheet';
import datetime from '../scripts/datetime';
import { playbackManager } from './playback/playbackmanager';
import globalize from '../scripts/globalize';

export function show(options) {
    var item = options.item;

    var resumePositionTicks = item.UserData ? item.UserData.PlaybackPositionTicks : null;

    var playableItemId = item.Type === 'Program' ? item.ChannelId : item.Id;

    if (!resumePositionTicks || item.IsFolder) {
        playbackManager.play({
            ids: [playableItemId],
            serverId: item.ServerId
        });
        return;
    }

    var menuItems = [];

    menuItems.push({
        name: globalize.translate('ResumeAt', datetime.getDisplayRunningTime(resumePositionTicks)),
        id: 'resume'
    });

    menuItems.push({
        name: globalize.translate('PlayFromBeginning'),
        id: 'play'
    });

    actionsheet.show({

        items: menuItems,
        positionTo: options.positionTo

    }).then(function (id) {
        switch (id) {
            case 'play':
                playbackManager.play({
                    ids: [playableItemId],
                    serverId: item.ServerId
                });
                break;
            case 'resume':
                playbackManager.play({
                    ids: [playableItemId],
                    startPositionTicks: resumePositionTicks,
                    serverId: item.ServerId
                });
                break;
            case 'queue':
                playbackManager.queue({
                    items: [item]
                });
                break;
            case 'shuffle':
                playbackManager.shuffle(item);
                break;
            default:
                break;
        }
    });
}

export default {
    show: show
};

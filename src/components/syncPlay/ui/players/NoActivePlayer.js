/**
 * Module that manages the PlaybackManager when there's no active player.
 * @module components/syncPlay/ui/players/NoActivePlayer
 */

import { Events } from 'jellyfin-apiclient';
import { playbackManager } from '../../../playback/playbackmanager';
import SyncPlay from '../../core';
import QueueManager from './QueueManager';
import OfflinePlayback from '../offlinePlayback/OfflinePlayback';
import OfflineQueueManager from './OfflineQueueManager';

let syncPlayManager;

/**
 * Class that manages the PlaybackManager when there's no active player.
 */
class NoActivePlayer extends SyncPlay.Players.GenericPlayer {
    static type = 'default';

    constructor(player, _syncPlayManager) {
        super(player, _syncPlayManager);
        syncPlayManager = _syncPlayManager;

        this.initQueueManager();

        Events.on(SyncPlay.Settings, 'enableOfflinePlayback', () => {
            this.initQueueManager();
        });
    }

    initQueueManager() {
        this.enableOfflinePlayback = SyncPlay.Settings.getBool('enableOfflinePlayback');
        if (this.enableOfflinePlayback) {
            this.queueManager = new OfflineQueueManager(this.manager);
        } else {
            this.queueManager = new QueueManager(this.manager);
        }

        if (playbackManager.syncPlayEnabled) {
            playbackManager._playQueueManager = this.queueManager;
        }
    }

    /**
     * Binds to the player's events.
     */
    localBindToPlayer() {
        if (playbackManager.syncPlayEnabled) return;

        // Save local callbacks.
        playbackManager._localPlayPause = playbackManager.playPause;
        playbackManager._localUnpause = playbackManager.unpause;
        playbackManager._localPause = playbackManager.pause;
        playbackManager._localSeek = playbackManager.seek;
        playbackManager._localSendCommand = playbackManager.sendCommand;

        // Override local callbacks.
        playbackManager.playPause = this.playPauseRequest;
        playbackManager.unpause = this.unpauseRequest;
        playbackManager.pause = this.pauseRequest;
        playbackManager.seek = this.seekRequest;
        playbackManager.sendCommand = this.sendCommandRequest;

        // Save local callbacks.
        playbackManager._localPlayQueueManager = playbackManager._playQueueManager;

        playbackManager._localPlay = playbackManager.play;
        playbackManager._localSetCurrentPlaylistItem = playbackManager.setCurrentPlaylistItem;
        playbackManager._localRemoveFromPlaylist = playbackManager.removeFromPlaylist;
        playbackManager._localMovePlaylistItem = playbackManager.movePlaylistItem;
        playbackManager._localQueue = playbackManager.queue;
        playbackManager._localQueueNext = playbackManager.queueNext;

        playbackManager._localNextTrack = playbackManager.nextTrack;
        playbackManager._localPreviousTrack = playbackManager.previousTrack;

        playbackManager._localSetRepeatMode = playbackManager.setRepeatMode;
        playbackManager._localSetQueueShuffleMode = playbackManager.setQueueShuffleMode;
        playbackManager._localToggleQueueShuffleMode = playbackManager.toggleQueueShuffleMode;

        // Override local callbacks.
        playbackManager._playQueueManager = this.queueManager;

        playbackManager.play = this.playRequest;
        playbackManager.setCurrentPlaylistItem = this.setCurrentPlaylistItemRequest;
        playbackManager.removeFromPlaylist = this.removeFromPlaylistRequest;
        playbackManager.movePlaylistItem = this.movePlaylistItemRequest;
        playbackManager.queue = this.queueRequest;
        playbackManager.queueNext = this.queueNextRequest;

        playbackManager.nextTrack = this.nextTrackRequest;
        playbackManager.previousTrack = this.previousTrackRequest;

        playbackManager.setRepeatMode = this.setRepeatModeRequest;
        playbackManager.setQueueShuffleMode = this.setQueueShuffleModeRequest;
        playbackManager.toggleQueueShuffleMode = this.toggleQueueShuffleModeRequest;

        playbackManager.syncPlayEnabled = true;
    }

    /**
     * Removes the bindings from the player's events.
     */
    localUnbindFromPlayer() {
        if (!playbackManager.syncPlayEnabled) return;

        playbackManager.playPause = playbackManager._localPlayPause;
        playbackManager.unpause = playbackManager._localUnpause;
        playbackManager.pause = playbackManager._localPause;
        playbackManager.seek = playbackManager._localSeek;
        playbackManager.sendCommand = playbackManager._localSendCommand;

        playbackManager._playQueueManager = playbackManager._localPlayQueueManager; // TODO: should move elsewhere?

        playbackManager.play = playbackManager._localPlay;
        playbackManager.setCurrentPlaylistItem = playbackManager._localSetCurrentPlaylistItem;
        playbackManager.removeFromPlaylist = playbackManager._localRemoveFromPlaylist;
        playbackManager.movePlaylistItem = playbackManager._localMovePlaylistItem;
        playbackManager.queue = playbackManager._localQueue;
        playbackManager.queueNext = playbackManager._localQueueNext;

        playbackManager.nextTrack = playbackManager._localNextTrack;
        playbackManager.previousTrack = playbackManager._localPreviousTrack;

        playbackManager.setRepeatMode = playbackManager._localSetRepeatMode;
        playbackManager.setQueueShuffleMode = playbackManager._localSetQueueShuffleMode;
        playbackManager.toggleQueueShuffleMode = playbackManager._localToggleQueueShuffleMode;

        playbackManager.syncPlayEnabled = false;
    }

    /**
     * Overrides PlaybackManager's playPause method.
     */
    playPauseRequest() {
        const controller = syncPlayManager.getController();
        controller.playPause();
    }

    /**
     * Overrides PlaybackManager's unpause method.
     */
    unpauseRequest() {
        const controller = syncPlayManager.getController();
        controller.unpause();
    }

    /**
     * Overrides PlaybackManager's pause method.
     */
    pauseRequest() {
        const controller = syncPlayManager.getController();
        controller.pause();
    }

    /**
     * Overrides PlaybackManager's seek method.
     */
    seekRequest(positionTicks, player) {
        const controller = syncPlayManager.getController();
        controller.seek(positionTicks);
    }

    /**
     * Overrides PlaybackManager's sendCommand method.
     */
    sendCommandRequest(command, player) {
        console.debug('SyncPlay sendCommand:', command.Name, command);
        const controller = syncPlayManager.getController();
        const playerWrapper = syncPlayManager.getPlayerWrapper();

        const defaultAction = (_command, _player) => {
            playerWrapper.localSendCommand(_command);
        };

        const ignoreCallback = (_command, _player) => {
            // Do nothing.
        };

        const SetRepeatModeCallback = (_command, _player) => {
            controller.setRepeatMode(_command.Arguments.RepeatMode);
        };

        const SetShuffleQueueCallback = (_command, _player) => {
            controller.setShuffleMode(_command.Arguments.ShuffleMode);
        };

        // Commands to override.
        const overrideCommands = {
            PlaybackRate: ignoreCallback,
            SetRepeatMode: SetRepeatModeCallback,
            SetShuffleQueue: SetShuffleQueueCallback
        };

        // Handle command.
        const commandHandler = overrideCommands[command.Name];
        if (typeof commandHandler === 'function') {
            commandHandler(command, player);
        } else {
            defaultAction(command, player);
        }
    }

    /**
     * Calls original PlaybackManager's unpause method.
     */
    localUnpause() {
        if (playbackManager.syncPlayEnabled) {
            playbackManager._localUnpause(this.player);
        } else {
            playbackManager.unpause(this.player);
        }
    }

    /**
     * Calls original PlaybackManager's pause method.
     */
    localPause() {
        if (playbackManager.syncPlayEnabled) {
            playbackManager._localPause(this.player);
        } else {
            playbackManager.pause(this.player);
        }
    }

    /**
     * Calls original PlaybackManager's seek method.
     */
    localSeek(positionTicks) {
        if (playbackManager.syncPlayEnabled) {
            playbackManager._localSeek(positionTicks, this.player);
        } else {
            playbackManager.seek(positionTicks, this.player);
        }
    }

    /**
     * Calls original PlaybackManager's stop method.
     */
    localStop() {
        playbackManager.stop(this.player);
    }

    /**
     * Calls original PlaybackManager's sendCommand method.
     */
    localSendCommand(cmd) {
        if (playbackManager.syncPlayEnabled) {
            playbackManager._localSendCommand(cmd, this.player);
        } else {
            playbackManager.sendCommand(cmd, this.player);
        }
    }

    /**
     * Overrides PlaybackManager's play method.
     */
    playRequest(options) {
        const controller = syncPlayManager.getController();
        controller.play(options);
    }

    /**
     * Overrides PlaybackManager's setCurrentPlaylistItem method.
     */
    setCurrentPlaylistItemRequest(playlistItemId, player) {
        const controller = syncPlayManager.getController();
        controller.setCurrentPlaylistItem(playlistItemId);
    }

    /**
     * Overrides PlaybackManager's removeFromPlaylist method.
     */
    removeFromPlaylistRequest(playlistItemIds, player) {
        const controller = syncPlayManager.getController();
        controller.removeFromPlaylist(playlistItemIds);
    }

    /**
     * Overrides PlaybackManager's movePlaylistItem method.
     */
    movePlaylistItemRequest(playlistItemId, newIndex, player) {
        const controller = syncPlayManager.getController();
        controller.movePlaylistItem(playlistItemId, newIndex);
    }

    /**
     * Overrides PlaybackManager's queue method.
     */
    queueRequest(options, player) {
        const controller = syncPlayManager.getController();
        controller.queue(options);
    }

    /**
     * Overrides PlaybackManager's queueNext method.
     */
    queueNextRequest(options, player) {
        const controller = syncPlayManager.getController();
        controller.queueNext(options);
    }

    /**
     * Overrides PlaybackManager's nextTrack method.
     */
    nextTrackRequest(player) {
        const controller = syncPlayManager.getController();
        controller.nextItem();
    }

    /**
     * Overrides PlaybackManager's previousTrack method.
     */
    previousTrackRequest(player) {
        const controller = syncPlayManager.getController();
        controller.previousItem();
    }

    /**
     * Overrides PlaybackManager's setRepeatMode method.
     */
    setRepeatModeRequest(mode, player) {
        const controller = syncPlayManager.getController();
        controller.setRepeatMode(mode);
    }

    /**
     * Overrides PlaybackManager's setQueueShuffleMode method.
     */
    setQueueShuffleModeRequest(mode, player) {
        const controller = syncPlayManager.getController();
        controller.setShuffleMode(mode);
    }

    /**
     * Overrides PlaybackManager's toggleQueueShuffleMode method.
     */
    toggleQueueShuffleModeRequest(player) {
        const controller = syncPlayManager.getController();
        controller.toggleShuffleMode();
    }

    /**
     * Calls original PlaybackManager's play method.
     */
    async localPlay(options) {
        // FIXME: don't use play as first item won't be generated using custom queue manager.
        // if (playbackManager.syncPlayEnabled) {
        //     return playbackManager._localPlay(options);
        // } else {
        //     return playbackManager.play(options);
        // }

        const playlistItemId = this.queueManager.getCurrentPlaylistItemId();
        this.localSetCurrentPlaylistItem(playlistItemId);
    }

    /**
     * Calls original PlaybackManager's setCurrentPlaylistItem method.
     */
    async localSetCurrentPlaylistItem(playlistItemId) {
        // Check queue for files that need to be opened.
        try {
            await this.checkOfflineItems();
        } catch (error) {
            return;
        }

        if (playbackManager.syncPlayEnabled) {
            return playbackManager._localSetCurrentPlaylistItem(playlistItemId, this.player);
        } else {
            return playbackManager.setCurrentPlaylistItem(playlistItemId, this.player);
        }
    }

    /**
     * Calls original PlaybackManager's removeFromPlaylist method.
     */
    localRemoveFromPlaylist(playlistItemIds) {
        if (playbackManager.syncPlayEnabled) {
            return playbackManager._localRemoveFromPlaylist(playlistItemIds, this.player);
        } else {
            return playbackManager.removeFromPlaylist(playlistItemIds, this.player);
        }
    }

    /**
     * Calls original PlaybackManager's movePlaylistItem method.
     */
    localMovePlaylistItem(playlistItemId, newIndex) {
        if (playbackManager.syncPlayEnabled) {
            return playbackManager._localMovePlaylistItem(playlistItemId, newIndex, this.player);
        } else {
            return playbackManager.movePlaylistItem(playlistItemId, newIndex, this.player);
        }
    }

    /**
     * Calls original PlaybackManager's queue method.
     */
    localQueue(options) {
        if (playbackManager.syncPlayEnabled) {
            return playbackManager._localQueue(options, this.player);
        } else {
            return playbackManager.queue(options, this.player);
        }
    }

    /**
     * Calls original PlaybackManager's queueNext method.
     */
    localQueueNext(options) {
        if (playbackManager.syncPlayEnabled) {
            return playbackManager._localQueueNext(options, this.player);
        } else {
            return playbackManager.queueNext(options, this.player);
        }
    }

    /**
     * Calls original PlaybackManager's nextTrack method.
     */
    async localNextItem() {
        // Check queue for files that need to be opened.
        await this.checkOfflineItems();

        if (playbackManager.syncPlayEnabled) {
            playbackManager._localNextTrack(this.player);
        } else {
            playbackManager.nextTrack(this.player);
        }
    }

    /**
     * Calls original PlaybackManager's previousTrack method.
     */
    async localPreviousItem() {
        // Check queue for files that need to be opened.
        await this.checkOfflineItems();

        if (playbackManager.syncPlayEnabled) {
            playbackManager._localPreviousTrack(this.player);
        } else {
            playbackManager.previousTrack(this.player);
        }
    }

    /**
     * Calls original PlaybackManager's setRepeatMode method.
     */
    localSetRepeatMode(value) {
        if (playbackManager.syncPlayEnabled) {
            playbackManager._localSetRepeatMode(value, this.player);
        } else {
            playbackManager.setRepeatMode(value, this.player);
        }
    }

    /**
     * Calls original PlaybackManager's setQueueShuffleMode method.
     */
    localSetQueueShuffleMode(value) {
        if (playbackManager.syncPlayEnabled) {
            playbackManager._localSetQueueShuffleMode(value, this.player);
        } else {
            playbackManager.setQueueShuffleMode(value, this.player);
        }
    }

    /**
     * Calls original PlaybackManager's toggleQueueShuffleMode method.
     */
    localToggleQueueShuffleMode() {
        if (playbackManager.syncPlayEnabled) {
            playbackManager._localToggleQueueShuffleMode(this.player);
        } else {
            playbackManager.toggleQueueShuffleMode(this.player);
        }
    }

    /**
     * Open required files for offline playback if needed.
     */
    checkOfflineItems() {
        if (this.enableOfflinePlayback) {
            const items = this.queueManager.getPlaylist();
            return OfflinePlayback.checkOfflineItems(items);
        }
    }
}

export default NoActivePlayer;

import { MediaSourceType } from '@jellyfin/sdk/lib/generated-client/models/media-source-type';
import { MediaStreamType } from '@jellyfin/sdk/lib/generated-client/models/media-stream-type';
import type { MediaSourceInfo } from '@jellyfin/sdk/lib/generated-client/models/media-source-info';
import type { MediaStream } from '@jellyfin/sdk/lib/generated-client/models/media-stream';

import React, {
    type FC,
    type PropsWithChildren,
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback
} from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';
import itemHelper from 'components/itemHelper';
import { ItemDto } from 'types/base/models/item-dto';

export interface TrackSelectionsContextProps {
    mediaSourceInfo: MediaSourceInfo | undefined;
    mediaSources: MediaSourceInfo[];
    groupedVersions: MediaSourceInfo[] | undefined;
    videoTracks: MediaStream[];
    audioTracks: MediaStream[];
    subtitleTracks: MediaStream[];
    selectedMediaSourceId: string;
    selectedVideoTrack: number;
    selectedAudioTrack: number;
    selectedSubtitleTrack: number;
    handleMediaSourceChange: (event: SelectChangeEvent) => void;
    handleVideoTrackChange: (event: SelectChangeEvent<number>) => void;
    handleAudioTrackChange: (event: SelectChangeEvent<number>) => void;
    handleSubtitleTrackChange: (event: SelectChangeEvent<number>) => void;
}

export const TrackSelectionsContext =
    createContext<TrackSelectionsContextProps>(
        {} as TrackSelectionsContextProps
    );

export const useTrackSelections = () => useContext(TrackSelectionsContext);

interface TrackSelectionsProviderProps {
    item: ItemDto;
    paramId: string | null;
}

export const TrackSelectionsProvider: FC<
    PropsWithChildren<TrackSelectionsProviderProps>
> = ({ item, paramId, children }) => {
    const [selectedMediaSourceId, setSelectedMediaSourceId] = useState<string>(
        item.MediaSources?.[0].Id || paramId || ''
    );

    const getCurrentMediaSource = useCallback(
        (selectedId: string) => {
            const selectedSource =
                item.MediaSources?.find((m) => m.Id === selectedId)
                || item.MediaSources?.[0]
                || {};

            const videoTracks = (selectedSource.MediaStreams || []).filter(
                (m) => m.Type === MediaStreamType.Video
            );

            const audioTracks = (selectedSource.MediaStreams || [])
                .filter((m) => m.Type === MediaStreamType.Audio)
                .sort(itemHelper.sortTracks);

            const subtitleTracks = (selectedSource.MediaStreams || [])
                .filter((m) => m.Type === MediaStreamType.Subtitle)
                .sort(itemHelper.sortTracks);

            const defaultVideoStreamIndex = videoTracks.length ?
                videoTracks[0].Index || 0 :
                -1;

            const defaultAudioStreamIndex =
                selectedSource.DefaultAudioStreamIndex || -1;

            const defaultSubtitleStreamIndex =
                selectedSource.DefaultSubtitleStreamIndex == null ?
                    -1 :
                    selectedSource.DefaultSubtitleStreamIndex;

            return {
                mediaSources: item.MediaSources || [],
                selectedSource,
                videoTracks,
                audioTracks,
                subtitleTracks,
                defaultVideoStreamIndex,
                defaultAudioStreamIndex,
                defaultSubtitleStreamIndex
            };
        },
        [item.MediaSources]
    );

    const currentMediaSource = getCurrentMediaSource(selectedMediaSourceId);

    const [selectedVideoTrack, setSelectedVideoTrack] = useState<number>(
        currentMediaSource.defaultVideoStreamIndex
    );
    const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(
        currentMediaSource.defaultAudioStreamIndex
    );
    const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<number>(
        currentMediaSource.defaultSubtitleStreamIndex
    );

    const groupedVersions = useMemo(() => {
        return item.MediaSources?.filter(
            (g) => g.Type === MediaSourceType.Grouping
        );
    }, [item.MediaSources]);

    const handleMediaSourceChange = useCallback(
        (event: SelectChangeEvent) => {
            const _currentMediaSource = getCurrentMediaSource(
                event.target.value
            );
            setSelectedMediaSourceId(event.target.value);
            setSelectedVideoTrack(_currentMediaSource.defaultVideoStreamIndex);
            setSelectedAudioTrack(_currentMediaSource.defaultAudioStreamIndex);
            setSelectedSubtitleTrack(
                _currentMediaSource.defaultSubtitleStreamIndex
            );
        },
        [getCurrentMediaSource, setSelectedMediaSourceId]
    );

    const handleVideoTrackChange = useCallback(
        (event: SelectChangeEvent<number>) => {
            setSelectedVideoTrack(event.target.value as number);
        },
        [setSelectedVideoTrack]
    );

    const handleAudioTrackChange = useCallback(
        (event: SelectChangeEvent<number>) => {
            setSelectedAudioTrack(event.target.value as number);
        },
        [setSelectedAudioTrack]
    );

    const handleSubtitleTrackChange = useCallback(
        (event: SelectChangeEvent<number>) => {
            setSelectedSubtitleTrack(event.target.value as number);
        },
        [setSelectedSubtitleTrack]
    );

    const contextValue: TrackSelectionsContextProps = useMemo(
        () => ({
            selectedMediaSourceId,
            mediaSourceInfo: currentMediaSource.selectedSource,
            mediaSources: currentMediaSource.mediaSources,
            groupedVersions,
            videoTracks: currentMediaSource.videoTracks,
            audioTracks: currentMediaSource.audioTracks,
            subtitleTracks: currentMediaSource.subtitleTracks,
            selectedVideoTrack,
            selectedAudioTrack,
            selectedSubtitleTrack,
            handleMediaSourceChange,
            handleVideoTrackChange,
            handleAudioTrackChange,
            handleSubtitleTrackChange
        }),
        [
            currentMediaSource.audioTracks,
            currentMediaSource.mediaSources,
            currentMediaSource.selectedSource,
            currentMediaSource.subtitleTracks,
            currentMediaSource.videoTracks,
            groupedVersions,
            handleAudioTrackChange,
            handleMediaSourceChange,
            handleSubtitleTrackChange,
            handleVideoTrackChange,
            selectedAudioTrack,
            selectedMediaSourceId,
            selectedSubtitleTrack,
            selectedVideoTrack
        ]
    );

    return (
        <TrackSelectionsContext.Provider value={contextValue}>
            {children}
        </TrackSelectionsContext.Provider>
    );
};

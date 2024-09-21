import React, { type FC } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTrackSelections } from '../hooks/useTrackSelections';
import globalize from 'lib/globalize';
import mediainfo from 'components/mediainfo/mediainfo';

interface TrackSelectionsProps {
    className?: string;
}

const TrackSelections: FC<TrackSelectionsProps> = ({
    className
}) => {
    const {
        mediaSources,
        selectedMediaSourceId,
        handleMediaSourceChange,
        handleVideoTrackChange,
        handleAudioTrackChange,
        handleSubtitleTrackChange,
        videoTracks,
        audioTracks,
        subtitleTracks,
        selectedVideoTrack,
        selectedAudioTrack,
        selectedSubtitleTrack
    } = useTrackSelections();

    return (
        <Box
            component='form'
            className={className}
        >
            {mediaSources.length > 1 && (
                <FormControl
                    className='selectContainer flex-shrink-zero'
                    size='small'
                    fullWidth
                >
                    <InputLabel id='selectVersionLabel'>
                        <Typography component='span'>
                            {globalize.translate('LabelVersion')}
                        </Typography>
                    </InputLabel>
                    <Select
                        labelId='selectVersionLabel'
                        id='selectSource'
                        value={selectedMediaSourceId}
                        label={globalize.translate('LabelVersion')}
                        onChange={handleMediaSourceChange}
                    >
                        {mediaSources.map((option) => (
                            <MenuItem key={option.Id} value={option.Id || ''}>
                                <Typography component='span'>
                                    {option.Name}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {videoTracks && videoTracks.length > 0 && (
                <FormControl
                    className='selectContainer flex-shrink-zero'
                    size='small'
                    disabled={videoTracks.length <= 1}
                    fullWidth
                >
                    <InputLabel id='selectVideoLabel'>
                        <Typography component='span'>
                            {globalize.translate('Video')}
                        </Typography>
                    </InputLabel>
                    <Select
                        labelId='selectVideoLabel'
                        id='selectVideo'
                        value={selectedVideoTrack}
                        label={globalize.translate('Video')}
                        onChange={handleVideoTrackChange}
                    >
                        {videoTracks.map((videoTrack) => {
                            const titleParts = [];
                            const resolutionText =
                                mediainfo.getResolutionText(videoTrack);

                            if (resolutionText) {
                                titleParts.push(resolutionText);
                            }

                            if (videoTrack.Codec) {
                                titleParts.push(videoTrack.Codec.toUpperCase());
                            }
                            return (
                                <MenuItem
                                    key={videoTrack.Index}
                                    value={videoTrack.Index}
                                >
                                    <Typography component='span'>
                                        {videoTrack.DisplayTitle
                                            || titleParts.join(' ')}
                                    </Typography>
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            )}

            {audioTracks && audioTracks.length > 0 && (
                <FormControl
                    className='selectContainer flex-shrink-zero'
                    size='small'
                    disabled={audioTracks.length <= 1}
                    fullWidth
                >
                    <InputLabel id='selectAudioLabel'>
                        <Typography component='span'>
                            {globalize.translate('Audio')}
                        </Typography>
                    </InputLabel>
                    <Select
                        labelId='selectAudioLabel'
                        id='selectAudio'
                        value={selectedAudioTrack}
                        label={globalize.translate('Audio')}
                        onChange={handleAudioTrackChange}
                    >
                        {audioTracks.map((audioTrack) => (
                            <MenuItem
                                key={audioTrack.Index}
                                value={audioTrack.Index}
                            >
                                <Typography component='span'>
                                    {audioTrack.DisplayTitle}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {subtitleTracks && subtitleTracks.length > 0 && (
                <FormControl
                    className='selectContainer flex-shrink-zero'
                    size='small'
                    disabled={subtitleTracks?.length <= 0}
                    fullWidth
                >
                    <InputLabel id='selectSubtitlesLabel'>
                        <Typography component='span'>
                            {globalize.translate('Subtitle')}
                        </Typography>
                    </InputLabel>
                    <Select
                        labelId='selectSubtitlesLabel'
                        id='selectSubtitles'
                        value={selectedSubtitleTrack}
                        label={globalize.translate('Subtitle')}
                        onChange={handleSubtitleTrackChange}
                    >
                        <MenuItem key={-1} value={-1}>
                            <Typography component='span'>
                                {globalize.translate('Off')}
                            </Typography>
                        </MenuItem>
                        {subtitleTracks.map((subtitleTrack) => (
                            <MenuItem
                                key={subtitleTrack.Index}
                                value={subtitleTrack.Index}
                            >
                                <Typography component='span'>
                                    {subtitleTrack.DisplayTitle}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        </Box>
    );
};

export default TrackSelections;

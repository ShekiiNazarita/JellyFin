import type { UserDto } from '@jellyfin/sdk/lib/generated-client/models/user-dto';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import React, { type FC } from 'react';
import Typography from '@mui/material/Typography';
import itemHelper from 'components/itemHelper';
import { playbackManager } from 'components/playback/playbackmanager';
import { getSeriesAirTime } from '../utils/items';
import TrackSelections from './TrackSelections';
import RecordingFieldsContainer from './RecordingFieldsContainer';
import DetailsGroup from './detailsGroup/DetailsGroup';
import type { ItemDto } from 'types/base/models/item-dto';
import { ItemKind } from 'types/base/models/item-kind';
import SeriesRecordingEditorContainer from './SeriesRecordingEditorContainer';

interface DetailSecondaryContainerProps {
    item: ItemDto;
    context?: CollectionType;
    user?: UserDto;
}

const DetailSecondaryContainer: FC<DetailSecondaryContainerProps> = ({
    item,
    context,
    user
}) => {
    const { Type, AirDays = [], AirTime, Status } = item;

    const seriesAirTimeText = React.useMemo(
        () => getSeriesAirTime(Type, AirDays, AirTime, Status),
        [AirDays, AirTime, Status, Type]
    );

    return (
        <div className='detailPagePrimaryContent padded-right'>
            <div className='detailSection'>
                {!item.MediaSources
                || !itemHelper.supportsMediaSourceSelection(item)
                || playbackManager
                    .getSupportedCommands()
                    .indexOf('PlayMediaSource') === -1
                || !playbackManager.canPlay(item) ? null : (
                        <TrackSelections className='trackSelections' />
                    )}

                {item.Id
                    && item.Type == ItemKind.Program
                    && user?.Policy?.EnableLiveTvManagement && (
                    <RecordingFieldsContainer
                        programId={item.Id}
                        serverId={item.ServerId}
                    />
                )}

                <div className='detailSectionContent'>
                    {item.Taglines && item.Taglines.length > 0 && (
                        <Typography
                            id='tagline'
                            className='tagline'
                            variant='h3'
                            my={1}
                        >
                            {item.Taglines[0]}
                        </Typography>
                    )}

                    {item.Overview && (
                        <Typography id='overview' className='overview' my={1}>
                            {item.Overview}
                        </Typography>
                    )}

                    {seriesAirTimeText && (
                        <Typography
                            id='seriesAirTime'
                            className='seriesAirTime'
                            variant='h5'
                            my={1}
                        >
                            {seriesAirTimeText}
                        </Typography>
                    )}

                    {item.Type === ItemKind.SeriesTimer
                        && user?.Policy?.EnableLiveTvManagement && (
                        <SeriesRecordingEditorContainer item={item} />
                    )}
                </div>

                <DetailsGroup
                    className='itemDetailsGroup'
                    item={item}
                    context={context}
                />
            </div>
        </div>
    );
};

export default DetailSecondaryContainer;

import React, { type FC } from 'react';

import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import { useGetTimers } from 'hooks/api/liveTvHooks';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';

import type { ItemDto } from 'types/base/models/item-dto';

interface SeriesTimerScheduleProps {
    seriesTimerId?: string | null;
}

const SeriesTimerSchedule: FC<SeriesTimerScheduleProps> = ({
    seriesTimerId
}) => {
    const { isLoading, data: timerInfoResult, refetch } = useGetTimers({
        seriesTimerId: seriesTimerId || ''
    });

    const timers = timerInfoResult?.Items as ItemDto[];

    if (isLoading) {
        return <Loading />;
    }

    if (!timers?.length) {
        return null;
    }

    const items = timers[0].SeriesTimerId != seriesTimerId ? [] : timers;

    return (
        <SectionContainer
            isListEnabled
            sectionHeaderProps={{
                title: globalize.translate('Schedule')
            }}
            itemsContainerProps={{
                className: 'vertical-list',
                queryKey: ['Timers'],
                reloadItems: refetch
            }}
            items={items}
            listOptions={{
                items: items,
                enableUserDataButtons: false,
                image: true,
                imageSource: 'channel',
                showProgramDateTime: true,
                showChannel: false,
                showMediaInfo: true,
                runtime: false,
                action: 'none',
                moreButton: false,
                recordButton: false,
                queryKey: ['Timers']
            }}
        />
    );
};

export default SeriesTimerSchedule;

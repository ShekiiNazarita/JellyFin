import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/models/api/item-sort-by';
import React, { type FC } from 'react';
import { useGetLiveTvPrograms } from 'hooks/api/liveTvHooks';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';

interface SeriesScheduleProps {
    librarySeriesId: string;
    userId?: string;
}

const SeriesSchedule: FC<SeriesScheduleProps> = ({
    librarySeriesId,
    userId
}) => {
    const {
        isLoading,
        data: itemResult,
        refetch
    } = useGetLiveTvPrograms({
        librarySeriesId,
        userId,
        imageTypeLimit: 1,
        hasAired: false,
        sortBy: [ItemSortBy.StartDate],
        enableTotalRecordCount: false,
        limit: 50,
        enableUserData: false,
        fields: [ItemFields.ChannelInfo, ItemFields.ChannelImage]
    });

    const liveTvPrograms = itemResult?.Items;

    if (isLoading) {
        return <Loading />;
    }

    if (!liveTvPrograms?.length) {
        return null;
    }

    return (
        <SectionContainer
            isListEnabled
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('HeaderUpcomingOnTV')
            }}
            itemsContainerProps={{
                className: 'vertical-list',
                queryKey: ['LiveTvPrograms'],
                reloadItems: refetch
            }}
            items={liveTvPrograms}
            listOptions={{
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
                queryKey: ['LiveTvPrograms']
            }}
        />
    );
};

export default SeriesSchedule;

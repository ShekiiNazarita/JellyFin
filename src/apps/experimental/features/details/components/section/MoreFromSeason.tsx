import React, { type FC } from 'react';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { useGetEpisodes } from 'hooks/api/tvShowsHooks';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import { CardShape } from 'utils/card';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';

interface MoreFromSeasonProps {
    seriesId: string;
    seasonId: string;
    seasonName?: string | null;
    userId?: string;
}

const MoreFromSeason: FC<MoreFromSeasonProps> = ({
    userId,
    seriesId,
    seasonId,
    seasonName
}) => {
    const {
        isLoading,
        data: itemResult,
        refetch
    } = useGetEpisodes({
        userId,
        seriesId,
        seasonId,
        fields: [
            ItemFields.ItemCounts,
            ItemFields.PrimaryImageAspectRatio,
            ItemFields.CanDelete,
            ItemFields.MediaSourceCount
        ]
    });

    const episodes = itemResult?.Items;

    if (isLoading) {
        return <Loading />;
    }

    if (!episodes?.length || episodes.length < 2) {
        return null;
    }

    return (
        <SectionContainer
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('MoreFromValue', seasonName)
            }}
            scrollerProps={{
                className: 'no-padding',
                isMouseWheelEnabled: false,
                isCenterFocusEnabled: true
            }}
            itemsContainerProps={{
                className: 'scrollSlider',
                queryKey: ['Episodes'],
                reloadItems: refetch
            }}
            items={episodes}
            cardOptions={{
                shape: CardShape.AutoOverflow,
                scalable: true,
                showTitle: true,
                overlayText: false,
                centerText: true,
                includeParentInfoInTitle: false,
                allowBottomPadding: false,
                queryKey: ['Episodes']
            }}
        />
    );
};

export default MoreFromSeason;

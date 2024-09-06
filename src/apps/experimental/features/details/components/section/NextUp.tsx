import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import React, { type FC } from 'react';
import { useGetNextUp } from 'hooks/api/tvShowsHooks';
import Loading from 'components/loading/LoadingComponent';
import globalize from 'lib/globalize';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import { CardShape } from 'utils/card';

interface NextUpProps {
    seriesId: string;
    userId?: string;
}

const NextUp: FC<NextUpProps> = ({ seriesId, userId }) => {
    const {
        isLoading,
        data: itemResult,
        refetch
    } = useGetNextUp({
        fields: [ItemFields.MediaSourceCount],
        seriesId,
        userId
    });

    const nextUp = itemResult?.Items;

    if (isLoading) {
        return <Loading />;
    }

    if (!nextUp?.length) {
        return null;
    }

    return (
        <SectionContainer
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('NextUp')
            }}
            scrollerProps={{
                className: 'no-padding',
                isMouseWheelEnabled: false,
                isCenterFocusEnabled: true
            }}
            itemsContainerProps={{
                className: 'scrollSlider',
                queryKey: ['NextUp'],
                reloadItems: refetch
            }}
            items={nextUp}
            cardOptions={{
                shape: CardShape.BackdropOverflow,
                showTitle: true,
                overlayText: false,
                centerText: true,
                overlayPlayButton: true,
                queryKey: ['NextUp']
            }}
        />
    );
};

export default NextUp;

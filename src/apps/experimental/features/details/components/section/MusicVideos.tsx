import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/models/api/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import React, { type FC } from 'react';
import { useGetItems } from 'hooks/api/itemsHooks';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';

import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import { CardShape } from 'utils/card';
import { ItemKind } from 'types/base/models/item-kind';

interface MusicVideosProps {
    itemType: ItemKind;
    itemId: string;
    userId?: string;
}

const MusicVideos: FC<MusicVideosProps> = ({ itemType, itemId, userId }) => {
    const { isLoading, data, refetch } = useGetItems({
        sortBy: [ItemSortBy.SortName],
        sortOrder: [SortOrder.Ascending],
        includeItemTypes: [ItemKind.MusicVideo],
        recursive: true,
        fields: [
            ItemFields.PrimaryImageAspectRatio,
            ItemFields.MediaSourceCount,
            ItemFields.CanDelete
        ],
        albumIds: itemType === ItemKind.MusicAlbum ? [itemId] : undefined,
        artistIds: itemType === ItemKind.MusicArtist ? [itemId] : undefined,
        userId
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!data?.Items?.length) {
        return null;
    }

    return (
        <SectionContainer
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('MusicVideos')
            }}
            scrollerProps={{
                className: 'no-padding',
                isMouseWheelEnabled: false,
                isCenterFocusEnabled: true
            }}
            itemsContainerProps={{
                className: 'scrollSlider',
                queryKey: ['Items'],
                reloadItems: refetch
            }}
            items={data.Items}
            cardOptions={{
                shape: CardShape.AutoOverflow,
                showTitle: true,
                action: 'play',
                overlayText: false,
                centerText: true,
                showRuntime: true,
                queryKey: ['Items']
            }}
        />
    );
};

export default MusicVideos;

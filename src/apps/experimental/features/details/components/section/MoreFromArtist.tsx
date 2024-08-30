import { ItemSortBy, SortOrder } from '@jellyfin/sdk/lib/generated-client';
import React, { type FC } from 'react';
import { useGetItems } from 'hooks/api/itemsHooks';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import { CardShape } from 'utils/card';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import { ItemKind } from 'types/base/models/item-kind';
import type { ItemDto } from 'types/base/models/item-dto';

interface MoreFromArtistProps {
    item: ItemDto;
    userId?: string;
}

const MoreFromArtist: FC<MoreFromArtistProps> = ({ item, userId }) => {
    const itemId = item.Id;
    const artistId = item.AlbumArtists?.map((artist) => artist.Id || '');

    const { isLoading, data, refetch } = useGetItems({
        sortBy: [
            ItemSortBy.PremiereDate,
            ItemSortBy.ProductionYear,
            ItemSortBy.SortName
        ],
        sortOrder: [SortOrder.Descending],
        includeItemTypes: [ItemKind.MusicAlbum],
        recursive: true,
        contributingArtistIds:
            item.Type === ItemKind.MusicArtist && itemId ? [itemId] : artistId,
        userId
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!data?.Items?.length) {
        return null;
    }

    const title =
        item.Type === ItemKind.MusicArtist ?
            globalize.translate('HeaderAppearsOn') :
            globalize.translate('MoreFromValue', item.AlbumArtists?.[0].Name);

    return (
        <SectionContainer
            sectionHeaderProps={{
                className: 'no-padding',
                title: title
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
                scalable: true,
                coverImage: true,
                showTitle: true,
                showParentTitle: false,
                centerText: true,
                overlayText: false,
                overlayPlayButton: true,
                showYear: true,
                queryKey: ['Items']
            }}
        />
    );
};

export default MoreFromArtist;

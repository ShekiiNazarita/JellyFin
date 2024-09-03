import type {
    NameGuidPair,
    CollectionType
} from '@jellyfin/sdk/lib/generated-client';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import React, { type FC } from 'react';
import { useGetSimilarItems } from 'hooks/api/libraryHooks';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import { CardShape } from 'utils/card';
import { ItemKind } from 'types/base/models/item-kind';

interface SimilarItemsProps {
    itemId: string;
    itemType: ItemKind;
    userId?: string;
    albumArtists?: NameGuidPair[] | null;
    context?: CollectionType;
}

const SimilarItems: FC<SimilarItemsProps> = ({
    itemId,
    itemType,
    userId,
    albumArtists,
    context
}) => {
    let excludeArtistIds;

    if (itemType === ItemKind.MusicAlbum && albumArtists?.length) {
        excludeArtistIds = albumArtists[0].Id;
    }
    const {
        isLoading,
        data: itemResult,
        refetch
    } = useGetSimilarItems({
        limit: 12,
        fields: [ItemFields.PrimaryImageAspectRatio, ItemFields.CanDelete],
        excludeArtistIds: excludeArtistIds ? [excludeArtistIds] : undefined,
        itemId,
        userId
    });

    const similarItems = itemResult?.Items;

    if (isLoading) {
        return <Loading />;
    }

    if (!similarItems?.length) {
        return null;
    }

    return (
        <SectionContainer
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('HeaderMoreLikeThis')
            }}
            scrollerProps={{
                className: 'no-padding',
                isMouseWheelEnabled: false,
                isCenterFocusEnabled: true
            }}
            itemsContainerProps={{
                className: 'scrollSlider',
                queryKey: ['SimilarItems'],
                reloadItems: refetch
            }}
            items={similarItems}
            cardOptions={{
                shape: CardShape.AutoOverflow,
                showParentTitle: itemType == ItemKind.MusicAlbum,
                centerText: true,
                showTitle: true,
                context: context,
                lazy: true,
                showDetailsMenu: true,
                coverImage:
                    itemType == ItemKind.MusicAlbum
                    || itemType == ItemKind.MusicArtist,
                overlayPlayButton: true,
                overlayText: false,
                showYear:
                    itemType === ItemKind.Movie
                    || itemType === ItemKind.Trailer
                    || itemType === ItemKind.Series,
                queryKey: ['SimilarItems']
            }}
        />
    );
};

export default SimilarItems;

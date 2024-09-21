import type { AxiosRequestConfig } from 'axios';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { useQuery } from '@tanstack/react-query';
import { JellyfinApiContext, useApi } from '../../../../../hooks/useApi';
import { NullableString } from 'types/base/common/shared/types';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';
import type { ItemDto } from 'types/base/models/item-dto';
import type { CardOptions } from 'types/cardOptions';
import { CardShape } from 'utils/card';
import { ItemMediaKind } from 'types/base/models/item-media-kind';
import { ItemKind } from 'types/base/models/item-kind';

type CollectionItemTypes = {
    name: string;
    mediaType?: ItemMediaKind;
    type?: ItemKind;
};

const collectionItemTypes: CollectionItemTypes[] = [
    {
        name: 'Movies',
        type: ItemKind.Movie
    },
    {
        name: 'Series',
        type: ItemKind.Series
    },
    {
        name: 'Episodes',
        type: ItemKind.Episode
    },
    {
        name: 'HeaderVideos',
        mediaType: ItemMediaKind.Video
    },
    {
        name: 'Albums',
        type: ItemKind.MusicAlbum
    },
    {
        name: 'Books',
        type: ItemKind.Book
    }
];

function filterItemsByCollectionItemType(
    items: ItemDto[],
    typeInfo?: CollectionItemTypes
) {
    const filteredItems: ItemDto[] = [];
    const leftoverItems: ItemDto[] = [];
    items.forEach((item) => {
        if (
            (typeInfo?.mediaType && item.MediaType == typeInfo.mediaType)
            || item.Type == typeInfo?.type
        ) {
            filteredItems.push(item);
        } else {
            leftoverItems.push(item);
        }
    });
    return [filteredItems, leftoverItems];
}

export interface Section {
    title: string;
    items: ItemDto[];
    cardOptions?: CardOptions;
}

function getCollectionItemsByType(items: ItemDto[]) {
    const sections: Section[] = [];
    let typeItems = [];
    let otherTypeItems = items;

    for (const collectionItemType of collectionItemTypes) {
        [typeItems, otherTypeItems] = filterItemsByCollectionItemType(
            otherTypeItems,
            collectionItemType
        );

        if (typeItems.length) {
            sections.push({
                title: collectionItemType.name,
                items: typeItems,
                cardOptions: {
                    shape:
                        collectionItemType.type == ItemKind.MusicAlbum ?
                            CardShape.SquareOverflow :
                            CardShape.PortraitOverflow,
                    showYear:
                        collectionItemType.mediaType === ItemMediaKind.Video
                        || collectionItemType.type === ItemKind.Series
                }
            });
        }
    }

    if (otherTypeItems.length) {
        sections.push({
            title: 'HeaderOtherItems',
            items: otherTypeItems,
            cardOptions: {
                shape: CardShape.PortraitOverflow,
                showYear: false
            }
        });
    }

    return sections;
}

const getItems = async (
    apiContext: JellyfinApiContext,
    itemId: NullableString,
    options?: AxiosRequestConfig
) => {
    const { api, user } = apiContext;

    if (!api) throw new Error('No API instance available');
    if (!user?.Id) throw new Error('No item User ID provided');

    const response = await getItemsApi(api).getItems(
        {
            userId: user.Id,
            fields: [
                ItemFields.ItemCounts,
                ItemFields.PrimaryImageAspectRatio,
                ItemFields.CanDelete,
                ItemFields.MediaSourceCount
            ],
            parentId: itemId || undefined
        },
        options
    );

    const itemResult = response.data as ItemDtoQueryResult;
    const items = itemResult.Items || [];

    return getCollectionItemsByType(items);
};

export const useGetCollectionItemsByType = (itemId: NullableString, enabled: boolean) => {
    const apiContext = useApi();
    return useQuery({
        queryKey: ['CollectionItemsByType', itemId],
        queryFn: ({ signal }) => getItems(apiContext, itemId, { signal }),
        enabled: !!apiContext.api && !!apiContext.user?.Id && enabled
    });
};

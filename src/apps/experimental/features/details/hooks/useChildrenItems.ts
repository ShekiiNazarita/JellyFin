import type { AxiosRequestConfig } from 'axios';

import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import { useQuery } from '@tanstack/react-query';
import { JellyfinApiContext, useApi } from '../../../../../hooks/useApi';
import { ItemSortBy } from '@jellyfin/sdk/lib/models/api/item-sort-by';
import { NullableString } from 'types/base/common/shared/types';
import { ItemKind } from 'types/base/models/item-kind';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';

const getItemsViewByType = async (
    apiContext: JellyfinApiContext,
    childrenItemsOpts: ChildrenItemsOpts,
    options?: AxiosRequestConfig
) => {
    const { api, user } = apiContext;

    if (!api) throw new Error('No API instance available');
    if (!user?.Id) throw new Error('No User ID provided');

    const { itemType, itemId, itemSeriesId } = childrenItemsOpts;

    const fields: ItemFields[] = [
        ItemFields.ItemCounts,
        ItemFields.PrimaryImageAspectRatio,
        ItemFields.CanDelete,
        ItemFields.MediaSourceCount
    ];

    const sortBy: ItemSortBy[] = [];

    if (itemType == ItemKind.MusicAlbum) {
        sortBy.push(ItemSortBy.SortName);
    } else if (itemType == ItemKind.MusicArtist) {
        sortBy.push(
            ItemSortBy.PremiereDate,
            ItemSortBy.ProductionYear,
            ItemSortBy.SortName
        );
    } else if (itemType !== ItemKind.BoxSet) {
        sortBy.push(ItemSortBy.SortName);
    }

    let response;
    switch (itemType) {
        case ItemKind.Series: {
            if (!itemId) throw new Error('No Item ID provided');

            response = await getTvShowsApi(api).getSeasons(
                {
                    userId: user.Id,
                    seriesId: itemId,
                    fields
                },
                options
            );
            break;
        }
        case ItemKind.Season: {
            if (!itemSeriesId) throw new Error('No Series ID provided');
            response = await getTvShowsApi(api).getEpisodes(
                {
                    userId: user.Id,
                    seriesId: itemSeriesId,
                    seasonId: itemId || undefined,
                    fields: [...fields, ItemFields.Overview]
                },
                options
            );
            break;
        }
        default: {
            if (!itemId) throw new Error('No Item ID provided');
            response = await getItemsApi(api).getItems(
                {
                    userId: user.Id,
                    parentId: itemId,
                    fields,
                    sortBy
                },
                options
            );
            break;
        }
    }
    return response.data as ItemDtoQueryResult;
};

interface ChildrenItemsOpts {
    itemType: ItemKind;
    itemId: NullableString;
    itemSeriesId: NullableString;
    itemSeasonId: NullableString;
}

export const useChildrenItems = (childrenItemsOpts: ChildrenItemsOpts) => {
    const apiContext = useApi();
    return useQuery({
        queryKey: ['ChildrenItems', childrenItemsOpts],
        queryFn: ({ signal }) =>
            getItemsViewByType(apiContext, childrenItemsOpts, { signal }),
        enabled: !!apiContext.api && !!apiContext.user?.Id
    });
};

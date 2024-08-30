import type { AxiosRequestConfig } from 'axios';
import type { ItemsApiGetItemsRequest } from '@jellyfin/sdk/lib/generated-client';
import { ItemSortBy } from '@jellyfin/sdk/lib/models/api/item-sort-by';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';

const getItems = async (
    apiContext: JellyfinApiContext,
    params: ItemsApiGetItemsRequest,
    options?: AxiosRequestConfig
) => {
    const { api, user } = apiContext;
    if (!api) throw new Error('No API instance available');
    if (!user?.Id) throw new Error('No item User ID provided');

    const response = await getItemsApi(api).getItems(
        {
            userId: user.Id,
            ...params
        },
        options
    );
    return response.data as ItemDtoQueryResult;
};

export const getItemsQuery = (
    apiContext: JellyfinApiContext,
    params: ItemsApiGetItemsRequest
) =>
    queryOptions({
        queryKey: ['Items', params],
        queryFn: ({ signal }) => getItems(apiContext, params, { signal }),
        gcTime: params.sortBy?.includes(ItemSortBy.Random) ? 0 : undefined,
        enabled: !!apiContext.api && !!apiContext.user?.Id
    });

export const useGetItems = (params: ItemsApiGetItemsRequest) => {
    const apiContext = useApi();
    return useQuery(getItemsQuery(apiContext, params));
};

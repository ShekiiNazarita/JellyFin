import type { AxiosRequestConfig } from 'axios';
import type { LibraryApiGetSimilarItemsRequest } from '@jellyfin/sdk/lib/generated-client';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';

const getSimilarItems = async (
    apiContext: JellyfinApiContext,
    params: LibraryApiGetSimilarItemsRequest,
    options?: AxiosRequestConfig
) => {
    const { api } = apiContext;
    if (!api) throw new Error('No API instance available');
    const response = await getLibraryApi(api).getSimilarItems(params, options);
    return response.data as ItemDtoQueryResult;
};

export const getSimilarItemsQuery = (
    apiContext: JellyfinApiContext,
    params: LibraryApiGetSimilarItemsRequest
) =>
    queryOptions({
        queryKey: ['SimilarItems', params.itemId],
        queryFn: ({ signal }) =>
            getSimilarItems(apiContext, params, { signal }),
        enabled: !!apiContext.api && !!params.userId && !!params.itemId
    });

export const useGetSimilarItems = (
    params: LibraryApiGetSimilarItemsRequest
) => {
    const apiContext = useApi();
    return useQuery(getSimilarItemsQuery(apiContext, params));
};

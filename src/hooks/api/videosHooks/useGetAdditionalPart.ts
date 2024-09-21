import type { AxiosRequestConfig } from 'axios';
import type { VideosApiGetAdditionalPartRequest } from '@jellyfin/sdk/lib/generated-client';
import { getVideosApi } from '@jellyfin/sdk/lib/utils/api/videos-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';

const getAdditionalPart = async (
    currentApi: JellyfinApiContext,
    params: VideosApiGetAdditionalPartRequest,
    options?: AxiosRequestConfig
) => {
    const { api } = currentApi;

    if (!api) throw new Error('No API instance available');
    if (!params.itemId) throw new Error('No item ID provided');

    const response = await getVideosApi(api).getAdditionalPart(params, options);
    return response.data as ItemDtoQueryResult;
};

export const getAdditionalPartQuery = (
    apiContext: JellyfinApiContext,
    params: VideosApiGetAdditionalPartRequest
) =>
    queryOptions({
        queryKey: ['AdditionalPart', params.itemId],
        queryFn: ({ signal }) =>
            getAdditionalPart(apiContext, params, { signal }),
        enabled: !!apiContext.api && !!params.itemId
    });

export const useGetAdditionalPart = (
    params: VideosApiGetAdditionalPartRequest
) => {
    const apiContext = useApi();
    return useQuery(getAdditionalPartQuery(apiContext, params));
};

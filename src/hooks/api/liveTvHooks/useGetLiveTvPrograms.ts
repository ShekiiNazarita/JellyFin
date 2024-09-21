import type { AxiosRequestConfig } from 'axios';
import type { LiveTvApiGetLiveTvProgramsRequest } from '@jellyfin/sdk/lib/generated-client';
import { getLiveTvApi } from '@jellyfin/sdk/lib/utils/api/live-tv-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';

const getLiveTvPrograms = async (
    apiContext: JellyfinApiContext,
    params?: LiveTvApiGetLiveTvProgramsRequest,
    options?: AxiosRequestConfig
) => {
    const { api } = apiContext;
    if (!api) throw new Error('No API instance available');
    const response = await getLiveTvApi(api).getLiveTvPrograms(params, options);

    return response.data as ItemDtoQueryResult;
};

export const getLiveTvProgramsQuery = (
    apiContext: JellyfinApiContext,
    params?: LiveTvApiGetLiveTvProgramsRequest
) =>
    queryOptions({
        queryKey: ['LiveTvPrograms', params],
        queryFn: ({ signal }) =>
            getLiveTvPrograms(apiContext, params, { signal }),
        enabled: !!apiContext.api
    });

export const useGetLiveTvPrograms = (
    params?: LiveTvApiGetLiveTvProgramsRequest
) => {
    const apiContext = useApi();
    return useQuery(getLiveTvProgramsQuery(apiContext, params));
};

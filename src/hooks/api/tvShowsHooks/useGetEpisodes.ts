import type { AxiosRequestConfig } from 'axios';
import type { TvShowsApiGetEpisodesRequest } from '@jellyfin/sdk/lib/generated-client';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';
import type { ItemDtoQueryResult } from '../../../types/base/models/item-dto-query-result';

const getEpisodes = async (
    apiContext: JellyfinApiContext,
    params: TvShowsApiGetEpisodesRequest,
    options?: AxiosRequestConfig
) => {
    const { api } = apiContext;
    if (!api) throw new Error('No API instance available');

    const response = await getTvShowsApi(api).getEpisodes(params, options);

    return response.data as ItemDtoQueryResult;
};

export const getEpisodesQuery = (
    apiContext: JellyfinApiContext,
    params: TvShowsApiGetEpisodesRequest
) =>
    queryOptions({
        queryKey: ['Episodes', params.seriesId],
        queryFn: ({ signal }) => getEpisodes(apiContext, params, { signal }),
        enabled: !!apiContext.api && !!params.seriesId
    });

export const useGetEpisodes = (params: TvShowsApiGetEpisodesRequest) => {
    const apiContext = useApi();
    return useQuery(getEpisodesQuery(apiContext, params));
};

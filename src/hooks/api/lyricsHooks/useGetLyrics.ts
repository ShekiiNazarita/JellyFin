import type { AxiosRequestConfig } from 'axios';
import type { LyricsApiGetLyricsRequest } from '@jellyfin/sdk/lib/generated-client';
import { getLyricsApi } from '@jellyfin/sdk/lib/utils/api/lyrics-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';

const getLyrics = async (
    apiContext: JellyfinApiContext,
    params: LyricsApiGetLyricsRequest,
    options?: AxiosRequestConfig
) => {
    const { api } = apiContext;
    if (!api) throw new Error('No API instance available');
    const response = await getLyricsApi(api).getLyrics(params, options);
    return response.data;
};

export const getLyricsQuery = (
    apiContext: JellyfinApiContext,
    params: LyricsApiGetLyricsRequest
) =>
    queryOptions({
        queryKey: ['Lyrics', params.itemId],
        queryFn: ({ signal }) => getLyrics(apiContext, params, { signal }),
        enabled: !!apiContext.api && !!params.itemId
    });

export const useGetLyrics = (params: LyricsApiGetLyricsRequest) => {
    const apiContext = useApi();
    return useQuery(getLyricsQuery(apiContext, params));
};

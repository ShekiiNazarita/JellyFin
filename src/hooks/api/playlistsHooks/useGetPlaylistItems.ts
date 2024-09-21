import type { AxiosRequestConfig } from 'axios';
import type { PlaylistsApiGetPlaylistItemsRequest } from '@jellyfin/sdk/lib/generated-client';
import { getPlaylistsApi } from '@jellyfin/sdk/lib/utils/api/playlists-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';
import type { ItemDtoQueryResult } from '../../../types/base/models/item-dto-query-result';

const getPlaylistItems = async (
    apiContext: JellyfinApiContext,
    params: PlaylistsApiGetPlaylistItemsRequest,
    options?: AxiosRequestConfig
) => {
    const { api } = apiContext;
    if (!api) throw new Error('No API instance available');
    const response = await getPlaylistsApi(api).getPlaylistItems(
        params,
        options
    );
    return response.data as ItemDtoQueryResult;
};

export const getPlaylistItemsQuery = (
    apiContext: JellyfinApiContext,
    params: PlaylistsApiGetPlaylistItemsRequest
) =>
    queryOptions({
        queryKey: ['PlaylistItems', params.playlistId, params.userId],
        queryFn: ({ signal }) =>
            getPlaylistItems(apiContext, params, { signal }),
        enabled: !!apiContext.api && !!params.playlistId
    });

export const useGetPlaylistItems = (
    params: PlaylistsApiGetPlaylistItemsRequest
) => {
    const apiContext = useApi();
    return useQuery(getPlaylistItemsQuery(apiContext, params));
};

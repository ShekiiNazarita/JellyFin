import type { AxiosRequestConfig } from 'axios';
import type { UserLibraryApiGetSpecialFeaturesRequest } from '@jellyfin/sdk/lib/generated-client';
import { getUserLibraryApi } from '@jellyfin/sdk/lib/utils/api/user-library-api';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { type JellyfinApiContext, useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

const getSpecialFeatures = async (
    apiContext: JellyfinApiContext,
    params: UserLibraryApiGetSpecialFeaturesRequest,
    options?: AxiosRequestConfig
) => {
    const { api } = apiContext;
    if (!api) throw new Error('No API instance available');

    const response = await getUserLibraryApi(api).getSpecialFeatures(
        params,
        options
    );
    return response.data as ItemDto[];
};

export const getSpecialFeaturesQuery = (
    apiContext: JellyfinApiContext,
    params: UserLibraryApiGetSpecialFeaturesRequest
) =>
    queryOptions({
        queryKey: ['SpecialFeatures', params],
        queryFn: ({ signal }) =>
            getSpecialFeatures(apiContext, params, { signal }),
        enabled: !!apiContext.api && !!params.itemId
    });

export const useGetSpecialFeatures = (
    params: UserLibraryApiGetSpecialFeaturesRequest
) => {
    const apiContext = useApi();
    return useQuery(getSpecialFeaturesQuery(apiContext, params));
};

import type { AxiosRequestConfig } from 'axios';
import type { Api } from '@jellyfin/sdk';
import type {
    ArtistsApiGetAlbumArtistsRequest,
    ItemsApiGetItemsRequest
} from '@jellyfin/sdk/lib/generated-client';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/models/api/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getArtistsApi } from '@jellyfin/sdk/lib/utils/api/artists-api';
import { useQuery } from '@tanstack/react-query';
import { useApi } from 'hooks/useApi';
import { CardShape } from 'utils/card';

import { ItemKind } from 'types/base/models/item-kind';
import type { ItemDto } from 'types/base/models/item-dto';
import type { CardOptions } from 'types/cardOptions';
import type { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';
import type { NullableString } from 'types/base/common/shared/types';

function getParametersOptions(
    itemType: ItemKind,
    itemId: NullableString,
    itemName: NullableString
) {
    return {
        sortOrder: [SortOrder.Ascending],
        includeItemTypes: [],
        recursive: true,
        fields: [ItemFields.ParentId, ItemFields.PrimaryImageAspectRatio],
        limit: 100,
        startIndex: 0,
        collapseBoxSetItems: false,
        studioIds:
            itemType === ItemKind.Studio && itemId ? [itemId] : undefined,
        personIds:
            itemType === ItemKind.Person && itemId ? [itemId] : undefined,
        albumArtistIds:
            itemType === ItemKind.MusicArtist && itemId ? [itemId] : undefined,
        genres:
            (itemType === ItemKind.Genre || itemType === ItemKind.MusicGenre)
            && itemName ?
                [itemName] :
                undefined
    };
}

const fetchItemsByType = async (
    api: Api,
    userId?: string,
    params?: ItemsApiGetItemsRequest,
    options?: AxiosRequestConfig
) => {
    const response = await getItemsApi(api).getItems(
        {
            userId: userId,
            ...params
        },
        options
    );
    return response.data as ItemDtoQueryResult;
};

const fetchAlbumArtists = async (
    api: Api,
    userId: string,
    params?: ArtistsApiGetAlbumArtistsRequest,
    options?: AxiosRequestConfig
) => {
    const response = await getArtistsApi(api).getAlbumArtists(
        {
            userId: userId,
            ...params
        },
        options
    );
    return response.data as ItemDtoQueryResult;
};

export interface ItemsByNameSection {
    title: string;
    items: ItemDto[];
    type: ItemKind;
    cardOptions?: CardOptions;
}

export const useItemsByName = (item: ItemDto) => {
    const { api, user } = useApi();
    const userId = user?.Id;
    const {
        Type,
        Id,
        Name,
        ArtistCount,
        AlbumCount,
        MusicVideoCount,
        ProgramCount,
        MovieCount,
        SeriesCount,
        EpisodeCount,
        TrailerCount,
        SongCount
    } = item;
    const currentItemToQuery = getParametersOptions(Type, Id, Name);

    return useQuery({
        queryKey: [
            'ItemsByName',
            {
                Type,
                Id,
                Name,
                ArtistCount,
                AlbumCount,
                MusicVideoCount,
                ProgramCount,
                MovieCount,
                SeriesCount,
                EpisodeCount,
                TrailerCount,
                SongCount
            }
        ],
        queryFn: async ({ signal }) => {
            if (!api) throw new Error('No API instance available');
            if (!userId) throw new Error('No User ID provided');

            const sections: ItemsByNameSection[] = [];

            const addSection = (
                title: string,
                items: ItemDto[] | undefined,
                type: ItemKind,
                cardOptions?: CardOptions
            ) => {
                if (items && items?.length > 0) {
                    sections.push({ title, items, cardOptions, type });
                }
            };

            if (ArtistCount) {
                const artistsData = await fetchAlbumArtists(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.MusicArtist],
                        limit: 8,
                        sortBy: [ItemSortBy.SortName]
                    },
                    { signal }
                );
                addSection('Artists', artistsData.Items, ItemKind.MusicArtist, {
                    shape: CardShape.SquareOverflow,
                    showTitle: true,
                    showParentTitle: true,
                    coverImage: true,
                    centerText: true,
                    overlayPlayButton: true
                });
            }

            if (AlbumCount) {
                const albumsData = await fetchItemsByType(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.MusicAlbum],
                        limit: 10,
                        sortBy: [
                            ItemSortBy.PremiereDate,
                            ItemSortBy.ProductionYear,
                            ItemSortBy.SortName
                        ],
                        sortOrder: [SortOrder.Descending, SortOrder.Ascending]
                    },
                    { signal }
                );
                addSection('Albums', albumsData.Items, ItemKind.MusicAlbum, {
                    shape: CardShape.SquareOverflow,
                    showTitle: true,
                    showYear: true,
                    coverImage: true,
                    centerText: true,
                    overlayPlayButton: true
                });
            }

            if (MusicVideoCount) {
                const musicVideosData = await fetchItemsByType(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.MusicVideo],
                        limit: 10,
                        sortBy: [ItemSortBy.SortName]
                    },
                    { signal }
                );
                addSection(
                    'MusicVideos',
                    musicVideosData.Items,
                    ItemKind.MusicVideo,
                    {
                        shape: CardShape.BackdropOverflow,
                        showTitle: true,
                        centerText: true,
                        overlayPlayButton: true
                    }
                );
            }

            if (ProgramCount && Type === ItemKind.Person) {
                const programsData = await fetchItemsByType(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.Program],
                        limit: 10,
                        sortBy: [ItemSortBy.StartDate]
                    },
                    { signal }
                );
                addSection(
                    'HeaderUpcomingOnTV',
                    programsData.Items,
                    ItemKind.Program,
                    {
                        shape: CardShape.BackdropOverflow,
                        showTitle: true,
                        centerText: true,
                        overlayMoreButton: true,
                        preferThumb: true,
                        overlayText: false,
                        showAirTime: true,
                        showAirDateTime: true,
                        showChannelName: true
                    }
                );
            }

            if (MovieCount) {
                const moviesData = await fetchItemsByType(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.Movie],
                        limit: 10,
                        sortBy: [
                            ItemSortBy.PremiereDate,
                            ItemSortBy.ProductionYear,
                            ItemSortBy.SortName
                        ],
                        sortOrder: [SortOrder.Descending, SortOrder.Ascending]
                    },
                    { signal }
                );
                addSection('Movies', moviesData.Items, ItemKind.Movie, {
                    shape: CardShape.PortraitOverflow,
                    showTitle: true,
                    centerText: true,
                    overlayMoreButton: true,
                    overlayText: false,
                    showYear: true
                });
            }

            if (SeriesCount) {
                const seriesData = await fetchItemsByType(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.Series],
                        limit: 10,
                        sortBy: [ItemSortBy.SortName]
                    },
                    { signal }
                );
                addSection('Shows', seriesData.Items, ItemKind.Series, {
                    shape: CardShape.PortraitOverflow,
                    showTitle: true,
                    centerText: true,
                    overlayMoreButton: true
                });
            }

            if (EpisodeCount) {
                const episodesData = await fetchItemsByType(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.Episode],
                        limit: 6,
                        sortBy: [ItemSortBy.SortName]
                    },
                    { signal }
                );
                addSection('Episodes', episodesData.Items, ItemKind.Episode, {
                    shape: CardShape.BackdropOverflow,
                    showTitle: true,
                    showParentTitle: true,
                    centerText: true,
                    overlayPlayButton: true
                });
            }

            if (TrailerCount) {
                const trailersData = await fetchItemsByType(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.Trailer],
                        limit: 10,
                        sortBy: [ItemSortBy.SortName]
                    },
                    { signal }
                );
                addSection('Trailers', trailersData.Items, ItemKind.Trailer, {
                    shape: CardShape.PortraitOverflow,
                    showTitle: true,
                    centerText: true,
                    overlayPlayButton: true
                });
            }

            if (SongCount) {
                const songsData = await fetchItemsByType(
                    api,
                    userId,
                    {
                        ...currentItemToQuery,
                        includeItemTypes: [ItemKind.Audio],
                        limit: 10,
                        sortBy: [
                            ItemSortBy.AlbumArtist,
                            ItemSortBy.Album,
                            ItemSortBy.SortName
                        ]
                    },
                    { signal }
                );
                addSection('Songs', songsData.Items, ItemKind.Audio);
            }

            return sections;
        },
        enabled: !!api && !!userId
    });
};

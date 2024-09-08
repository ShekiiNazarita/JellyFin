import type { NameGuidPair } from '@jellyfin/sdk/lib/generated-client/models/name-guid-pair';
import type { ExternalUrl } from '@jellyfin/sdk/lib/generated-client/models/external-url';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import React from 'react';
import { intervalToDuration } from 'date-fns';
import datetime from 'scripts/datetime';
import globalize from 'lib/globalize';
import { appHost } from 'components/apphost';
import { appRouter } from 'components/router/appRouter';

import { ItemKind } from 'types/base/models/item-kind';
import type { NullableString } from 'types/base/common/shared/types';
import type { ItemDto } from 'types/base/models/item-dto';
import type { TextAction } from '../../types/TextAction';

function getTagsLink(
    itemTags: string[] | null,
    itemType: ItemKind,
    itemServerId: NullableString
): TextAction[] {
    const tagActions = [];

    if (itemTags?.length && itemType !== ItemKind.Program) {
        for (const tag of itemTags) {
            tagActions.push({
                href: appRouter.getRouteUrl('tag', {
                    tag,
                    serverId: itemServerId
                }),
                title: tag
            });
        }
    }

    return tagActions;
}

function getExternalUrlsLink(
    itemExternalUrls: ExternalUrl[] | null
): TextAction[] {
    const externalActions = [];

    if (itemExternalUrls?.length) {
        for (const externalUrl of itemExternalUrls) {
            externalActions.push({
                href: externalUrl.Url || '',
                title: externalUrl.Name || '',
                target: '_blank',
                rel: 'noopener noreferrer'
            });
        }
    }

    return externalActions;
}

function inferContext(itemType: ItemKind) {
    if (itemType === ItemKind.Movie || itemType === ItemKind.BoxSet) {
        return CollectionType.Movies;
    }

    if (
        itemType === ItemKind.Series
        || itemType === ItemKind.Season
        || itemType === ItemKind.Episode
    ) {
        return CollectionType.Tvshows;
    }

    if (
        itemType === ItemKind.MusicArtist
        || itemType === ItemKind.MusicAlbum
        || itemType === ItemKind.Audio
        || itemType === ItemKind.AudioBook
    ) {
        return CollectionType.Music;
    }

    if (itemType === ItemKind.Program) {
        return CollectionType.Livetv;
    }

    return null;
}

function getGenreItemsLink(
    itemGenreItems: NameGuidPair[] | null,
    itemType: ItemKind,
    context?: CollectionType,
    itemServerId?: NullableString
): TextAction[] {
    const collectionType = context || inferContext(itemType);
    const type = collectionType === CollectionType.Music ? ItemKind.MusicGenre : ItemKind.Genre;
    const genreItemsActions = [];

    if (itemGenreItems?.length) {
        for (const genreItem of itemGenreItems) {
            genreItemsActions.push({
                href: appRouter.getRouteUrl(
                    {
                        Name: genreItem.Name,
                        Type: type,
                        ServerId: itemServerId,
                        Id: genreItem.Id
                    },
                    {
                        context: collectionType
                    }
                ),
                title: genreItem.Name || ''
            });
        }
    }

    return genreItemsActions;
}

function getStudiosLink(
    itemStudios: NameGuidPair[] | null,
    context?: CollectionType,
    itemServerId?: NullableString
): TextAction[] {
    const studiosActions = [];

    if (itemStudios?.length) {
        for (const studio of itemStudios) {
            studiosActions.push({
                href: appRouter.getRouteUrl(
                    {
                        Name: studio.Name,
                        Type: ItemKind.Studio,
                        ServerId: itemServerId,
                        Id: studio.Id
                    },
                    {
                        context: context
                    }
                ),
                title: studio.Name || ''
            });
        }
    }

    return studiosActions;
}

function getPersonsByTypeLink(
    itemPeople: ItemDto[],
    itempersonType: ItemKind,
    context?: CollectionType,
    itemServerId?: NullableString
): TextAction[] {
    const persons = (itemPeople || []).filter((person) => {
        return person.Type === itempersonType;
    });
    const personsActions = [];

    if (persons) {
        for (const person of persons) {
            personsActions.push({
                href: appRouter.getRouteUrl(
                    {
                        Name: person.Name,
                        Type: ItemKind.Person,
                        ServerId: itemServerId,
                        Id: person.Id
                    },
                    {
                        context: context
                    }
                ),
                title: person.Name || ''
            });
        }
    }

    return personsActions;
}

function getBirthDay(
    itemType: ItemKind,
    itemPremiereDate: NullableString,
    itemEndDate: NullableString
) {
    let birthDayText;

    if (itemType == ItemKind.Person && itemPremiereDate) {
        const birthday = datetime.parseISO8601Date(itemPremiereDate, true);
        const durationSinceBorn = intervalToDuration({
            start: birthday,
            end: Date.now()
        });
        if (itemEndDate) {
            birthDayText = birthday.toLocaleDateString();
        } else {
            birthDayText = `${birthday.toLocaleDateString()} ${globalize.translate(
                'AgeValue',
                durationSinceBorn.years
            )}`;
        }
    }

    return birthDayText;
}

function getBirthPlace(
    itemType: ItemKind,
    itemProductionLocations: string[] | null
) {
    let birthPlaceText;
    const birthPlaceActions: TextAction[] = [];

    if (itemType == ItemKind.Person && itemProductionLocations?.length) {
        if (appHost.supports('externallinks')) {
            birthPlaceActions.push({
                href: `https://www.openstreetmap.org/search?query=${encodeURIComponent(
                    itemProductionLocations[0]
                )}`,
                title: itemProductionLocations[0],
                target: '_blank',
                rel: 'noopener noreferrer'
            });
        } else {
            birthPlaceText = itemProductionLocations[0];
        }
    }

    return {
        birthPlaceText,
        birthPlaceActions
    };
}

function getDeathDate(
    itemType: ItemKind,
    itemPremiereDate: NullableString,
    itemEndDate: NullableString
) {
    let deathDateText;

    if (itemType == ItemKind.Person && itemEndDate) {
        const deathday = datetime.parseISO8601Date(itemEndDate, true);
        if (itemPremiereDate) {
            const birthday = datetime.parseISO8601Date(itemPremiereDate, true);
            const durationSinceBorn = intervalToDuration({
                start: birthday,
                end: deathday
            });

            deathDateText = `${deathday.toLocaleDateString()} ${globalize.translate(
                'AgeValue',
                durationSinceBorn.years
            )}`;
        } else {
            deathDateText = deathday.toLocaleDateString();
        }
    }

    return deathDateText;
}

interface UseGroupItemLinksdProps {
    item: ItemDto;
    context?: CollectionType;
}

function useGroupItemLinks({ item, context }: UseGroupItemLinksdProps) {
    const {
        ProductionLocations = [],
        ExternalUrls = [],
        Tags = [],
        Studios = [],
        GenreItems = [],
        People = [],
        PremiereDate,
        EndDate,
        Type,
        ServerId
    } = item;

    const birthDayText = React.useMemo(
        () => getBirthDay(Type, PremiereDate, EndDate),
        [EndDate, PremiereDate, Type]
    );

    const birthPlace = React.useMemo(
        () => getBirthPlace(Type, ProductionLocations),
        [ProductionLocations, Type]
    );

    const deathDateText = React.useMemo(
        () => getDeathDate(Type, PremiereDate, EndDate),
        [EndDate, PremiereDate, Type]
    );

    const tagActions = React.useMemo(
        () => getTagsLink(Tags, Type, ServerId),
        [ServerId, Tags, Type]
    );

    const genreItemsActions = React.useMemo(
        () => getGenreItemsLink(GenreItems, Type, context, ServerId),
        [GenreItems, ServerId, Type, context]
    );

    const studiosActions = React.useMemo(
        () => getStudiosLink(Studios, context, ServerId),
        [ServerId, Studios, context]
    );

    const externalActions = React.useMemo(
        () => getExternalUrlsLink(ExternalUrls),
        [ExternalUrls]
    );

    const directorsActions = React.useMemo(
        () => getPersonsByTypeLink(People, ItemKind.Director, context, ServerId),
        [People, ServerId, context]
    );

    const writersActions = React.useMemo(
        () => getPersonsByTypeLink(People, ItemKind.Writer, context, ServerId),
        [People, ServerId, context]
    );

    return {
        birthday: { label: 'Born', text: birthDayText },
        birthPlace: { label: 'BirthPlace', text: birthPlace.birthPlaceText, textActions: birthPlace.birthPlaceActions },
        deathDate: { label: 'Died', text: deathDateText },
        tags: { label: 'LabelTag', textActions: tagActions },
        externalUrls: { label: 'HeaderExternalIds', textActions: externalActions },
        genreItems: { label: genreItemsActions.length > 1 ? 'Genres' : 'Genre', textActions: genreItemsActions },
        studios: { label: studiosActions.length > 1 ? 'Studios' : 'Studio', textActions: studiosActions },
        directors: { label: directorsActions.length > 1 ? 'Directors' : 'Director', textActions: directorsActions },
        writers: { label: writersActions.length > 1 ? 'Writers' : 'Writer', textActions: writersActions }
    };
}

export default useGroupItemLinks;

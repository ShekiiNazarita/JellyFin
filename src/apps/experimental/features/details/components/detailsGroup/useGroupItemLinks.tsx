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
    Tags: string[] | null,
    Type: ItemKind
): TextAction[] {
    const tagActions = [];

    if (Tags?.length && Type !== ItemKind.Program) {
        for (const tag of Tags) {
            tagActions.push({
                href: `#/search.html?query=${encodeURIComponent(tag)}`,
                title: tag
            });
        }
    }

    return tagActions;
}

function getExternalUrlsLink(
    ExternalUrls: ExternalUrl[] | null
): TextAction[] {
    const externalActions = [];

    if (ExternalUrls?.length) {
        for (const externalUrl of ExternalUrls) {
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

function inferContext(Type: ItemKind) {
    if (Type === ItemKind.Movie || Type === ItemKind.BoxSet) {
        return CollectionType.Movies;
    }

    if (
        Type === ItemKind.Series
        || Type === ItemKind.Season
        || Type === ItemKind.Episode
    ) {
        return CollectionType.Tvshows;
    }

    if (
        Type === ItemKind.MusicArtist
        || Type === ItemKind.MusicAlbum
        || Type === ItemKind.Audio
        || Type === ItemKind.AudioBook
    ) {
        return CollectionType.Music;
    }

    if (Type === ItemKind.Program) {
        return CollectionType.Livetv;
    }

    return null;
}

function getGenreItemsLink(
    GenreItems: NameGuidPair[] | null,
    Type: ItemKind,
    context?: CollectionType,
    ServerId?: NullableString
): TextAction[] {
    const _context = context || inferContext(Type);
    const type = _context === CollectionType.Music ? ItemKind.MusicGenre : ItemKind.Genre;
    const genreItemsActions = [];

    if (GenreItems?.length) {
        for (const genreItem of GenreItems) {
            genreItemsActions.push({
                href: appRouter.getRouteUrl(
                    {
                        Name: genreItem.Name,
                        Type: type,
                        ServerId: ServerId,
                        Id: genreItem.Id
                    },
                    {
                        context: _context
                    }
                ),
                title: genreItem.Name || ''
            });
        }
    }

    return genreItemsActions;
}

function getStudiosLink(
    Studios: NameGuidPair[] | null,
    context?: CollectionType,
    ServerId?: NullableString
): TextAction[] {
    const studiosActions = [];

    if (Studios?.length) {
        for (const studio of Studios) {
            studiosActions.push({
                href: appRouter.getRouteUrl(
                    {
                        Name: studio.Name,
                        Type: ItemKind.Studio,
                        ServerId: ServerId,
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
    People: ItemDto[],
    personType: ItemKind,
    context?: CollectionType,
    ServerId?: NullableString
): TextAction[] {
    const Persons = (People || []).filter(function (person) {
        return person.Type === personType;
    });
    const personsActions = [];

    if (Persons) {
        for (const person of Persons) {
            personsActions.push({
                href: appRouter.getRouteUrl(
                    {
                        Name: person.Name,
                        Type: ItemKind.Person,
                        ServerId: ServerId,
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
    Type: ItemKind,
    PremiereDate: NullableString,
    EndDate: NullableString
) {
    let birthDayText;

    if (Type == ItemKind.Person && PremiereDate) {
        const birthday = datetime.parseISO8601Date(PremiereDate, true);
        const durationSinceBorn = intervalToDuration({
            start: birthday,
            end: Date.now()
        });
        if (EndDate) {
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
    Type: ItemKind,
    ProductionLocations: string[] | null
) {
    let birthPlaceText;
    const birthPlaceActions: TextAction[] = [];

    if (Type == ItemKind.Person && ProductionLocations?.length) {
        if (appHost.supports('externallinks')) {
            birthPlaceActions.push({
                href: `https://www.openstreetmap.org/search?query=${encodeURIComponent(
                    ProductionLocations[0]
                )}`,
                title: ProductionLocations[0],
                target: '_blank',
                rel: 'noopener noreferrer'
            });
        } else {
            birthPlaceText = ProductionLocations[0];
        }
    }

    return {
        birthPlaceText,
        birthPlaceActions
    };
}

function getDeathDate(
    Type: ItemKind,
    PremiereDate: NullableString,
    EndDate: NullableString
) {
    let deathDateText;

    if (Type == ItemKind.Person && EndDate) {
        const deathday = datetime.parseISO8601Date(EndDate, true);
        if (PremiereDate) {
            const birthday = datetime.parseISO8601Date(PremiereDate, true);
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
        () => getTagsLink(Tags, Type),
        [Tags, Type]
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

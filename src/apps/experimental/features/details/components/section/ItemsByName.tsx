import React, { type FC } from 'react';
import {
    type ItemsByNameSection,
    useItemsByName
} from '../../hooks/useItemsByName';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';

import { ItemKind } from 'types/base/models/item-kind';
import type { ItemDto } from 'types/base/models/item-dto';

function getMoreItemUrl(item: ItemDto, sectionType?: ItemKind) {
    if (item.Type === ItemKind.Genre) {
        return '#/list.html?type=' + sectionType + '&genreId=' + item.Id + '&serverId=' + item.ServerId;
    }

    if (item.Type === ItemKind.MusicGenre) {
        return '#/list.html?type=' + sectionType + '&musicGenreId=' + item.Id + '&serverId=' + item.ServerId;
    }

    if (item.Type === ItemKind.Studio) {
        return '#/list.html?type=' + sectionType + '&studioId=' + item.Id + '&serverId=' + item.ServerId;
    }

    if (item.Type === ItemKind.MusicArtist) {
        return '#/list.html?type=' + sectionType + '&artistId=' + item.Id + '&serverId=' + item.ServerId;
    }

    if (item.Type === ItemKind.Person) {
        return '#/list.html?type=' + sectionType + '&personId=' + item.Id + '&serverId=' + item.ServerId;
    }

    return '#/list.html?type=' + sectionType + '&parentId=' + item.Id + '&serverId=' + item.ServerId;
}

interface ItemsByNameProps {
    item: ItemDto;
}

const ItemsByName: FC<ItemsByNameProps> = ({ item }) => {
    const { isLoading, data, refetch } = useItemsByName(item);

    if (isLoading) {
        return <Loading />;
    }

    if (!data?.length) {
        return null;
    }

    const renderItemsByNameSection = (
        section: ItemsByNameSection,
        index: number
    ) => {
        if (section.type === ItemKind.Audio) {
            return (
                <SectionContainer
                    key={`${section.title}-${index}`}
                    isListEnabled
                    className='verticalSection-extrabottompadding'
                    sectionHeaderProps={{
                        className: 'no-padding',
                        title: globalize.translate(section.title),
                        url: getMoreItemUrl(item, section.type),
                        itemsLength: section.items.length
                    }}
                    itemsContainerProps={{
                        className: 'vertical-list',
                        queryKey: ['ItemsByName'],
                        reloadItems: refetch
                    }}
                    items={section.items}
                    listOptions={{
                        action: 'playallfromhere',
                        smallIcon: true,
                        showArtist: true,
                        queryKey: ['ItemsByName']
                    }}
                />
            );
        }

        return (
            <SectionContainer
                key={`${section.title}-${index}`}
                sectionHeaderProps={{
                    className: 'no-padding',
                    title: globalize.translate(section.title),
                    url: getMoreItemUrl(item, section.type),
                    itemsLength: section.items.length
                }}
                scrollerProps={{
                    className: 'no-padding',
                    isMouseWheelEnabled: false,
                    isCenterFocusEnabled: true
                }}
                itemsContainerProps={{
                    className: 'scrollSlider',
                    queryKey: ['ItemsByName'],
                    reloadItems: refetch
                }}
                items={section.items}
                cardOptions={{
                    ...section.cardOptions,
                    queryKey: ['ItemsByName']
                }}
            />
        );
    };

    return data?.map((section, index) =>
        renderItemsByNameSection(section, index)
    );
};

export default ItemsByName;

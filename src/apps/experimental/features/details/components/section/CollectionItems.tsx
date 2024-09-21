import React, { type FC } from 'react';
import { type Section, useGetCollectionItemsByType } from '../../hooks/useGetCollectionItemsByType';
import Loading from 'components/loading/LoadingComponent';
import globalize from 'lib/globalize';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import type { ItemDto } from 'types/base/models/item-dto';
import { ItemKind } from 'types/base/models/item-kind';

interface CollectionItemsProps {
    item: ItemDto;
}

const CollectionItems: FC<CollectionItemsProps> = ({ item }) => {
    const enabled = Boolean(
        item.IsFolder && item.Type == ItemKind.BoxSet && !!item.Id
    );
    const {
        isLoading,
        data: sectionsWithItems,
        refetch
    } = useGetCollectionItemsByType(item.Id, enabled);

    if (isLoading) {
        return <Loading />;
    }

    if (!sectionsWithItems?.length) {
        return null;
    }

    const renderCollectionItem = (section: Section) => (
        <SectionContainer
            key={section.title}
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate(section.title)
            }}
            scrollerProps={{
                className: 'no-padding',
                isMouseWheelEnabled: false,
                isCenterFocusEnabled: true
            }}
            itemsContainerProps={{
                className: 'scrollSlider',
                queryKey: ['CollectionItemsByType'],
                reloadItems: refetch
            }}
            items={section.items}
            cardOptions={{
                showTitle: true,
                centerText: true,
                lazy: true,
                showDetailsMenu: true,
                overlayMoreButton: true,
                collectionId: item.Id,
                ...section.cardOptions
            }}
        />
    );

    return sectionsWithItems.map((section) => renderCollectionItem(section));
};

export default CollectionItems;

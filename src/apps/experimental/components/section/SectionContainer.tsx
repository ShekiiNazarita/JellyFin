import React, { type FC, type PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import SectionHeader, { type SectionHeaderProps } from './SectionHeader';
import ItemsContainer, {
    type ItemsContainerProps
} from 'elements/emby-itemscontainer/ItemsContainer';
import Scroller, { type ScrollerProps } from 'elements/emby-scroller/Scroller';
import Cards from 'components/cardbuilder/Card/Cards';
import Lists from 'components/listview/List/Lists';
import type { CardOptions } from 'types/cardOptions';
import type { ListOptions } from 'types/listOptions';
import type { ItemDto } from 'types/base/models/item-dto';

interface SectionContainerProps {
    className?: string;
    items?: ItemDto[];
    sectionHeaderProps?: SectionHeaderProps;
    scrollerProps?: ScrollerProps;
    itemsContainerProps: ItemsContainerProps;
    isListEnabled?: boolean;
    cardOptions?: CardOptions;
    listOptions?: ListOptions;
}

const SectionContainer: FC<PropsWithChildren<SectionContainerProps>> = ({
    className,
    sectionHeaderProps,
    scrollerProps,
    itemsContainerProps,
    isListEnabled,
    items = [],
    cardOptions,
    listOptions,
    children
}) => {
    const sectionClass = classNames('verticalSection', className);

    const renderItems = () => {
        if (React.isValidElement(children)) {
            return children;
        }

        if (isListEnabled && !scrollerProps) {
            return <Lists items={items} listOptions={listOptions} />;
        } else {
            return <Cards items={items} cardOptions={cardOptions} />;
        }
    };

    const content = (
        <ItemsContainer {...itemsContainerProps}>
            {renderItems()}
        </ItemsContainer>
    );

    return (
        <Box className={sectionClass}>
            {sectionHeaderProps?.title && (
                <SectionHeader {...sectionHeaderProps} />
            )}
            {scrollerProps ? (
                <Scroller {...scrollerProps}>{content}</Scroller>
            ) : (
                content
            )}
        </Box>
    );
};

export default SectionContainer;

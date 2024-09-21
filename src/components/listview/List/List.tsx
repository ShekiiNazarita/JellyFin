import React, { type FC } from 'react';
import useList from './useList';
import ListContent from './ListContent';
import ListWrapper from './ListWrapper';
import type { ItemDto } from 'types/base/models/item-dto';
import type { ListOptions } from 'types/listOptions';
import '../../mediainfo/mediainfo.scss';
import '../../guide/programs.scss';

interface ListProps {
    item: ItemDto;
    listOptions?: ListOptions;
}

const List: FC<ListProps> = ({ item, listOptions = {} }) => {
    const { getListdWrapperProps, getListContentProps } = useList({ item, listOptions } );
    const listWrapperProps = getListdWrapperProps();
    const listContentProps = getListContentProps();

    return (
        <ListWrapper
            {...listWrapperProps}
        >
            <ListContent {...listContentProps} />
        </ListWrapper>
    );
};

export default List;

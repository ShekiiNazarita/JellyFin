import React, { Fragment, type FC, type PropsWithChildren } from 'react';
import { groupBy } from 'lodash-es';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import { getIndex } from './listHelper';
import List from './List';

import type { ItemDto } from 'types/base/models/item-dto';
import type { ListOptions } from 'types/listOptions';
import '../listview.scss';

interface ListGroupWrapperProps {
    index?: number;
    showIndex?: boolean;
    itemGroupTitle: string;
}

const ListGroupWrapper: FC<PropsWithChildren<ListGroupWrapperProps>> = ({
    index,
    showIndex,
    itemGroupTitle,
    children
}) => {
    if (showIndex && itemGroupTitle) {
        return (
            <Fragment>
                <Typography
                    className={classNames('listGroupHeader', {
                        'listGroupHeader-first': index === 0
                    })}
                    variant='h2'
                >
                    {itemGroupTitle}
                </Typography>
                <Box>{children}</Box>
            </Fragment>
        );
    } else {
        return children;
    }
};

interface ListsProps {
    items: ItemDto[];
    listOptions?: ListOptions;
}

const Lists: FC<ListsProps> = ({ items = [], listOptions = {} }) => {
    const groupedData = groupBy(items, (item) => {
        if (listOptions.showIndex) {
            return getIndex(item, listOptions);
        }
        return '';
    });

    const renderListItem = (item: ItemDto, itemGroupTitle: string) => {
        return (
            <List
                key={`${item.Id}-${itemGroupTitle}`}
                item={item}
                listOptions={listOptions}
            />
        );
    };

    return Object.entries(groupedData).map(
        ([itemGroupTitle, getItems], index) => (
            <ListGroupWrapper
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                index={index}
                showIndex={listOptions.showIndex}
                itemGroupTitle={itemGroupTitle}
            >
                {getItems.map((item) => renderListItem(item, itemGroupTitle))}
            </ListGroupWrapper>
        )
    );
};

export default Lists;

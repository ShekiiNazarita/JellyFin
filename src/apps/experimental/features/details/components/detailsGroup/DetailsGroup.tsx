import type { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import React, { type FC } from 'react';
import Box from '@mui/material/Box';
import useGroupItemLinks from './useGroupItemLinks';
import GroupItemLinks from './GroupItemLinks';
import type { ItemDto } from 'types/base/models/item-dto';

interface DetailsGroupProps {
    className?: string;
    item: ItemDto;
    context?: CollectionType
}

const DetailsGroup: FC<DetailsGroupProps> = ({
    className,
    item,
    context
}) => {
    const { birthday, birthPlace, deathDate, tags, externalUrls, genreItems, studios, directors, writers } = useGroupItemLinks({ item, context } );

    return (
        <Box className={className}>
            <GroupItemLinks label={birthday.label} text={birthday.text} />
            <GroupItemLinks label={birthPlace.label} text={birthPlace.text} textActions={birthPlace.textActions} />
            <GroupItemLinks label={deathDate.label} text={deathDate.text} />
            <GroupItemLinks label={tags.label} textActions={tags.textActions} />
            <GroupItemLinks label={externalUrls.label} textActions={externalUrls.textActions} />
            <GroupItemLinks label={genreItems.label} textActions={genreItems.textActions} />
            <GroupItemLinks label={directors.label} textActions={directors.textActions} />
            <GroupItemLinks label={writers.label} textActions={writers.textActions} />
            <GroupItemLinks label={studios.label} textActions={studios.textActions} />
        </Box>
    );
};

export default DetailsGroup;

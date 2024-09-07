import type { ChapterInfo } from '@jellyfin/sdk/lib/generated-client/models/chapter-info';
import React, { type FC } from 'react';
import useChapterCard from './useChapterCard';
import CardBox from './CardBox';

import type { CardOptions } from 'types/cardOptions';
import type { ItemDto } from 'types/base/models/item-dto';

interface ChapterCardProps {
    item: ItemDto;
    chapter: ChapterInfo;
    cardOptions: CardOptions;
    index: number;
}

const ChapterCard: FC<ChapterCardProps> = ({
    item = {},
    chapter,
    cardOptions,
    index
}) => {
    const { getCardProps, getCardBoxProps } = useChapterCard({
        item,
        chapter,
        cardOptions,
        index
    });
    const cardProps = getCardProps();
    const cardBoxProps = getCardBoxProps();
    return (
        <div
            className={cardProps.className}
            {...cardProps.dataAttributes}
        >
            <CardBox {...cardBoxProps} />
        </div>
    );
};

export default ChapterCard;

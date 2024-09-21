import type { ChapterInfo } from '@jellyfin/sdk/lib/generated-client/models/chapter-info';
import { MediaStreamType } from '@jellyfin/sdk/lib/generated-client/models/media-stream-type';
import React, { type FC } from 'react';
import ChapterCard from './ChapterCard';
import { CardShape } from 'utils/card';
import type { ItemDto } from 'types/base/models/item-dto';
import type { CardOptions } from 'types/cardOptions';
import '../card.scss';

interface ChapterCardsProps {
    item: ItemDto;
    chapters: ChapterInfo[];
    cardOptions: CardOptions;
}

const ChapterCards: FC<ChapterCardsProps> = ({
    item,
    chapters,
    cardOptions
}) => {
    const mediaStreams = (item.MediaSources || [])[0]?.MediaStreams || [];
    const videoStream =
        mediaStreams.filter(({ Type }) => {
            return Type === MediaStreamType.Video;
        })[0] || {};

    let shape = cardOptions.backdropShape || CardShape.Backdrop;

    if (
        videoStream.Width
        && videoStream.Height
        && videoStream.Width / videoStream.Height <= 1.2
    ) {
        shape = cardOptions.squareShape || CardShape.Square;
    }

    const renderChapterCard = (chapter: ChapterInfo, index: number) => (
        <ChapterCard
            key={index}
            item={item}
            chapter={chapter}
            cardOptions={{
                ...cardOptions,
                shape
            }}
            index={index}
        />
    );

    return chapters.map((chapter, index) => renderChapterCard(chapter, index));
};

export default ChapterCards;

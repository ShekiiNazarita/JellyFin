import type { ChapterInfo } from '@jellyfin/sdk/lib/generated-client/models/chapter-info';
import classNames from 'classnames';
import useChapterCardImageUrl from './useChapterCardImageUrl';
import {
    resolveAction
} from '../cardBuilderUtils';
import { getDataAttributes } from 'utils/items';

import { ItemMediaKind } from 'types/base/models/item-media-kind';
import type { ItemDto } from 'types/base/models/item-dto';
import type { CardOptions } from 'types/cardOptions';

interface UseChapterCardProps {
    item: ItemDto;
    chapter: ChapterInfo;
    cardOptions: CardOptions;
    index: number;
}

function useChapterCard({ item, chapter, cardOptions, index }: UseChapterCardProps) {
    const action = resolveAction({
        defaultAction: cardOptions.action ?? 'link',
        isFolder: item.IsFolder ?? false,
        isPhoto: item.MediaType === ItemMediaKind.Photo
    });

    const shape = cardOptions.shape;

    const imgInfo = useChapterCardImageUrl({
        item,
        chapter,
        cardOptions,
        index
    });
    const imgUrl = imgInfo.imgUrl;
    const blurhash = imgInfo.blurhash;
    const coveredImage = cardOptions.coverImage;
    const overlayText = cardOptions.overlayText;

    const dataAttributes = getDataAttributes(
        {
            action,
            itemServerId: item.ServerId || cardOptions.serverId,
            itemId: item.Id,
            itemType: item.Type,
            itemMediaType: item.MediaType,
            itemIsFolder: item.IsFolder,
            itemPositionticks: chapter.StartPositionTicks
        }
    );

    const cardClass = classNames(
        'card',
        'chapterCard',
        { [`${shape}Card`]: shape },
        cardOptions.cardCssClass,
        cardOptions.cardClass,
        { 'block': cardOptions.displayBlock || cardOptions.rows }
    );

    const cardBoxClass = classNames(
        'cardBox',
        'itemAction'
    );

    const getCardProps = () => ({
        className: cardClass,
        dataAttributes
    });

    const getCardBoxProps = () => ({
        action,
        item,
        chapter,
        cardOptions,
        className: cardBoxClass,
        shape,
        imgUrl,
        blurhash,
        coveredImage,
        overlayText
    });

    return {
        getCardProps,
        getCardBoxProps
    };
}

export default useChapterCard;

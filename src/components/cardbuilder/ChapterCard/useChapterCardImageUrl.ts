import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';
import { useApi } from 'hooks/useApi';

import type { ItemDto } from 'types/base/models/item-dto';
import type { CardOptions } from 'types/cardOptions';
import { ChapterInfo } from '@jellyfin/sdk/lib/generated-client';

interface UseChapterCardImageUrlProps {
    item: ItemDto;
    chapter: ChapterInfo;
    cardOptions: CardOptions;
    index: number;
}

function useChapterCardImageUrl({ item, chapter, cardOptions, index }: UseChapterCardImageUrlProps) {
    const { api } = useApi();

    const maxWidth = cardOptions.width || 400;
    const imgTag = chapter.ImageTag;
    const imgType = 'Chapter';
    const itemId = item.Id ;
    let imgUrl;
    let blurhash;

    if (api && imgTag && imgType && itemId) {
        imgUrl = getImageApi(api).getItemImageUrlById(itemId, imgType, {
            tag: imgTag,
            maxWidth: maxWidth,
            imageIndex: index
        });

        blurhash = item?.ImageBlurHashes?.[imgType]?.[imgTag];
    }

    return {
        imgUrl: imgUrl,
        blurhash: blurhash
    };
}

export default useChapterCardImageUrl;

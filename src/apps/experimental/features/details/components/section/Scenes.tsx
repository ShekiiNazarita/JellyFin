import type { ChapterInfo } from '@jellyfin/sdk/lib/generated-client';
import React, { type FC } from 'react';
import globalize from 'lib/globalize';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import ChapterCards from 'components/cardbuilder/ChapterCard/ChapterCards';

import { CardShape } from 'utils/card';
import type { ItemDto } from 'types/base/models/item-dto';

interface ScenesProps {
    chapters: ChapterInfo[];
    item: ItemDto;
    reloadItems?: () => void;
}

const Scenes: FC<ScenesProps> = ({ item, chapters, reloadItems }) => {
    return (
        <SectionContainer
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('HeaderScenes')
            }}
            scrollerProps={{
                className: 'no-padding',
                isMouseWheelEnabled: false,
                isCenterFocusEnabled: true
            }}
            itemsContainerProps={{
                className: 'scrollSlider',
                queryKey: ['DetailsItem'],
                reloadItems: reloadItems
            }}
        >
            <ChapterCards
                item={item}
                chapters={chapters}
                cardOptions={{
                    backdropShape: CardShape.BackdropOverflow,
                    squareShape: CardShape.SquareOverflow,
                    action: 'play',
                    defaultCardImageIcon: 'local_movies'
                }}
            />
        </SectionContainer>
    );
};

export default Scenes;

import type { ChapterInfo } from '@jellyfin/sdk/lib/generated-client/models/chapter-info';
import React, { type FC } from 'react';
import classNames from 'classnames';
import datetime from 'scripts/datetime';
import { CardShape } from 'utils/card';
import Media from 'components/common/Media';
import type { CardOptions } from 'types/cardOptions';

interface CardBoxProps {
    action: string;
    chapter: ChapterInfo;
    cardOptions: CardOptions;
    className: string;
    shape?: CardShape;
    imgUrl?: string;
    blurhash?: string;
    coveredImage?: boolean;
}

const CardBox: FC<CardBoxProps> = ({
    action,
    chapter,
    cardOptions,
    className,
    shape,
    imgUrl,
    blurhash,
    coveredImage
}) => {
    return (
        <div className={className} data-action={action}>
            <div className='cardScalable'>
                <div className={`cardPadder cardPadder-${shape}`}></div>
                <div
                    className={classNames('cardContent cardContent-shadow')}
                >
                    <div
                        className={classNames(
                            'cardImageContainer chapterCardImageContainer',
                            { coveredImage: coveredImage }
                        )}
                    >
                        <Media
                            imgUrl={imgUrl}
                            blurhash={blurhash}
                            imageType={cardOptions.imageType}
                            defaultCardImageIcon={
                                cardOptions.defaultCardImageIcon
                            }
                        />
                    </div>
                    <div className='innerCardFooter'>
                        <div className='cardText'>{chapter.Name}</div>
                        <div className='cardText'>
                            {datetime.getDisplayRunningTime(
                                chapter.StartPositionTicks
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardBox;

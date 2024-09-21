import React, { type FC } from 'react';
import globalize from 'lib/globalize';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import { CardShape } from 'utils/card';
import { ItemKind } from 'types/base/models/item-kind';
import { ItemMediaKind } from 'types/base/models/item-media-kind';
import type { ItemDto } from 'types/base/models/item-dto';
import type { NullableString } from 'types/base/common/shared/types';

function getPeopleHeader(itemType?: ItemKind, itemMediaType?: ItemMediaKind) {
    if (
        itemType == ItemKind.MusicAlbum
        || itemMediaType == ItemMediaKind.Audio
        || itemMediaType == ItemMediaKind.Book
        || itemMediaType == ItemMediaKind.Photo
    ) {
        return globalize.translate('People');
    } else {
        return globalize.translate('HeaderCastAndCrew');
    }
}

interface CastAndCrewSectionProps {
    people: ItemDto[];
    itemType?: ItemKind;
    itemMediaType?: ItemMediaKind;
    serverId?: NullableString;
    reloadItems?: () => void;
}

const CastAndCrewSection: FC<CastAndCrewSectionProps> = ({
    people,
    itemType,
    itemMediaType,
    serverId,
    reloadItems
}) => {
    const cast: ItemDto[] = [];
    const guestCast: ItemDto[] = [];

    people.forEach((p) => {
        if (p.Type === ItemKind.GuestStar) {
            guestCast.push(p);
        } else {
            cast.push(p);
        }
    });

    const People_CARD_OPTIONS = {
        coverImage: true,
        serverId: serverId,
        shape: CardShape.PortraitOverflow,
        cardLayout: false,
        centerText: true,
        showTitle: true,
        cardFooterAside: 'none',
        showPersonRoleOrType: true,
        cardCssClass: 'personCard',
        defaultCardImageIcon: 'person',
        lines: 2,
        queryKey: ['DetailsItem']
    };

    return (
        <>
            {cast.length > 0 && (
                <SectionContainer
                    sectionHeaderProps={{
                        className: 'no-padding',
                        title: getPeopleHeader(itemType, itemMediaType)
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
                    items={cast}
                    cardOptions={People_CARD_OPTIONS}
                />
            )}

            {guestCast.length > 0 && (
                <SectionContainer
                    sectionHeaderProps={{
                        className: 'no-padding',
                        title: globalize.translate('HeaderGuestCast')
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
                    items={guestCast}
                    cardOptions={People_CARD_OPTIONS}
                />
            )}
        </>
    );
};

export default CastAndCrewSection;

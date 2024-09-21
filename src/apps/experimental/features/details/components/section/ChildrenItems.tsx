import React, { type FC } from 'react';
import { useChildrenItems } from '../../hooks/useChildrenItems';
import isEqual from 'lodash-es/isEqual';
import Loading from 'components/loading/LoadingComponent';
import globalize from 'lib/globalize';
import layoutManager from 'components/layoutManager';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import { CardShape } from 'utils/card';
import { ItemKind } from 'types/base/models/item-kind';
import type { ItemDto } from 'types/base/models/item-dto';

interface ChildrenItemsProps {
    item: ItemDto;
}

const ChildrenItems: FC<ChildrenItemsProps> = ({ item }) => {
    const { isLoading, data, refetch } = useChildrenItems({
        itemId: item.Id,
        itemType: item.Type,
        itemSeriesId: item.SeriesId,
        itemSeasonId: item.SeasonId
    });

    const childrenItems = data?.Items;

    if (isLoading) {
        return <Loading />;
    }

    if (!childrenItems?.length) {
        return null;
    }

    if (item.Type === ItemKind.MusicAlbum) {
        let showArtist = false;
        for (const track of childrenItems) {
            if (
                !isEqual(
                    track.ArtistItems?.map((x) => x.Id).sort(),
                    track.AlbumArtists?.map((x) => x.Id).sort()
                )
            ) {
                showArtist = true;
                break;
            }
        }
        const discNumbers = childrenItems.map((x) => x.ParentIndexNumber || 0);
        return (
            <SectionContainer
                key={`childrenContent-MusicAlbum-${item.Id}`}
                isListEnabled
                className='verticalSection-extrabottompadding'
                sectionHeaderProps={{
                    className: 'no-padding',
                    title: globalize.translate('HeaderTracks')
                }}
                itemsContainerProps={{
                    className: 'vertical-list',
                    queryKey: ['ChildrenItems'],
                    reloadItems: refetch
                }}
                items={childrenItems}
                listOptions={{
                    smallIcon: true,
                    showIndex:
                        new Set(discNumbers).size > 1
                        || (discNumbers.length >= 1 && discNumbers[0] > 1),
                    index: 'disc',
                    showIndexNumberLeft: true,
                    action: 'playallfromhere',
                    image: false,
                    showArtist: showArtist,
                    queryKey: ['ChildrenItems']
                }}
            />
        );
    } else if (item.Type === ItemKind.Series) {
        return (
            <SectionContainer
                key={`childrenContent-Series-${item.Id}`}
                sectionHeaderProps={{
                    className: 'no-padding',
                    title: globalize.translate('HeaderSeasons')
                }}
                scrollerProps={{
                    className: 'no-padding',
                    isMouseWheelEnabled: false,
                    isCenterFocusEnabled: true
                }}
                itemsContainerProps={{
                    className: 'scrollSlider',
                    queryKey: ['ChildrenItems'],
                    reloadItems: refetch
                }}
                items={childrenItems}
                cardOptions={{
                    shape: CardShape.PortraitOverflow,
                    showTitle: true,
                    centerText: true,
                    lazy: true,
                    overlayPlayButton: true,
                    queryKey: ['ChildrenItems']
                }}
            />
        );
    } else if (item.Type === ItemKind.Season) {
        return (
            <SectionContainer
                key={`childrenContent-Season-${item.Id}`}
                isListEnabled
                className='verticalSection-extrabottompadding'
                sectionHeaderProps={{
                    className: 'no-padding',
                    title: globalize.translate('Episodes')
                }}
                itemsContainerProps={{
                    className: 'vertical-list',
                    queryKey: ['ChildrenItems'],
                    reloadItems: refetch
                }}
                items={childrenItems}
                listOptions={{
                    showIndexNumber: false,
                    enableOverview: true,
                    enablePlayedButton: !layoutManager.mobile,
                    infoButton: !layoutManager.mobile,
                    imageSize: 'large',
                    enableSideMediaInfo: false,
                    highlight: false,
                    action: !layoutManager.desktop ? 'link' : 'none',
                    imagePlayButton: true,
                    includeParentInfoInTitle: false,
                    queryKey: ['ChildrenItems']
                }}
            />
        );
    } else if (item.Type === ItemKind.Episode) {
        return (
            <SectionContainer
                key={`childrenContent-Episode-${item.Id}`}
                sectionHeaderProps={{
                    className: 'no-padding',
                    title: globalize.translate('Episodes')
                }}
                scrollerProps={{
                    className: 'no-padding',
                    isMouseWheelEnabled: false,
                    isCenterFocusEnabled: true
                }}
                itemsContainerProps={{
                    className: 'scrollSlider',
                    queryKey: ['ChildrenItems'],
                    reloadItems: refetch
                }}
                items={childrenItems}
                cardOptions={{
                    shape: CardShape.BackdropOverflow,
                    showTitle: true,
                    overlayText: true,
                    lazy: true,
                    showDetailsMenu: true,
                    overlayPlayButton: true,
                    includeParentInfoInTitle: false,
                    queryKey: ['ChildrenItems']
                }}
            />
        );
    }

    return null;
};

export default ChildrenItems;

import React, { type FC } from 'react';
import { useGetAdditionalPart } from 'hooks/api/videosHooks';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import { CardShape } from 'utils/card';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';

interface AdditionalPartsProps {
    itemId: string;
    userId?: string;
}

const AdditionalParts: FC<AdditionalPartsProps> = ({ itemId, userId }) => {
    const {
        isLoading,
        data: itemResult,
        refetch
    } = useGetAdditionalPart({
        itemId,
        userId
    });

    const additionalPartItems = itemResult?.Items;

    if (isLoading) {
        return <Loading />;
    }

    if (!additionalPartItems?.length) {
        return null;
    }

    return (
        <SectionContainer
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('HeaderAdditionalParts')
            }}
            scrollerProps={{
                className: 'no-padding',
                isMouseWheelEnabled: false,
                isCenterFocusEnabled: true
            }}
            itemsContainerProps={{
                className: 'scrollSlider',
                queryKey: ['AdditionalPart'],
                reloadItems: refetch
            }}
            items={additionalPartItems}
            cardOptions={{
                shape: CardShape.PortraitOverflow,
                showTitle: true,
                action: 'play',
                overlayText: false,
                centerText: true,
                showRuntime: true,
                queryKey: ['AdditionalPart']
            }}
        />
    );
};

export default AdditionalParts;

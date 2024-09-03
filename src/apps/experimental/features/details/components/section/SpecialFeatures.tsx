import React, { type FC } from 'react';
import { useGetSpecialFeatures } from 'hooks/api/userLibraryHooks';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import { CardShape } from 'utils/card';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';

interface SpecialFeaturesProps {
    itemId: string;
    userId?: string;
}

const SpecialFeatures: FC<SpecialFeaturesProps> = ({ itemId, userId }) => {
    const {
        isLoading,
        data: specialFeatures,
        refetch
    } = useGetSpecialFeatures({ itemId, userId });

    if (isLoading) {
        return <Loading />;
    }

    if (!specialFeatures?.length) {
        return null;
    }

    return (
        <SectionContainer
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('SpecialFeatures')
            }}
            scrollerProps={{
                className: 'no-padding',
                isMouseWheelEnabled: false,
                isCenterFocusEnabled: true
            }}
            itemsContainerProps={{
                className: 'scrollSlider',
                queryKey: ['SpecialFeatures'],
                reloadItems: refetch
            }}
            items={specialFeatures}
            cardOptions={{
                shape: CardShape.AutoOverflow,
                showTitle: true,
                action: 'play',
                overlayText: false,
                centerText: true,
                showRuntime: true,
                queryKey: ['SpecialFeatures']
            }}
        />
    );
};

export default SpecialFeatures;

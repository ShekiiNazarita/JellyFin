import React, { type FC } from 'react';
import { type GroupsProgram, useGetGroupProgramsByDate } from '../../hooks/useGetGroupProgramsByDate';
import Loading from 'components/loading/LoadingComponent';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';
import type { ItemDto } from 'types/base/models/item-dto';

interface PogramGuideProps {
    item: ItemDto;
}

const PogramGuide: FC<PogramGuideProps> = ({ item }) => {
    const {
        isLoading,
        data: groupedPrograms,
        refetch
    } = useGetGroupProgramsByDate(item.Id);

    if (isLoading) {
        return <Loading />;
    }

    if (!groupedPrograms?.length) {
        return null;
    }

    const renderPogramGuide = (groupsProgram: GroupsProgram) => (
        <SectionContainer
            key={groupsProgram.dateText}
            isListEnabled
            sectionHeaderProps={{
                title: groupsProgram.dateText
            }}
            itemsContainerProps={{
                className: 'vertical-list',
                queryKey: ['PogramGuide'],
                reloadItems: refetch
            }}
            items={groupsProgram.items}
            listOptions={{
                enableUserDataButtons: false,
                showParentTitle: true,
                image: false,
                showProgramTime: true,
                showMediaInfo: false,
                includeParentInfoInTitle: true,
                includeIndexNumber: true,
                parentTitleWithTitle: true,
                queryKey: ['PogramGuide']
            }}
        />
    );

    return groupedPrograms.map((groupsProgram) => renderPogramGuide(groupsProgram));
};

export default PogramGuide;

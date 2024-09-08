import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import React, { type FC } from 'react';
import { useGetPlaylistItems } from 'hooks/api/playlistsHooks';
import Loading from 'components/loading/LoadingComponent';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';

interface PlaylistViewerProps {
    playlistId: string;
    userId?: string;
}

const PlaylistViewer: FC<PlaylistViewerProps> = ({ playlistId, userId }) => {
    const {
        isLoading,
        data: itemResult,
        refetch
    } = useGetPlaylistItems({
        fields: [ItemFields.PrimaryImageAspectRatio],
        enableImageTypes: [
            ImageType.Primary,
            ImageType.Backdrop,
            ImageType.Thumb,
            ImageType.Banner
        ],
        playlistId,
        userId
    });

    const playlistItems = itemResult?.Items;

    if (isLoading) {
        return <Loading />;
    }

    if (!playlistItems?.length) {
        return null;
    }

    return (
        <SectionContainer
            isListEnabled
            className='verticalSection-extrabottompadding'
            itemsContainerProps={{
                className: 'vertical-list',
                queryKey: ['PlaylistItems'],
                isDragreOrderEnabled: true,
                reloadItems: refetch
            }}
            items={playlistItems || []}
            listOptions={{
                showIndex: false,
                action: 'playallfromhere',
                smallIcon: true,
                dragHandle: true,
                playlistId: playlistId,
                queryKey: ['PlaylistItems']
            }}
        />
    );
};

export default PlaylistViewer;

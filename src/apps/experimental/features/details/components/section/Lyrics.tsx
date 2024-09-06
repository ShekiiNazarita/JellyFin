import type { LyricLine } from '@jellyfin/sdk/lib/generated-client/models/lyric-line';
import React, { type FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useGetLyrics } from 'hooks/api/lyricsHooks';
import globalize from 'lib/globalize';
import Loading from 'components/loading/LoadingComponent';
import SectionContainer from 'apps/experimental/components/section/SectionContainer';

interface LyricsProps {
    itemId: string;
}

const Lyrics: FC<LyricsProps> = ({ itemId }) => {
    const { isLoading, data, refetch } = useGetLyrics({
        itemId
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!data?.Lyrics?.length) {
        return null;
    }

    const renderItem = (lyric: LyricLine, index: number) => (
        <Typography key={index}>
            {lyric.Text}
        </Typography>
    );

    return (
        <SectionContainer
            isListEnabled
            className='verticalSection-extrabottompadding'
            sectionHeaderProps={{
                className: 'no-padding',
                title: globalize.translate('Lyrics')
            }}
            itemsContainerProps={{
                className: 'vertical-list',
                queryKey: ['Lyrics'],
                reloadItems: refetch
            }}
        >
            <Box>
                {data.Lyrics.map((lyric, index) => renderItem(lyric, index))}
            </Box>
        </SectionContainer>
    );
};

export default Lyrics;

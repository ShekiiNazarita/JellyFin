import React, { type FC, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Seriesrecordingeditor from 'components/recordingcreator/seriesrecordingeditor';
import type { ItemDto } from 'types/base/models/item-dto';

interface SeriesRecordingEditorContainerProps {
    item: ItemDto;
}

const SeriesRecordingEditorContainer: FC<SeriesRecordingEditorContainerProps> = ({
    item
}) => {
    const seriesrecordingeditorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = seriesrecordingeditorRef.current;
        if (!element) {
            console.error('Unexpected null reference');
            return;
        }
        Seriesrecordingeditor.embed(item, item.ServerId, {
            context: element
        });
    }, [item]);

    return (
        <Box
            ref={seriesrecordingeditorRef}
            className='seriesRecordingEditor'
        />
    );
};

export default SeriesRecordingEditorContainer;

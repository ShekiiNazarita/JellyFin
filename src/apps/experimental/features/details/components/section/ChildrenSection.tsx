import React, { type FC } from 'react';
import PlaylistViewer from './PlaylistViewer';
import ItemsByName from './ItemsByName';
import ChildrenItems from './ChildrenItems';
import type { ItemDto } from 'types/base/models/item-dto';
import { ItemKind } from 'types/base/models/item-kind';

interface ChildrenSectionProps {
    item: ItemDto;
}

const ChildrenSection: FC<ChildrenSectionProps> = ({ item }) => {
    if (item.Type === ItemKind.Playlist && item.Id) {
        return <PlaylistViewer playlistId={item.Id} />;
    } else if (
        item.Type === ItemKind.Studio
        || item.Type === ItemKind.Person
        || item.Type === ItemKind.Genre
        || item.Type === ItemKind.MusicGenre
        || item.Type === ItemKind.MusicArtist
    ) {
        return <ItemsByName item={item} />;
    } else if (item.IsFolder && item.Type !== ItemKind.BoxSet) {
        return <ChildrenItems item={item} />;
    } else {
        return null;
    }
};

export default ChildrenSection;

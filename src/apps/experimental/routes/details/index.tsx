import type { CollectionType } from '@jellyfin/sdk/lib/generated-client';
import React, { type FC } from 'react';
import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';
import { useApi } from 'hooks/useApi';
import { useGetDetailsItem } from 'apps/experimental/features/details/hooks/api/useGetDetailsItem';

import Page from 'components/Page';
import Loading from 'components/loading/LoadingComponent';

import { TrackSelectionsProvider } from 'apps/experimental/features/details/hooks/useTrackSelections';
import DetailsBanner from 'apps/experimental/features/details/components/DetailBanner';
import DetailPrimaryContainer from 'apps/experimental/features/details/components/DetailPrimaryContainer';
import DetailSecondaryContainer from 'apps/experimental/features/details/components/DetailSecondaryContainer';

import SeriesTimerSchedule from 'apps/experimental/features/details/components/section/SeriesTimerSchedule';
import CollectionItems from 'apps/experimental/features/details/components/section/CollectionItems';
import NextUp from 'apps/experimental/features/details/components/section/NextUp';
import PogramGuide from 'apps/experimental/features/details/components/section/PogramGuide';
import ChildrenSection from 'apps/experimental/features/details/components/section/ChildrenSection';
import AdditionalParts from 'apps/experimental/features/details/components/section/AdditionalParts';
import MoreFromSeason from 'apps/experimental/features/details/components/section/MoreFromSeason';
import MoreFromArtist from 'apps/experimental/features/details/components/section/MoreFromArtist';
import CastAndCrewSection from 'apps/experimental/features/details/components/section/CastAndCrewSection';
import SeriesSchedule from 'apps/experimental/features/details/components/section/SeriesSchedule';
import SpecialFeatures from 'apps/experimental/features/details/components/section/SpecialFeatures';
import MusicVideos from 'apps/experimental/features/details/components/section/MusicVideos';
import Scenes from 'apps/experimental/features/details/components/section/Scenes';

import { ItemKind } from 'types/base/models/item-kind';
import './details.scss';

const Details: FC = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const seriesTimerId = searchParams.get('seriesTimerId');
    const genre = searchParams.get('genre');
    const musicgenre = searchParams.get('musicgenre');
    const musicartist = searchParams.get('musicartist');
    const context = searchParams.get('context') as CollectionType;

    const { user } = useApi();

    const {
        isLoading,
        isFetching,
        isSuccess,
        data: item,
        refetch
    } = useGetDetailsItem({
        urlParams: {
            id,
            seriesTimerId,
            genre,
            musicgenre,
            musicartist
        }
    });

    if (isLoading || isFetching) {
        return <Loading />;
    }

    return (
        <Page
            id='detailPage'
            className={classNames(
                'mainAnimatedPage libraryPage itemDetailPage noSecondaryNavPage selfBackdropPage'
            )}
            isBackButtonEnabled={true}
        >
            {isSuccess && item && (
                <div className='detail-container'>
                    <DetailsBanner item={item} />
                    <TrackSelectionsProvider key={id} item={item} paramId={id}>
                        <div className='detailPageWrapperContainer'>
                            <DetailPrimaryContainer item={item} paramId={id} />
                            <div className='detailPageSecondaryContainer padded-bottom-page'>
                                <div className='detailPageContent'>
                                    <DetailSecondaryContainer
                                        item={item}
                                        context={context}
                                        user={user}
                                    />

                                    {item.Type === ItemKind.SeriesTimer
                                        && user?.Policy
                                            ?.EnableLiveTvManagement && (
                                        <SeriesTimerSchedule
                                            seriesTimerId={item.Id}
                                        />
                                    )}

                                    {item.IsFolder
                                        && item.Type === ItemKind.BoxSet && (
                                        <CollectionItems item={item} />
                                    )}

                                    {item.Id
                                        && item.Type === ItemKind.Series && (
                                        <NextUp
                                            seriesId={item.Id}
                                            userId={user?.Id}
                                        />
                                    )}

                                    {item.Type === ItemKind.TvChannel && (
                                        <PogramGuide item={item} />
                                    )}

                                    <ChildrenSection item={item} />

                                    {item.Id
                                        && item.PartCount != null
                                        && item.PartCount > 1 && (
                                        <AdditionalParts
                                            itemId={item.Id}
                                            userId={user?.Id}
                                        />
                                    )}

                                    {item.SeasonId
                                        && item.SeriesId
                                        && item.Type === ItemKind.Episode && (
                                        <MoreFromSeason
                                            seasonId={item.SeasonId}
                                            seriesId={item.SeriesId}
                                            seasonName={item.SeasonName}
                                            userId={user?.Id}
                                        />
                                    )}

                                    {(item.Type === ItemKind.MusicArtist
                                        || (item.Type === ItemKind.MusicAlbum
                                            && item?.AlbumArtists
                                            && item.AlbumArtists.length > 0)) && (
                                        <MoreFromArtist item={item} />
                                    )}

                                    {item.People && item.People.length > 0 && (
                                        <CastAndCrewSection
                                            people={item.People}
                                            itemType={item.Type}
                                            itemMediaType={item.MediaType}
                                            serverId={item.SeasonId}
                                            reloadItems={refetch}
                                        />
                                    )}

                                    {item.Id
                                        && item.Type == ItemKind.Series
                                        && user?.Policy
                                            ?.EnableLiveTvManagement && (
                                        <SeriesSchedule
                                            librarySeriesId={item.Id}
                                            userId={user?.Id}
                                        />
                                    )}

                                    {item.Id
                                        && item.SpecialFeatureCount != null
                                        && item.SpecialFeatureCount > 0 && (
                                        <SpecialFeatures
                                            itemId={item.Id}
                                            userId={user?.Id}
                                        />
                                    )}

                                    {item.Id
                                        && (item.Type === ItemKind.MusicAlbum
                                            || item.Type
                                                === ItemKind.MusicArtist) && (
                                        <MusicVideos
                                            itemType={item.Type}
                                            itemId={item.Id}
                                            userId={user?.Id}
                                        />
                                    )}

                                    {item.Chapters
                                        && item.Chapters.length > 0
                                        && item.Chapters[0].ImageTag && (
                                        <Scenes
                                            chapters={item.Chapters}
                                            item={item}
                                            reloadItems={refetch}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </TrackSelectionsProvider>
                </div>
            )}
        </Page>
    );
};

export default Details;

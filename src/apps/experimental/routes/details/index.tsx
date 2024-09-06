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
import NextUp from 'apps/experimental/features/details/components/section/NextUp';
import PogramGuide from 'apps/experimental/features/details/components/section/PogramGuide';

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
        data: item
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

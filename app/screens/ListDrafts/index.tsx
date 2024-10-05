import useDayjs from '../../hooks/useDayjs';
import {
  addDraftObservation as addDraftObservationAction,
  removeDraftObservation as removeDraftObservationAction,
  selectIds,
  selectById,
} from '../../store/draftObservations';

import {
  addObservation as addObservationAction,
  updateObservation as updateObservationAction,
} from '../../store/observations';
import {
  removeDraftImage as removeDraftImageAction,
  selectByDraftObservationId,
} from '../../store/draftImages';
import DraftListEmptyView from './DraftListEmptyView';
import DraftListItem from './DraftListItem';
import { useNavigation } from '@react-navigation/core';
import { nanoid } from '@reduxjs/toolkit';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { FloatingButton, Spacings, View, LoaderScreen, Colors } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect, ConnectedProps, useSelector } from 'react-redux';
import HeaderButtons from '../../components/header/HeaderButtons';
import { Item } from 'react-navigation-header-buttons';
import { useKey } from '../../hooks/useAuth';

interface DraftListProps extends PropsFromRedux {}

import { store } from '../../store'; // Path to your Redux store
import {
  usePostImageMutation,
  usePostObservationMutation,
} from '../../store/mushroomObserver';
import _, { get } from 'lodash';
import {
  setError as setErrorAction,
  setInfo as setInfoAction
} from '../../store/flash';
import { addImage as addImageAction } from '../../store/images';

const getDraftObservationById = (id: string) => {
  const state = store.getState();
  return selectById(state, id);
};

const getDraftImagesForObservationId = (obsId: string) => {
  const state = store.getState();
  return selectByDraftObservationId(state, obsId);
};

const DraftList = ({
  draftObservationIds,
  removeDraftObservation,
  addObservation,
  updateObservation,
  addDraftObservation,
  addImage,
  removeDraftImage,
  setInfo,
  setError,
}: DraftListProps) => {
  const navigation = useNavigation();
  const dayjs = useDayjs();
  const apiKey = useKey();

  const [isLoading, setIsLoading] = useState(false);
  const [postObservation, postObservationResult] = usePostObservationMutation();
  const [postImage, postImageResult] = usePostImageMutation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ marginRight: 20 }}>
          <HeaderButtons>
            <Item
              title={'Upload All'}
              onPress={() => !isLoading && uploadAllObservations(draftObservationIds)}
              disabled={isLoading}
            />
          </HeaderButtons>
        </View>
      ),
    });
  }, [navigation, draftObservationIds, isLoading]);

  const uploadObservation = useCallback(
    (draftObservationId: string) => {
      const draftObservation = getDraftObservationById(draftObservationId);

      if (!draftObservation) {
        console.error('Draft observation not found');
        return;
      }

      const {
        name,
        date,
        location,
        isCollectionLocation = true,
        latitude,
        longitude,
        altitude,
        gpsHidden = false,
        vote,
        notes,
        draftPhotoIds,
      } = draftObservation;

      const imagesToUpload = getDraftImagesForObservationId(draftObservationId);

      postObservation({
        api_key: apiKey,
        name,
        date: dayjs(date).format('YYYYMMDD'),
        location,
        isCollectionLocation,
        latitude,
        longitude,
        altitude,
        gpsHidden,
        vote,
        notes,
        detail: 'high',
      })
        .then(postObservationResponse => {
          const newObservation = get(postObservationResponse, 'data.results[0]');
          if (newObservation) {
            setInfo('Observation created');
            addObservation(newObservation);
            removeDraftObservation(draftObservationId);

            if (imagesToUpload.length > 0) {
              return Promise.all(
                imagesToUpload.map(image =>
                  postImage({
                    key: apiKey,
                    copyright_holder: image?.copyrightHolder,
                    date: image?.date
                      ? dayjs(image.date).format('YYYYMMDD')
                      : undefined,
                    license: image?.license?.value,
                    md5sum: image?.md5,
                    notes: image?.notes,
                    observations: newObservation.id,
                    original_name: image.fileName,
                    uri: image.uri,
                    name: image.fileName,
                    type: image.type,
                    detail: 'high',
                  })
                    .then(imageUploadResponse => {
                      const newImage = get(imageUploadResponse, 'data.results[0]');
                      if (newImage) {
                        setInfo('Image uploaded');
                        addImage(newImage);
                        removeDraftImage(image.id);
                        return newImage.id;
                      }
                      const error = get(imageUploadResponse, 'error.data.errors[0].details');
                      if (error) {
                        setError(error);
                      }
                    })
                    .catch(e => console.log('image upload failed', e)),
                ),
              )
                .then(results => {
                  updateObservation({
                    id: newObservation.id,
                    changes: {
                      photoIds: results,
                    },
                  });
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
                })
                .catch(e => console.log('failed', e));
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          }

          const error = get(postObservationResponse, 'error.data.errors[0].details');
          if (error) {
            setError(error);
          }
        })
        .catch(e => console.log('create failed', e));
    },
    [apiKey], // Add other necessary dependencies
  );

  const uploadAllObservations = useCallback(
    (draftObservationIds) => {
      // There is a race condition here if the user spams 'Upload All'
      if (isLoading) return;
      setIsLoading(true);
      draftObservationIds.forEach((id) => {
        uploadObservation(id);
      });
      setIsLoading(false);
    }, [isLoading, uploadObservation]
  );

  return (
    <View flex>
      <FlatList
        data={draftObservationIds}
        ListEmptyComponent={DraftListEmptyView}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={({ item }) => <DraftListItem id={item} key={item} />}
      />
      <FloatingButton
        visible
        bottomMargin={Spacings.s4}
        button={{
          label: 'Create Observation',
          size: 'medium',
          onPress: () => {
            const id = nanoid();
            addDraftObservation({
              id,
              date: dayjs(new Date()).format('YYYYMMDD'),
              draftPhotoIds: [],
            });
            navigation.navigate('Create Draft', { id });
          },
          iconSource: () => (
            <View marginR-10>
              <Icon name="eye" size={25} color="white" />
            </View>
          ),
        }}
        hideBackgroundOverlay
      />
      { isLoading && (
        <LoaderScreen
          color={Colors.blue30}
          backgroundColor={Colors.grey50}
          message="Loading..."
          overlay
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    flexGrow: 1,
  },
});

const mapStateToProps = (state: any, ownProps: any) => ({
  draftObservationIds: selectIds(state),
});

const mapDispatchToProps = {
  addDraftObservation: addDraftObservationAction,
  removeDraftObservation: removeDraftObservationAction,
  addObservation: addObservationAction,
  updateObservation: updateObservationAction,
  addImage: addImageAction,
  removeDraftImage: removeDraftImageAction,
  setInfo: setInfoAction,
  setError: setErrorAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

const ConnectedDraftList = connector(DraftList);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default ConnectedDraftList;

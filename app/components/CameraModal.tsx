import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Modal, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import { Camera, useCameraDevice, useCameraPermission, useLocationPermission } from 'react-native-vision-camera';
import Exif from 'react-native-exif';
import { nanoid } from '@reduxjs/toolkit';

type VoidFunction = () => void;

interface CameraModalProps {
  closeToggle: VoidFunction;
  visible: boolean;
}

export const CameraModal = ({
  closeToggle,
  obsId,
  visible,
  callback
}: CameraModalProps) => {
  const device = useCameraDevice('back');
  const { hasCameraPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const { hasLocationPermission, requestPermission } = useLocationPermission()

  useEffect(() => {
    if (hasLocationPermission == false) {
      requestPermission();
    }
  }, [hasLocationPermission]);

  const takePhoto = async () => {
    console.log('takePhoto:obsId: ' + obsId)
    if (camera.current) {
      const photo = await camera.current.takePhoto();
      const { exif } = await Exif.getExif(photo.path);
      const newId = nanoid();
      const draftImage = {
        date: exif['{GPS}']?.DateStamp.replace(/:/g, ''),
        uri: photo.path,
        id: newId,
        draftObservationId: obsId,
      };
      console.log('takePhoto:draftImage: ' + JSON.stringify(draftImage, null, 2));
      callback({didCancel: false, assets: [draftImage]})
      closeToggle();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeToggle}
    >
      <View style={styles.modalOverlay}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          ref={camera}
          enableLocation={true}
        />
        <TouchableOpacity style={styles.takePhoto} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeCamera} onPress={closeToggle}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  takePhoto: {
    position: 'absolute',
    bottom: 20,
    left: '33%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  closeCamera: {
    position: 'absolute',
    bottom: 20,
    left: '66%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    color: 'black',
  },
});

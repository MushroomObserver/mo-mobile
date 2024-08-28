import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Modal, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import { Camera, useCameraDevice, useCameraPermission, useLocationPermission } from 'react-native-vision-camera';
import Exif from 'react-native-exif';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
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
  const { hasPermission: hasCamPerm, requestPermission: reqCamPerm } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const { hasPermission: hasLocPerm, requestPermission: reqLocPerm } = useLocationPermission()

  useEffect(() => {
    if (hasLocPerm == false) {
      reqLocPerm();
    }
  }, [hasLocPerm]);

  const takePhoto = async () => {
    console.log('takePhoto:obsId: ' + obsId)
    if (camera.current) {
      const photo = await camera.current.takePhoto();
      // NJW: Is the "file://" prefix needed?  Under iOS photo.path already
      // starts with "file://"
      const cameraRollURI = await CameraRoll.save(`file://${photo.path}`, {
        type: 'photo',
      })
      console.log("#### photo.path:", photo.path);
      console.log("#### CAM ROLL URI:", cameraRollURI);
      const { exif } = await Exif.getExif(photo.path);
      const newId = nanoid();
      const draftImage = {
        timestamp: exif['{GPS}']?.DateStamp.replace(/:/g, ''),
        // NJW: Under iOS cameraRollURI starts with 'ph://' and does not get
	// lat/long info from react-native-exif.  However, 'photo.path' seems
	// to work correctly.  Note that under iOS the same URI is returned if
	// I subsequently pull the same image from the Gallery.
        uri: photo.path,
        // uri: cameraRollURI,
        id: newId,
        draftObservationId: obsId,
      };
      console.log('takePhoto:draftImage: ' + JSON.stringify(draftImage, null, 2));
      callback({didCancel: false, assets: [draftImage]});
      closeToggle();
    }
  };

  if (device) {
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
            photoQualityBalance="quality"
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
  } else {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={closeToggle}
      >
        <View style={styles.modalOverlay}>
          <Text>No Camera Found</Text>
          <TouchableOpacity style={styles.closeCamera} onPress={closeToggle}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
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

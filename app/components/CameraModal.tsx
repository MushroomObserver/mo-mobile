import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Modal, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import { Camera, useCodeScanner, useCameraDevice, useCameraPermission, useLocationPermission } from 'react-native-vision-camera';
import Exif from 'react-native-exif';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { nanoid } from '@reduxjs/toolkit';

type VoidFunction = () => void;

interface CameraModalProps {
  closeToggle: VoidFunction;
  saveCode: VoidFunction;
  visible: boolean;
}

export const CameraModal = ({
  closeToggle,
  saveCode,
  obsId,
  visible,
  callback
}: CameraModalProps) => {
  const device = useCameraDevice('back');
  const { hasPermission: hasCamPerm, requestPermission: reqCamPerm } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const { hasPermission: hasLocPerm, requestPermission: reqLocPerm } = useLocationPermission();
  const [lastCode, setLastCode] = useState(false);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      codes.forEach((code) => {
        setLastCode(code['value']);
      });
    }
  });

  const sendCode = async () => {
    saveCode(lastCode);
  };

  useEffect(() => {
    if (hasLocPerm == false) {
      reqLocPerm();
    }
  }, [hasLocPerm]);

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
            codeScanner={codeScanner}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
            ref={camera}
            enableLocation={true}
            photoQualityBalance="quality"
          />
          <TouchableOpacity style={styles.sendCode} onPress={sendCode}>
            <Text style={styles.buttonText}>Save Code</Text>
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
  sendCode: {
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

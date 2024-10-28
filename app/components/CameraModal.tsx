import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Modal, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import { Camera, useCodeScanner, useCameraDevice, useCameraPermission, useLocationPermission } from 'react-native-vision-camera';
import Exif from 'react-native-exif';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { nanoid } from '@reduxjs/toolkit';
import Icon from 'react-native-vector-icons/FontAwesome';

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
      codes.forEach((raw_code) => {
        value = raw_code['value'];
        const code = value.substring(value.lastIndexOf('/') + 1);
        setLastCode(code);
      });
    }
  });

  const sendCode = async () => {
    saveCode(lastCode);
  };

  useEffect(() => {
    // Request camera permission on component mount
    const getPermission = async () => {
      const status = await reqCamPerm();
      if (status === 'denied') {
        Alert.alert('Permission Denied', 'Camera access is required to use this feature.');
      }
    };
    getPermission();
  }, [reqCamPerm]);

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
            <Text style={styles.buttonText}>{ lastCode ? `Save ${lastCode}` : "Scanning..."}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeIcon} onPress={closeToggle}>
            <Icon name="close" size={30} color="white" />
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
    left: '18%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  closeCamera: {
    position: 'absolute',
    bottom: 20,
    left: '18%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  closeIcon: {
    position: 'absolute',
    top: 20, // Positioning from the top of the screen
    left: 20, // Positioning from the left side
    padding: 10,
    zIndex: 1, // Ensure it stays on top of other components
  },
  buttonText: {
    fontSize: 20,
    color: 'black',
  },
});

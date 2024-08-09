import { useActionSheet } from '@expo/react-native-action-sheet';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Callback,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { Button, Modal, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import {
  useCameraDevice,
  useCameraPermission
} from 'react-native-vision-camera';

interface AddPhotosButtonProps {
  callback: Callback;
  numPhotos: number;
  maxPhotos: number;
}

const AddPhotosButton = ({
  callback,
  numPhotos,
  maxPhotos,
}: AddPhotosButtonProps) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const [modalVisible, setModalVisible] = useState(false);

  const device = useCameraDevice('back')
  const { hasPermission } = useCameraPermission()
  if (!hasPermission) return <PermissionsPage />
  if (device == null) return <NoCameraDeviceError />

  const toggleModal = () => {
    setModalVisible(!modalVisible);
    console.log('modalVisible: ' + modalVisible);
  };

  return (
    <View style={styles.container}>
      <Button
        label="Add Photos"
        size={Button.sizes.medium}
        onPress={() =>
          showActionSheetWithOptions(
            {
              options: ['Camera', 'Gallery', 'Cancel'],
              cancelButtonIndex: 2,
            },
            selectedIndex => {
              switch (selectedIndex) {
                case 0:
		  console.log('Before launchCamera');
		  toggleModal();
                  break;
                case 1:
                  launchImageLibrary(
                    {
                      mediaType: 'photo',
                      selectionLimit: maxPhotos - numPhotos,
                      includeExtra: true,
                    },
                    callback,
                  );
                  break;
                default:
                  break;
              }
            },
          )
        }
        disabled={maxPhotos === numPhotos}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>This is a modal dialog!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AddPhotosButton;

import { useActionSheet } from '@expo/react-native-action-sheet';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Callback,
  launchImageLibrary,
} from 'react-native-image-picker';

import { Button, Modal, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import { CameraModal } from '../components/CameraModal';
import CameraRollModal from '../components/CameraRollModal';

interface AddPhotosButtonProps {
  callback: Callback;
  numPhotos: number;
  maxPhotos: number;
}

const AddPhotosButton = ({
  callback,
  obsId,
  numPhotos,
  maxPhotos,
}: AddPhotosButtonProps) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraRoll, setCameraRoll] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
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
                  // setCameraRoll(true);
                  break;
                default:
                  break;
              }
            },
          )
        }
        disabled={maxPhotos === numPhotos}
      />
      {cameraRoll && <CameraRollModal callback={callback} closeRoll={() => setCameraRoll(false)}/>}
      <CameraModal obsId={obsId} closeToggle={toggleModal} visible={modalVisible} callback={callback}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default AddPhotosButton;

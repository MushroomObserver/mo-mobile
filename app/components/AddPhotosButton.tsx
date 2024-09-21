import { useActionSheet } from '@expo/react-native-action-sheet';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Callback,
  launchImageLibrary,
} from 'react-native-image-picker';
import ImagePicker, {Image as ImagePickerImage } from 'react-native-image-crop-picker';

import { Button, Modal, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import { CameraModal } from '../components/CameraModal';
import CameraRollModal from '../components/CameraRollModal';

interface AddPhotosButtonProps {
  callback: Callback;
  numPhotos: number;
  maxPhotos: number;
}

function calcTimestamp(image: ImagePickerImage): string {
  console.log('MODebug:calcTimestamp: ' + JSON.stringify(image, null, 2));

  // Try to get the timestamp from different sources
  let result = image.exif?.GPSDateStamp
    ?? image.exif?.['{GPS}']?.DateStamp
    ?? image.exif?.['{Exif}']?.DateTimeOriginal;

  // Log the selected result
  console.log('MODebug:calcTimestamp:SelectedTimestamp: ' + result);

  // If the result comes from DateTimeOriginal, split and keep the date part
  if (result && result.includes(" ")) {
    result = result.split(" ")[0]; // Take the date part only
  }

  // Return cleaned-up timestamp or an empty string if not found
  return result ? result.replace(/:/g, '') : '';
}

function isValidURL(str: string): boolean {
  try {
    new URL(str); // Try creating a URL object
    return true;  // If successful, it's a valid URL
  } catch (_) {
    return false; // If an error is thrown, it's not a valid URL
  }
};

function calcPath(image: ImagePickerImage): string {
  if (isValidURL(image.sourceURL)) {
    console.log('MODebug:calcPath:sourceURL: ' + image.sourceURL);
    return image.sourceURL;
  }

  if (isValidURL(image.path)) {
    console.log('MODebug:calcPath:path: ' + image.path);
    return image.path;
  }

  return 'file://' + image.path;
};

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
                  ImagePicker.openCamera({
                    includeExif: true
                  }).then(image => {
                    console.log('Camera!');
                    const asset = {
                      timestamp: calcTimestamp(image),
                      uri: calcPath(image),
                      fileName: Platform.OS === 'android' ? 'android-image.jpg' : 'ios-image.jpg',
                      type: 'image/jpg',
                    };
		    const assets = [asset];
                    console.log('MODebug:camera', assets);
                    callback({ didCancel: false, assets });
                  });
                  break;
                case 1:
                  ImagePicker.openPicker({
                    includeExif: true,
                    multiple: true, // Enable multiple selection
                  }).then(images => {
                    const assets = images.map(image => ({
                      timestamp: calcTimestamp(image),
                      uri: calcPath(image),
                      fileName: Platform.OS === 'android' ? 'android-image.jpg' : 'ios-image.jpg',
                      type: 'image/jpg',
                    }));

                    callback({ didCancel: false, assets });
                  });
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

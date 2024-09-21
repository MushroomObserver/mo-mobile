import { useActionSheet } from '@expo/react-native-action-sheet';
import React, { useState } from 'react';
import { StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import {
  Callback,
  launchImageLibrary,
} from 'react-native-image-picker';
import ImagePicker, {Image as ImagePickerImage } from 'react-native-image-crop-picker';

import { Button, Modal, Text, TouchableOpacity, View } from 'react-native-ui-lib';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Geolocation from 'react-native-geolocation-service';

// Function to get current latitude, longitude, and altitude
const getCurrentLocation = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location.',
          buttonPositive: 'OK',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission denied');
        return null; // Return null if permission is denied
      }
    }

    // Wrap Geolocation.getCurrentPosition in a Promise
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, altitude } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Altitude: ${altitude}`);
          resolve({ latitude, longitude, altitude }); // Resolve the Promise with the location data
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null); // Resolve with null if there is an error
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return null; // Return null in case of error
  }
};

interface AddPhotosButtonProps {
  callback: Callback;
  numPhotos: number;
  maxPhotos: number;
}

function currentDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
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
    if (!image.path.startsWith('/')) return image.path;
  }

  return 'file://' + image.path;
};

// Helper function to handle camera capture and saving
const handleCameraCapture = async (callback) => {
  try {
    // Capture image using ImagePicker
    const image = await ImagePicker.openCamera({
      mediaType: 'photo',
      includeExif: true,
      cropping: false,
    });

    // Fetch current location (latitude, longitude, altitude)
    const location = await getCurrentLocation();

    const asset = {
      timestamp: currentDate(),
      uri: calcPath(image),
      fileName: Platform.OS === 'android' ? 'android-image.jpg' : 'ios-image.jpg',
      type: 'image/jpg',
      location: location || null, // Add location data if available, otherwise set null
    };

    // Save the image to the gallery using CameraRoll
    await CameraRoll.save(asset.uri, { type: 'photo' });

    const assets = [asset];
    callback({ didCancel: false, assets });
  } catch (error) {
    console.log(error);
    callback({ didCancel: true, assets: [] });
  }
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
                  handleCameraCapture(callback);
                  console.log('MODebug:end case 0');
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

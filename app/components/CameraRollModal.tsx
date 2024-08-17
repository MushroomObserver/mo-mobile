import React, {useEffect} from 'react';
import { Button, Modal, Text, TouchableOpacity, View, Image } from 'react-native-ui-lib';
import { StyleSheet } from 'react-native';

import {useCameraRoll} from "@react-native-camera-roll/camera-roll";
import assets from '../styles/assets';

const RollModal = ({callback, closeRoll}) =>  {
  const [photos, getPhotos, save] = useCameraRoll();

  console.log("### PHOTOS", photos?.edges[0]?.node)

  return(
  <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={closeRoll}
    >
        <View style={styles.modalOverlay}>
        <Button onPress={() => getPhotos()} label="Get Photos" />
        <View>
      {photos ? photos.edges.map((photo, index) => 
        (<View key={photo.node.id}>
        <Image source={{uri: photo.node.image.uri}} height={100} width={100} /> 
        <Text>{photo.node.id}</Text>
        <Button label="This one!" onPress={() => callback({didCancel: false, assets: [photo.node.image]})}/>
        </View>)) : <Text>Loading...</Text>}
      </View>
      <Text>Modal</Text>
        </View>
    </Modal>)
};

export default RollModal;

const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});
// {"edges": 
// [{"node": [Object]}, 
// {"node": [Object]}, 
// {"node": [Object]}, 
// {"node": [Object]}, 
// {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]},
//  {"node": [Object]}], "page_info": {"end_cursor": "20", "has_next_page": true}
// }

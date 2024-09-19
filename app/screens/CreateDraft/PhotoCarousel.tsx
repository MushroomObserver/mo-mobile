import DraftPhoto from '../../components/DraftPhoto';
import useDayjs from '../../hooks/useDayjs';
import { selectById } from '../../store/draftImages';
import { useNavigation } from '@react-navigation/core';
import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import {
  Carousel,
  Chip,
  Colors,
  Spacings,
  Text,
  View,
} from 'react-native-ui-lib';
import { connect, ConnectedProps } from 'react-redux';
import Exif from 'react-native-exif';

interface PhotoCarouselProps {
  draftPhotoIds: string[];
  onUseInfo: Function;
  onRemovePhoto: Function;
}

interface PhotoProps extends PropsFromRedux {
  id: string;
  onUseInfo: Function;
  onRemovePhoto: Function;
}

const Photo = ({ id, draftPhoto, onUseInfo, onRemovePhoto }: PhotoProps) => {
  const navigation = useNavigation();
  const dayjs = useDayjs();

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [altitude, setAltitude] = useState(null);

  useEffect(() => {
    const getLocationData = async () => {
      const { latitude, longitude } = await Exif.getLatLong(draftPhoto?.uri);
      setLatitude(latitude);
      setLongitude(longitude);
    };

    getLocationData();
  }, []);

  useEffect(() => {
    const getAltitudeData = async () => {
      try {
        const { exif } = await Exif.getExif(draftPhoto?.uri);
        console.log('MODebug:PhotoCarousel:exif: ' + JSON.stringify(exif, null, 2));

        // Extract altitude from exif data
        let altitude = exif['{GPS}']?.Altitude;

        if (altitude === undefined) {
          const gpsAltitude = exif.GPSAltitude;

          if (typeof gpsAltitude === 'string') {
            const [numerator, denominator] = gpsAltitude.split('/').map(Number);
            altitude = denominator === 0 ? 0 : numerator / denominator;
          }
        }

        setAltitude(altitude);
      } catch (error) {
        console.error('Error getting altitude data:', error);
      }
    };

    getAltitudeData();
  }, [draftPhoto?.uri]);

  return (
    <View marginH-s4>
      <DraftPhoto
        id={id}
        key={id}
        borderRadius={11}
        width="100%"
        aspectRatio={1.3}
      />
      <View
        absT
        flex
        row
        spread
        padding-5
        style={{
          borderTopLeftRadius: 11,
          borderTopRightRadius: 11,
          backgroundColor: Colors.rgba(Colors.white, 0.7),
        }}
      >
        <View flex marginR-10>
          <View row spread>
            {latitude && longitude ? (
              <View>
                <Text text100L>
                  {latitude.toFixed(4)} {longitude.toFixed(4)}
                </Text>
                <Text text100L>{altitude?.toFixed(2)}m</Text>
              </View>
            ) : (
              <Text text100L>No location info available.</Text>
            )}
            <Text text100M grey10>
              {dayjs(draftPhoto?.date).format('ll')}
            </Text>
          </View>
        </View>
        <View centerV>
          <Chip
            backgroundColor={Colors.white}
            label="Use Info"
            onPress={() =>
              onUseInfo(
                draftPhoto?.date,
                latitude,
                longitude,
                altitude,
              )
            }
            labelStyle={{ color: Colors.white }}
            containerStyle={{
              borderColor: Colors.yellow20,
              backgroundColor: Colors.yellow20,
            }}
          />
        </View>
      </View>
      <View
        absB
        flex
        row
        spread
        padding-5
        style={{
          borderBottomLeftRadius: 11,
          borderBottomRightRadius: 11,
          backgroundColor: Colors.rgba(Colors.white, 0.7),
        }}
      >
        <View flex row spread>
          <Chip
            backgroundColor={Colors.white}
            label="Remove"
            onPress={() => onRemovePhoto(id)}
            labelStyle={{ color: Colors.white }}
            containerStyle={{
              borderColor: Colors.red20,
              backgroundColor: Colors.red20,
            }}
          />
          <Chip
            backgroundColor={Colors.white}
            label="Edit"
            onPress={() =>
              navigation.navigate('Create Photo', {
                id,
              })
            }
            labelStyle={{ color: Colors.white }}
            containerStyle={{
              borderColor: Colors.primary,
              backgroundColor: Colors.primary,
            }}
          />
        </View>
      </View>
    </View>
  );
};

const mapStateToProps = (state: any, ownProps: any) => ({
  draftPhoto: selectById(state, ownProps.id),
});

const connector = connect(mapStateToProps);

const ConnectedPhoto = connector(Photo);

type PropsFromRedux = ConnectedProps<typeof connector>;

const PhotoCarousel = ({
  draftPhotoIds,
  onUseInfo,
  onRemovePhoto,
}: PhotoCarouselProps) => {
  return (
    <Carousel
      horizontal
      allowAccessibleLayout
      pageControlPosition={Carousel.pageControlPositions.OVER}
      pageControlProps={{
        color: Colors.primary,
        inactiveColor: Colors.grey30,
      }}
    >
      {draftPhotoIds.map(id => (
        <ConnectedPhoto
          marginH-s3
          key={id}
          id={id}
          onUseInfo={onUseInfo}
          onRemovePhoto={() => onRemovePhoto(id)}
        />
      ))}
    </Carousel>
  );
};

export default PhotoCarousel;

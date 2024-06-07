import { Location, selectAll, updateLastUsed } from '../store/locations';
import { filter, lowerCase, orderBy, find } from 'lodash';
import React, { useState, useEffect } from 'react';
import { Button, Colors, Incubator, Picker, PickerValue, View } from 'react-native-ui-lib';
import { connect, useDispatch } from 'react-redux';

interface LocationPickerProps {
  location: string;
  locations: Location[];
  onChangeLocation:   (value: PickerValue) => void;
}

const LocationPicker = ({
  location,
  locations,
  onChangeLocation,
}: LocationPickerProps) => {
  const [query, setQuery] = useState('');
  const [searchResults, setResults] = useState<ArrayLike<any> | null | undefined>();
  const dispatch = useDispatch();

  useEffect(() => {
    const newResults = orderBy(
      filter(locations, ({ name }) =>
        lowerCase(name).includes(lowerCase(query)),
      ),
      [({lastUsed}) => lastUsed !== undefined && lastUsed, ({ name }) => name.toLowerCase()],
      ['desc', 'asc'],
    );

    setResults(newResults);
  }, [query]);
  
  const renderItem = ({ item }: { item: Location }) => {
    if(item.lastUsed) {
      return <Picker.Item key={item.id} value={item.name} label={item.name} labelStyle={{color: Colors.$textDefault, fontStyle: 'italic'}}/> 
    } else {
    return <Picker.Item key={item.id} value={item.name} label={item.name} /> 
    }
  };

  return (
    <View>
      <Picker
        migrate
        renderPicker={(selectedItem: string | undefined,  itemLabel: string | undefined) => {
          return (
            <Incubator.TextField
              preset="default"
              label="Location"
              value={selectedItem}
            />
          );
        }}
        showSearch
        searchPlaceholder={'Search locations'}
        searchStyle={{
          color: Colors.black,
          placeholderTextColor: Colors.grey40,
        }}
        value={location}
        onChange={(value) => {
          const newLoc = find(locations, (loc: Location) => loc.name === value);
          dispatch(updateLastUsed({id: newLoc.id, name: newLoc.name, lastUsed: Date.now()}))
          console.log("### UPDTATED", newLoc)
          onChangeLocation(value);
        }}
        onSearchChange={setQuery}
        topBarProps={{ title: 'Location' }}
        listProps={{
          data: searchResults,
          renderItem,
        }}
      />
      <View flex>
        <View right marginB-s2>
          <Button
            disabled={!location}
            size={Button.sizes.xSmall}
            label="Clear"
            onPress={() => onChangeLocation('')}
          />
        </View>
      </View>
    </View>
  );
};

const mapStateToProps = (state: any, ownProps: any) => ({
  locations: selectAll(state),
});

const connector = connect(mapStateToProps);

const ConnectedLocationPicker = connector(LocationPicker);

export default ConnectedLocationPicker;

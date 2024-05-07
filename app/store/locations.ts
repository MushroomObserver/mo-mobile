import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

export type Location = {
  id: number,
  name: string,
  lastUsed: number
}

const adapter = createEntityAdapter<Location>();

const slice = createSlice({
  name: 'locations',
  initialState: adapter.getInitialState(),
  reducers: {
    preloadLocations: (state, action) => {
      const locations = require('./location_primer.json');
      adapter.setMany(state, locations);
    },
    updateLastUsed: adapter.upsertOne
  },
});

const { actions, reducer } = slice;

export const { preloadLocations, updateLastUsed } = actions;

export const { selectAll, selectById, selectEntities, selectIds, selectTotal } =
  adapter.getSelectors(state => state.locations);

export default reducer;

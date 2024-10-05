// app/store/loadingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingState {
  isLoading: boolean;
}

const initialState: LoadingState = {
  isLoading: false,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('Reducer called: setLoading', action.payload);
      state.isLoading = action.payload;
    },
    setLoadingIfNotAlreadyLoading: (state) => {
      if (!state.isLoading) {
        state.isLoading = true;
      }
    },
  },
});

// Export the action and the reducer
export const { setLoading, setLoadingIfNotAlreadyLoading } = loadingSlice.actions;
export default loadingSlice.reducer;

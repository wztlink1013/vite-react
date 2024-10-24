import { createSlice } from '@reduxjs/toolkit';


export const userSlice = createSlice({
  name: 'user',
  initialState: {
    info: {},
  },
  reducers: {
    setInfo: (state, { payload }) => {
      state.info = payload;
    },
  },
});

export const { setInfo } = userSlice.actions;
export const selectInfo = (state: any) => state.user.info;
export default userSlice.reducer;

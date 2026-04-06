import { createSlice } from "@reduxjs/toolkit";

const adminProfileSlice = createSlice({
  name: "adminProfile",
  initialState: null,
  reducers: {
    setAdminProfile: (state, action) => action.payload,
  },
});

export const { setAdminProfile } = adminProfileSlice.actions;
export default adminProfileSlice.reducer;

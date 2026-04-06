import { createSlice } from "@reduxjs/toolkit";

const empProfileSlice = createSlice({
  name: "empProfile",
  initialState: "",
  reducers: {
    setEmpProfile: (state, action) => {
      return action.payload;
    },
  },
});

export const { setEmpProfile } = empProfileSlice.actions;
export default empProfileSlice.reducer;

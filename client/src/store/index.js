import { configureStore } from "@reduxjs/toolkit";
import nameReducer from "./nameSlice";

import adminProfileReducer from "./adminProfileSlice";
import EmpProfileReducer from "./empProfileSlice";

const store = configureStore({
  reducer: {
    name: nameReducer,
    adminProfile: adminProfileReducer,
    empProfile: EmpProfileReducer,
  },
});

export default store;

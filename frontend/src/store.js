import { configureStore } from '@reduxjs/toolkit';
import formReducer from './features/formSlice';
import chatReducer from './features/chatSlice';

export default configureStore({
  reducer: {
    form: formReducer,
    chat: chatReducer,
  },
});

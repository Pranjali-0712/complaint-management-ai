import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  complaint_number: '',
  complaint_date: '',
  customer_name: '',
  product_name: '',
  batch_number: '',
  manufacturing_date: '',
  complaint_description: '',
  complaint_category: '',
  severity: '',
  country: '',
  received_through: '',
  remarks: '',
  summary: '',
  risk_level: '',
  risk_reason: '',
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormData: (state, action) => {
      const next = action.payload || {};
      return {
        ...state,
        ...next,
        summary: next.summary ?? state.summary,
        risk_level: next.risk_level ?? state.risk_level,
        risk_reason: next.risk_reason ?? state.risk_reason,
      };
    },
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    resetForm: () => initialState,
  },
});

export const { setFormData, updateField, resetForm } = formSlice.actions;
export default formSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiService } from '../../services/api';
import type { Supplier } from '../../services/api';

interface SupplierState {
    suppliers: Supplier[];
    selectedSupplier: Supplier | null;
    loading: boolean;
    error: string | null;
}

const initialState: SupplierState = {
    suppliers: [],
    selectedSupplier: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchSuppliers = createAsyncThunk(
    'suppliers/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.getSuppliers();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
        }
    }
);

export const fetchSupplierDetails = createAsyncThunk(
    'suppliers/fetchDetails',
    async (supplierId: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/suppliers/${supplierId}/`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch supplier details');
        }
    }
);

export const createSupplier = createAsyncThunk(
    'suppliers/create',
    async (supplierData: Partial<Supplier>, { rejectWithValue }) => {
        try {
            const response = await api.post('/suppliers/', supplierData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create supplier');
        }
    }
);

export const updateSupplier = createAsyncThunk(
    'suppliers/update',
    async ({ id, data }: { id: number; data: Partial<Supplier> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/suppliers/${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update supplier');
        }
    }
);

export const deleteSupplier = createAsyncThunk(
    'suppliers/delete',
    async (supplierId: number, { rejectWithValue }) => {
        try {
            await api.delete(`/suppliers/${supplierId}/`);
            return supplierId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete supplier');
        }
    }
);

const supplierSlice = createSlice({
    name: 'suppliers',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedSupplier: (state, action) => {
            state.selectedSupplier = action.payload;
        },
        clearSelectedSupplier: (state) => {
            state.selectedSupplier = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Suppliers
            .addCase(fetchSuppliers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSuppliers.fulfilled, (state, action) => {
                state.loading = false;
                state.suppliers = action.payload;
            })
            .addCase(fetchSuppliers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Supplier Details
            .addCase(fetchSupplierDetails.fulfilled, (state, action) => {
                state.selectedSupplier = action.payload;
            })
            // Create Supplier
            .addCase(createSupplier.fulfilled, (state, action) => {
                state.suppliers.push(action.payload);
            })
            // Update Supplier
            .addCase(updateSupplier.fulfilled, (state, action) => {
                const index = state.suppliers.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.suppliers[index] = action.payload;
                }
                if (state.selectedSupplier?.id === action.payload.id) {
                    state.selectedSupplier = action.payload;
                }
            })
            // Delete Supplier
            .addCase(deleteSupplier.fulfilled, (state, action) => {
                state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
                if (state.selectedSupplier?.id === action.payload) {
                    state.selectedSupplier = null;
                }
            });
    },
});

export const { clearError, setSelectedSupplier, clearSelectedSupplier } = supplierSlice.actions;
export default supplierSlice.reducer;

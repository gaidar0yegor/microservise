import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiService } from '../../services/api';
import type { Stock, StockMovement } from '../../services/api';

interface StockState {
    stocks: Stock[];
    movements: StockMovement[];
    lowStockItems: Stock[];
    highStockItems: Stock[];
    dailySummary: any;
    weeklySummary: any;
    loading: boolean;
    error: string | null;
}

const initialState: StockState = {
    stocks: [],
    movements: [],
    lowStockItems: [],
    highStockItems: [],
    dailySummary: null,
    weeklySummary: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchStocks = createAsyncThunk(
    'stock/fetchStocks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.getStocks();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stocks');
        }
    }
);

export const fetchStockMovements = createAsyncThunk(
    'stock/fetchMovements',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock-movements/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock movements');
        }
    }
);

export const createStockMovement = createAsyncThunk(
    'stock/createMovement',
    async (movementData: Partial<StockMovement>, { rejectWithValue }) => {
        try {
            const response = await apiService.createStockMovement(movementData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create stock movement');
        }
    }
);

export const fetchDailySummary = createAsyncThunk(
    'stock/fetchDailySummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock-movements/daily_summary/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily summary');
        }
    }
);

export const fetchWeeklySummary = createAsyncThunk(
    'stock/fetchWeeklySummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock-movements/weekly_summary/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch weekly summary');
        }
    }
);

const stockSlice = createSlice({
    name: 'stock',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Stocks
            .addCase(fetchStocks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStocks.fulfilled, (state, action) => {
                state.loading = false;
                state.stocks = action.payload;
                state.lowStockItems = action.payload.filter(
                    stock => stock.quantity <= stock.minimum_threshold
                );
                state.highStockItems = action.payload.filter(
                    stock => stock.quantity >= stock.maximum_threshold
                );
            })
            .addCase(fetchStocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Stock Movements
            .addCase(fetchStockMovements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStockMovements.fulfilled, (state, action) => {
                state.loading = false;
                state.movements = action.payload;
            })
            .addCase(fetchStockMovements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Stock Movement
            .addCase(createStockMovement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createStockMovement.fulfilled, (state, action) => {
                state.loading = false;
                state.movements = [...state.movements, action.payload];
            })
            .addCase(createStockMovement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Daily Summary
            .addCase(fetchDailySummary.fulfilled, (state, action) => {
                state.dailySummary = action.payload;
            })
            // Fetch Weekly Summary
            .addCase(fetchWeeklySummary.fulfilled, (state, action) => {
                state.weeklySummary = action.payload;
            });
    },
});

export const { clearError } = stockSlice.actions;
export default stockSlice.reducer;

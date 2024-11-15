import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiService } from '../../services/api';
import type { Product } from '../../services/api';

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.getProducts();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

export const fetchProductDetails = createAsyncThunk(
    'products/fetchDetails',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/products/${productId}/`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
        }
    }
);

export const createProduct = createAsyncThunk(
    'products/create',
    async (productData: Partial<Product>, { rejectWithValue }) => {
        try {
            const response = await api.post('/products/', productData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create product');
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, data }: { id: number; data: Partial<Product> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/products/${id}/`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update product');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (productId: number, { rejectWithValue }) => {
        try {
            await api.delete(`/products/${productId}/`);
            return productId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
        }
    }
);

export const fetchProductStock = createAsyncThunk(
    'products/fetchStock',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/products/${productId}/current_stock/`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product stock');
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        updateProductStock: (state, action) => {
            const { productId, quantity } = action.payload;
            const product = state.products.find(p => p.id === productId);
            if (product) {
                product.current_stock = quantity;
            }
            if (state.selectedProduct?.id === productId) {
                state.selectedProduct.current_stock = quantity;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Product Details
            .addCase(fetchProductDetails.fulfilled, (state, action) => {
                state.selectedProduct = action.payload;
            })
            // Create Product
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
            })
            // Update Product
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                if (state.selectedProduct?.id === action.payload.id) {
                    state.selectedProduct = action.payload;
                }
            })
            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.id !== action.payload);
                if (state.selectedProduct?.id === action.payload) {
                    state.selectedProduct = null;
                }
            })
            // Fetch Product Stock
            .addCase(fetchProductStock.fulfilled, (state, action) => {
                if (state.selectedProduct) {
                    state.selectedProduct.current_stock = action.payload.quantity;
                }
                const product = state.products.find(p => p.id === action.payload.product);
                if (product) {
                    product.current_stock = action.payload.quantity;
                }
            });
    },
});

export const { 
    clearError, 
    setSelectedProduct, 
    clearSelectedProduct,
    updateProductStock 
} = productSlice.actions;

export default productSlice.reducer;

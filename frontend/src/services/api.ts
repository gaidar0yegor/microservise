import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API endpoints
export const endpoints = {
    // Auth
    login: '/auth/login/',
    logout: '/auth/logout/',
    
    // Suppliers
    suppliers: '/suppliers/',
    supplierDetail: (id: number) => `/suppliers/${id}/`,
    supplierProducts: (id: number) => `/suppliers/${id}/products/`,
    
    // Products
    products: '/products/',
    productDetail: (id: number) => `/products/${id}/`,
    productStock: (id: number) => `/products/${id}/current_stock/`,
    productHistory: (id: number) => `/products/${id}/stock_history/`,
    
    // Stock
    stocks: '/stocks/',
    stockDetail: (id: number) => `/stocks/${id}/`,
    lowStock: '/stocks/low_stock/',
    highStock: '/stocks/high_stock/',
    
    // Stock Movements
    stockMovements: '/stock-movements/',
    movementDetail: (id: number) => `/stock-movements/${id}/`,
    dailySummary: '/stock-movements/daily_summary/',
    weeklySummary: '/stock-movements/weekly_summary/',
    
    // Upload History
    uploadHistory: '/upload-history/',
    failedUploads: '/upload-history/failed_uploads/',
    pendingUploads: '/upload-history/pending_uploads/',
    
    // Notifications
    notifications: '/notifications/',
    unreadNotifications: '/notifications/unread/',
    markNotificationRead: (id: number) => `/notifications/${id}/mark_as_read/`,
    markAllNotificationsRead: '/notifications/mark_all_as_read/',
};

// Type definitions
export interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    supplier: number;
    supplier_name: string;
    unit_price: number;
    created_at: string;
    updated_at: string;
    current_stock: number;
}

export interface Stock {
    id: number;
    product: number;
    product_name: string;
    quantity: number;
    location: string;
    last_checked: string;
    minimum_threshold: number;
    maximum_threshold: number;
}

export interface StockMovement {
    id: number;
    product: number;
    product_name: string;
    movement_type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    reference_number: string;
    timestamp: string;
    performed_by: number;
    performed_by_username: string;
    notes: string;
}

export interface Notification {
    id: number;
    type: string;
    message: string;
    created_at: string;
    read: boolean;
    user: number;
}

// API functions
export const apiService = {
    // Auth
    login: async (username: string, password: string) => {
        const response = await api.post(endpoints.login, { username, password });
        return response.data;
    },
    
    // Suppliers
    getSuppliers: async () => {
        const response = await api.get(endpoints.suppliers);
        return response.data;
    },
    
    // Products
    getProducts: async () => {
        const response = await api.get(endpoints.products);
        return response.data;
    },
    
    // Stock
    getStocks: async () => {
        const response = await api.get(endpoints.stocks);
        return response.data;
    },
    
    // Stock Movements
    createStockMovement: async (data: Partial<StockMovement>) => {
        const response = await api.post(endpoints.stockMovements, data);
        return response.data;
    },
    
    // Notifications
    getUnreadNotifications: async () => {
        const response = await api.get(endpoints.unreadNotifications);
        return response.data;
    },

    markNotificationRead: async (id: number) => {
        const response = await api.post(endpoints.markNotificationRead(id));
        return response.data;
    },

    markAllNotificationsRead: async () => {
        const response = await api.post(endpoints.markAllNotificationsRead);
        return response.data;
    },
};

export default api;

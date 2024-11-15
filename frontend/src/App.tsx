import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import theme from './theme';

// Layout components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Auth pages
import { Login } from './pages/auth';

// Dashboard pages
import { Dashboard } from './pages/dashboard';

// Stock Management pages
import { StockList, StockMovements, StockAdjustment } from './pages/stock';

// Product pages
import { ProductList, ProductDetails, AddProduct } from './pages/products';

// Supplier pages
import { SupplierList, SupplierDetails, AddSupplier } from './pages/suppliers';

// Reports pages
import { Reports } from './pages/reports';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route
                path="dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* Stock Management */}
              <Route
                path="stock"
                element={
                  <PrivateRoute>
                    <StockList />
                  </PrivateRoute>
                }
              />
              <Route
                path="stock/movements"
                element={
                  <PrivateRoute>
                    <StockMovements />
                  </PrivateRoute>
                }
              />
              <Route
                path="stock/adjust"
                element={
                  <PrivateRoute>
                    <StockAdjustment />
                  </PrivateRoute>
                }
              />

              {/* Products */}
              <Route
                path="products"
                element={
                  <PrivateRoute>
                    <ProductList />
                  </PrivateRoute>
                }
              />
              <Route
                path="products/add"
                element={
                  <PrivateRoute>
                    <AddProduct />
                  </PrivateRoute>
                }
              />
              <Route
                path="products/:id"
                element={
                  <PrivateRoute>
                    <ProductDetails />
                  </PrivateRoute>
                }
              />

              {/* Suppliers */}
              <Route
                path="suppliers"
                element={
                  <PrivateRoute>
                    <SupplierList />
                  </PrivateRoute>
                }
              />
              <Route
                path="suppliers/add"
                element={
                  <PrivateRoute>
                    <AddSupplier />
                  </PrivateRoute>
                }
              />
              <Route
                path="suppliers/:id"
                element={
                  <PrivateRoute>
                    <SupplierDetails />
                  </PrivateRoute>
                }
              />

              {/* Reports */}
              <Route
                path="reports"
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;

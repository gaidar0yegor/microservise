import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { RootState } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { createStockMovement } from '../../store/slices/stockSlice';
import type { StockMovement } from '../../services/api';

const StockAdjustment: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialProductId = queryParams.get('productId');

  const { products } = useSelector((state: RootState) => state.products);
  const { loading, error } = useSelector((state: RootState) => state.stock);

  const [formData, setFormData] = useState<Partial<StockMovement>>({
    product: initialProductId ? parseInt(initialProductId) : undefined,
    movement_type: 'IN',
    quantity: 0,
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchProducts() as any);
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createStockMovement(formData) as any);
      navigate('/stock');
    } catch (err) {
      // Error handling is managed by the Redux slice
    }
  };

  if (!products.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Stock Adjustment
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  name="product"
                  value={formData.product || ''}
                  onChange={handleChange}
                  required
                  label="Product"
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Movement Type</InputLabel>
                <Select
                  name="movement_type"
                  value={formData.movement_type}
                  onChange={handleChange}
                  required
                  label="Movement Type"
                >
                  <MenuItem value="IN">Stock In</MenuItem>
                  <MenuItem value="OUT">Stock Out</MenuItem>
                  <MenuItem value="ADJUST">Adjustment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                required
                placeholder="e.g., PO-12345"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Add any additional notes here..."
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/stock')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Adjustment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default StockAdjustment;

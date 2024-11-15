import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
} from '@mui/material';
import { RootState } from '../../store';
import { createProduct } from '../../store/slices/productSlice';
import { fetchSuppliers } from '../../store/slices/supplierSlice';
import type { Product } from '../../services/api';

const AddProduct: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { suppliers } = useSelector((state: RootState) => state.suppliers);
  const { loading, error } = useSelector((state: RootState) => state.products);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    sku: '',
    supplier: undefined,
    unit_price: 0,
  });

  useEffect(() => {
    dispatch(fetchSuppliers() as any);
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
      await dispatch(createProduct(formData) as any);
      navigate('/products');
    } catch (err) {
      // Error handling is managed by the Redux slice
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Product
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
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                helperText="Unique product identifier"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  name="supplier"
                  value={formData.supplier || ''}
                  onChange={handleChange}
                  label="Supplier"
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price"
                name="unit_price"
                type="number"
                value={formData.unit_price}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/products')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddProduct;

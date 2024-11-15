import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { RootState } from '../../store';
import { createSupplier } from '../../store/slices/supplierSlice';
import type { Supplier } from '../../services/api';

const AddSupplier: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.suppliers);

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createSupplier(formData) as any);
      navigate('/suppliers');
    } catch (err) {
      // Error handling is managed by the Redux slice
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Supplier
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
                label="Supplier Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                helperText="Enter the company or supplier name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                helperText="Primary contact email address"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                helperText="Contact phone number"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={4}
                required
                helperText="Complete business address"
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/suppliers')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Supplier'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddSupplier;

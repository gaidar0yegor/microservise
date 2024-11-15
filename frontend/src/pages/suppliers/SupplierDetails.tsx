import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchSupplierDetails } from '../../store/slices/supplierSlice';

const SupplierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedSupplier, loading } = useSelector((state: RootState) => state.suppliers);

  useEffect(() => {
    if (id) {
      dispatch(fetchSupplierDetails(parseInt(id)) as any);
    }
  }, [dispatch, id]);

  if (loading || !selectedSupplier) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/suppliers')}
        >
          Back to Suppliers
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Supplier Details
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/suppliers/${id}/edit`)}
        >
          Edit Supplier
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography color="textSecondary">Name</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedSupplier.name}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography color="textSecondary">Email</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedSupplier.email}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography color="textSecondary">Phone</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedSupplier.phone}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography color="textSecondary">Address</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedSupplier.address}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography color="textSecondary">Created At</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>
                    {new Date(selectedSupplier.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Total Products</Typography>
                  <Typography variant="h4">
                    {selectedSupplier.products?.length || 0}
                  </Typography>
                </Grid>
                {/* Add more summary statistics here */}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Products</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSupplier.products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">
                        ${product.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">{product.current_stock}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.current_stock > 0 ? 'In Stock' : 'Out of Stock'}
                          color={product.current_stock > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierDetails;

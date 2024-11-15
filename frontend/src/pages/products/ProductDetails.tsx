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
  Chip,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchProductDetails } from '../../store/slices/productSlice';
import { fetchProductStock } from '../../store/slices/stockSlice';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedProduct, loading } = useSelector((state: RootState) => state.products);
  const { movements } = useSelector((state: RootState) => state.stock);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(parseInt(id)) as any);
      dispatch(fetchProductStock(parseInt(id)) as any);
    }
  }, [dispatch, id]);

  if (loading || !selectedProduct) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const getStockStatus = () => {
    if (selectedProduct.current_stock <= 0) {
      return <Chip label="Out of Stock" color="error" />;
    }
    if (selectedProduct.current_stock <= 10) {
      return <Chip label="Low Stock" color="warning" />;
    }
    return <Chip label="In Stock" color="success" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Product Details
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/products/${id}/edit`)}
        >
          Edit Product
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
                  <Typography>{selectedProduct.name}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography color="textSecondary">SKU</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedProduct.sku}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography color="textSecondary">Supplier</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{selectedProduct.supplier_name}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography color="textSecondary">Unit Price</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>${selectedProduct.unit_price.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stock Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Current Stock</Typography>
                  <Typography variant="h4">{selectedProduct.current_stock}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Status</Typography>
                  {getStockStatus()}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography>{selectedProduct.description}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Stock Movement History</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Performed By</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements
                    .filter(movement => movement.product === selectedProduct.id)
                    .map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {new Date(movement.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={movement.movement_type}
                            color={
                              movement.movement_type === 'IN'
                                ? 'success'
                                : movement.movement_type === 'OUT'
                                ? 'error'
                                : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {movement.movement_type === 'OUT' ? '-' : ''}
                          {movement.quantity}
                        </TableCell>
                        <TableCell>{movement.reference_number}</TableCell>
                        <TableCell>{movement.performed_by_username}</TableCell>
                        <TableCell>{movement.notes}</TableCell>
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

export default ProductDetails;

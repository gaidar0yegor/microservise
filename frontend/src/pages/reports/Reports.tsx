import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { RootState } from '../../store';
import { fetchDailySummary, fetchWeeklySummary } from '../../store/slices/stockSlice';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchSuppliers } from '../../store/slices/supplierSlice';

const Reports: React.FC = () => {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState('week');
  
  const { dailySummary, weeklySummary } = useSelector((state: RootState) => state.stock);
  const { products } = useSelector((state: RootState) => state.products);
  const { suppliers } = useSelector((state: RootState) => state.suppliers);

  useEffect(() => {
    dispatch(fetchDailySummary() as any);
    dispatch(fetchWeeklySummary() as any);
    dispatch(fetchProducts() as any);
    dispatch(fetchSuppliers() as any);
  }, [dispatch]);

  const lowStockProducts = products.filter(product => 
    product.current_stock <= 10
  );

  const stockMovementData = timeRange === 'day' ? dailySummary : weeklySummary;

  const stockValueBySupplier = suppliers.map(supplier => ({
    name: supplier.name,
    value: products
      .filter(product => product.supplier === supplier.id)
      .reduce((total, product) => total + (product.unit_price * product.current_stock), 0),
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">{products.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Suppliers
              </Typography>
              <Typography variant="h4">{suppliers.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4">{lowStockProducts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Stock Value
              </Typography>
              <Typography variant="h4">
                ${products.reduce((total, product) => 
                  total + (product.unit_price * product.current_stock), 0
                ).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stock Movement Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Stock Movements</Typography>
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="day">Daily</MenuItem>
              <MenuItem value="week">Weekly</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockMovementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="in" name="Stock In" fill="#4caf50" />
            <Bar dataKey="out" name="Stock Out" fill="#f44336" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Stock Value by Supplier */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Stock Value by Supplier
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockValueBySupplier}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2196f3" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Low Stock Alert Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Low Stock Alerts
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Minimum Threshold</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.supplier_name}</TableCell>
                  <TableCell align="right">{product.current_stock}</TableCell>
                  <TableCell align="right">10</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Reports;

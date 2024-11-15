import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchStocks } from '../../store/slices/stockSlice';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchSuppliers } from '../../store/slices/supplierSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { stocks, loading: stockLoading } = useSelector((state: RootState) => state.stock);
  const { products } = useSelector((state: RootState) => state.products);
  const { suppliers } = useSelector((state: RootState) => state.suppliers);

  useEffect(() => {
    dispatch(fetchStocks() as any);
    dispatch(fetchProducts() as any);
    dispatch(fetchSuppliers() as any);
  }, [dispatch]);

  const lowStockCount = stocks.filter(stock => 
    stock.quantity <= stock.minimum_threshold
  ).length;

  const highStockCount = stocks.filter(stock => 
    stock.quantity >= stock.maximum_threshold
  ).length;

  const summaryCards = [
    {
      title: 'Total Products',
      value: products.length,
      icon: <TrendingUpIcon color="primary" />,
    },
    {
      title: 'Total Suppliers',
      value: suppliers.length,
      icon: <TrendingUpIcon color="primary" />,
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      icon: <TrendingDownIcon color="error" />,
    },
    {
      title: 'High Stock Items',
      value: highStockCount,
      icon: <WarningIcon color="warning" />,
    },
  ];

  const handleRefresh = () => {
    dispatch(fetchStocks() as any);
    dispatch(fetchProducts() as any);
    dispatch(fetchSuppliers() as any);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} disabled={stockLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardHeader
                action={card.icon}
                title={card.title}
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent>
                <Typography variant="h4" component="div">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alerts
            </Typography>
            {stocks
              .filter(stock => stock.quantity <= stock.minimum_threshold)
              .slice(0, 5)
              .map((stock) => (
                <Box
                  key={stock.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography>{stock.product_name}</Typography>
                  <Typography color="error">
                    Quantity: {stock.quantity}
                  </Typography>
                </Box>
              ))}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              High Stock Alerts
            </Typography>
            {stocks
              .filter(stock => stock.quantity >= stock.maximum_threshold)
              .slice(0, 5)
              .map((stock) => (
                <Box
                  key={stock.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography>{stock.product_name}</Typography>
                  <Typography color="warning.main">
                    Quantity: {stock.quantity}
                  </Typography>
                </Box>
              ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

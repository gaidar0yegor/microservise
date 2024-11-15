import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { fetchStocks } from '../../store/slices/stockSlice';
import type { Stock } from '../../services/api';

const StockList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stocks, loading } = useSelector((state: RootState) => state.stock);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchStocks() as any);
  }, [dispatch]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const getStockStatus = (stock: Stock) => {
    if (stock.quantity <= stock.minimum_threshold) {
      return <Chip label="Low Stock" color="error" size="small" />;
    }
    if (stock.quantity >= stock.maximum_threshold) {
      return <Chip label="Overstocked" color="warning" size="small" />;
    }
    return <Chip label="Normal" color="success" size="small" />;
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedStocks = filteredStocks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Stock Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/stock/adjust')}
        >
          Adjust Stock
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by product name or location..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Checked</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>{stock.product_name}</TableCell>
                  <TableCell>{stock.location}</TableCell>
                  <TableCell align="right">
                    {stock.quantity}
                    {stock.quantity <= stock.minimum_threshold && (
                      <WarningIcon
                        color="error"
                        fontSize="small"
                        sx={{ ml: 1, verticalAlign: 'middle' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{getStockStatus(stock)}</TableCell>
                  <TableCell>
                    {new Date(stock.last_checked).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => navigate(`/stock/adjust?productId=${stock.product}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStocks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default StockList;

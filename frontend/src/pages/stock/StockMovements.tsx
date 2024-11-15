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
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchStockMovements } from '../../store/slices/stockSlice';
import type { StockMovement } from '../../services/api';

const movementTypeColors = {
  IN: 'success',
  OUT: 'error',
  ADJUST: 'warning',
} as const;

const StockMovements: React.FC = () => {
  const dispatch = useDispatch();
  const { movements, loading } = useSelector((state: RootState) => state.stock);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL');

  useEffect(() => {
    dispatch(fetchStockMovements() as any);
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

  const handleMovementTypeFilter = (event: React.ChangeEvent<{ value: unknown }>) => {
    setMovementTypeFilter(event.target.value as string);
    setPage(0);
  };

  const getMovementTypeLabel = (type: StockMovement['movement_type']) => {
    const labels = {
      IN: 'Stock In',
      OUT: 'Stock Out',
      ADJUST: 'Adjustment',
    };
    return labels[type];
  };

  const filteredMovements = movements
    .filter((movement) => {
      const matchesSearch =
        movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reference_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType =
        movementTypeFilter === 'ALL' || movement.movement_type === movementTypeFilter;
      
      return matchesSearch && matchesType;
    });

  const paginatedMovements = filteredMovements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Stock Movements
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <TextField
            sx={{ flex: 1 }}
            variant="outlined"
            placeholder="Search by product or reference number..."
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
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Movement Type</InputLabel>
            <Select
              value={movementTypeFilter}
              onChange={handleMovementTypeFilter}
              label="Movement Type"
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="IN">Stock In</MenuItem>
              <MenuItem value="OUT">Stock Out</MenuItem>
              <MenuItem value="ADJUST">Adjustment</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Performed By</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {new Date(movement.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{movement.product_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getMovementTypeLabel(movement.movement_type)}
                      color={movementTypeColors[movement.movement_type]}
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredMovements.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default StockMovements;

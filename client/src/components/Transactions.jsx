import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';

const categories = [
  'Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Other'
];

const Transactions = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    type: 'credit',
    accountId: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [filters, setFilters] = useState({ accountId: '', type: '', from: '', to: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [accRes, txRes] = await Promise.all([
          axios.get('/accounts'),
          axios.get('/transactions'),
        ]);
        setAccounts(accRes.data);
        setTransactions(txRes.data);
      } catch (e) {
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      amount: '',
      type: 'credit',
      accountId: accounts[0]?._id || '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const txData = {
        accountId: form.accountId,
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.type === 'expense' ? form.category : undefined,
        description: form.description,
        date: form.date,
      };
      const res = await axios.post('/transactions', txData);
      setTransactions((prev) => [res.data, ...prev]);
      handleClose();
    } catch (e) {
      setError(e.response.data.message);
    } finally {
      setAdding(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilter = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.type) params.append('type', filters.type);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      const res = await axios.get(`/transactions?${params.toString()}`);
      setTransactions(res.data);
    } catch (e) {
      setError(e.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          Transactions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Add Transaction
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Account</InputLabel>
          <Select
            label="Account"
            name="accountId"
            value={filters.accountId}
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            {accounts.map((acc) => (
              <MenuItem key={acc._id} value={acc._id}>{acc.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="From"
          name="from"
          type="date"
          size="small"
          value={filters.from}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          name="to"
          type="date"
          size="small"
          value={filters.to}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" size="small" onClick={handleApplyFilter}>
          Apply
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List sx={{ width: '100%' }}>
          {transactions.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
              No transactions found.
            </Typography>
          )}
          {transactions.map((tx, idx) => (
            <React.Fragment key={tx._id}>
              <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <span style={{ fontWeight: 700, color: tx.type === 'credit' ? '#00c853' : '#ff5252' }}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </span>
                      <span style={{ marginLeft: 12, fontWeight: 600 }}>
                        {accounts.find(a => a._id === tx.accountId)?.name || 'Account'}
                      </span>
                      {tx.type === 'expense' && tx.category && (
                        <span style={{ marginLeft: 12, color: '#5563f0', fontWeight: 500 }}>
                          {tx.category}
                        </span>
                      )}
                    </Box>
                    <span style={{ color: '#b0b8c1', fontSize: 13, minWidth: 90, textAlign: 'right' }}>
                      {new Date(tx.date).toLocaleDateString()}
                    </span>
                  </Box>
                  <Box sx={{ color: 'text.secondary', fontSize: 15, mt: 0.5 }}>{tx.description}</Box>
                </Box>
              </ListItem>
              {idx !== transactions.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Add Transaction</DialogTitle>
        <form onSubmit={handleAddTransaction}>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Account</InputLabel>
              <Select
                label="Account"
                name="accountId"
                value={form.accountId || accounts[0]?._id || ''}
                onChange={handleChange}
                required
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc._id} value={acc._id}>{acc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <MenuItem value="credit">Credit (Inflow)</MenuItem>
                <MenuItem value="expense">Expense (Outflow)</MenuItem>
              </Select>
            </FormControl>
            {form.type === 'expense' && (
              <TextField
                select
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">Cancel</Button>
            <Button type="submit" variant="contained" disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Transactions; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import AccountTransactions from './AccountTransactions';

const accountTypes = [
  { value: 'Bank', label: 'Bank' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Wallet', label: 'Wallet' },
  { value: 'Other', label: 'Other' },
];

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Bank', amount: '' });
  const [adding, setAdding] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ _id: '', name: '', type: 'Bank', amount: '' });
  const [editing, setEditing] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalTransactions, setModalTransactions] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/accounts');
        console.log("something",res.data)
        setAccounts(res.data);
      } catch (e) {
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ name: '', type: 'Bank', amount: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const res = await axios.post('/accounts', { name: form.name, type: form.type, amount: form.amount });
      setAccounts((prev) => [...prev, res.data]);
      handleClose();
    } catch (e) {
      setError(e.response.data.message);
    } finally {
      setAdding(false);
    }
  };

  const netWorth = accounts.reduce((sum, acc) => sum + (parseFloat(acc.amount) || 0), 0);

  const handleEditOpen = (acc) => {
    setEditForm({ _id: acc._id, name: acc.name, type: acc.type, amount: acc.amount });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditForm({ _id: '', name: '', type: 'Bank', amount: '' });
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    setError(null);
    try {
      const res = await axios.put(`/accounts/${editForm._id}`, {
        name: editForm.name,
        type: editForm.type,
        amount: editForm.amount,
      });
      setAccounts((prev) => prev.map((a) => (a._id === editForm._id ? res.data : a)));
      handleEditClose();
    } catch {
      setError('Failed to update account');
    } finally {
      setEditing(false);
    }
  };

  const handleTxModalOpen = async (acc) => {
    setSelectedAccount(acc);
    setTxModalOpen(true);
    setModalLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('accountId', acc._id);
      const res = await axios.get(`/transactions?${params.toString()}`);
      setModalTransactions(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load transactions');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalFilter = async (filters) => {
    if (!selectedAccount) return;
    
    setModalLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('accountId', selectedAccount._id);
      if (filters.type) params.append('type', filters.type);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      
      const res = await axios.get(`/transactions?${params.toString()}`);
      setModalTransactions(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load transactions');
    } finally {
      setModalLoading(false);
    }
  };

  const handleTxModalClose = () => {
    setTxModalOpen(false);
    setSelectedAccount(null);
    setModalTransactions([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: 'primary.main', color: '#fff', borderRadius: 3, boxShadow: 3, minWidth: 150, textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="rgba(255,255,255,0.8)">
                    Net Worth
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    ₹{netWorth.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Accounts
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
              Add Account
            </Button>
          </Box>
          <Grid container spacing={3}>
            {accounts.map((acc) => (
              <Grid item xs={12} sm={6} md={4} key={acc._id}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, minWidth: 360, maxWidth: 420, mx: 'auto' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {acc.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleEditOpen(acc)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {acc.type}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 2 }}>
                      ₹{(acc.amount || 0).toLocaleString()}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Button variant="outlined" onClick={() => handleTxModalOpen(acc)}>
                        Show Transactions
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Add Account</DialogTitle>
        <form onSubmit={handleAddAccount}>
          <DialogContent>
            <TextField
              label="Account Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              {accountTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Initial Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              inputProps={{ min: 0 }}
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
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Account</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <TextField
              label="Account Name"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Type"
              name="type"
              value={editForm.type}
              onChange={handleEditChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              {accountTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={editForm.amount}
              onChange={handleEditChange}
              fullWidth
              sx={{ mb: 2 }}
              inputProps={{ min: 0 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose} color="secondary">Cancel</Button>
            <Button type="submit" variant="contained" disabled={editing}>
              {editing ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <AccountTransactions
        open={txModalOpen}
        onClose={handleTxModalClose}
        account={selectedAccount}
        transactions={modalTransactions}
        loading={modalLoading}
        onFilter={handleModalFilter}
      />
    </Box>
  );
};

export default Accounts; 
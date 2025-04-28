import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
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
  Card,
  CardContent,
  IconButton,
  Collapse
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const categories = [
  'Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Other'
];

const accountTypes = [
  { value: 'Bank', label: 'Bank' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Wallet', label: 'Wallet' },
  { value: 'Other', label: 'Other' },
];

const Dashboard = () => {
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
  const [openAccount, setOpenAccount] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', type: 'Bank' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [accRes, txRes] = await Promise.all([
          axios.get('/accounts'),
          axios.get('/transactions'),
        ]);
        console.log("accRes",accRes)
        setAccounts(accRes.data);
        setTransactions(txRes.data);
        // Set default account for form
        setForm((prev) => ({ ...prev, accountId: accRes.data[0]?._id || '' }));
      } catch (e) {
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Net worth
  const netWorth = accounts.reduce((sum, acc) => sum + (parseFloat(acc.amount) || 0), 0);

  // Expenses only
  const expenses = transactions.filter((tx) => tx.type === 'expense');
  const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  // Expenses by category
  const categoryData = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});
  const pieData = Object.keys(categoryData).map((key, i) => ({
    id: key,
    label: key,
    value: categoryData[key],
    color: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"][i % 6]
  }));

  // Expenses by month
  const monthlyData = expenses.reduce((acc, tx) => {
    const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + tx.amount;
    return acc;
  }, {});
  const barData = Object.keys(monthlyData).map((month) => ({
    month,
    Expenses: monthlyData[month],
  }));

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
      await axios.post('/transactions', txData);
      // Refresh dashboard data
      const [accRes, txRes] = await Promise.all([
        axios.get('/accounts'),
        axios.get('/transactions'),
      ]);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
      handleClose();
    } catch (e) {
      setError(e.response.data.message);
    } finally {
      setAdding(false);
    }
  };

  const handleCloseAccount = () => {
    setOpenAccount(false);
    setAccountForm({ name: '', type: 'Bank' });
  };
  const handleAccountChange = (e) => {
    setAccountForm({ ...accountForm, [e.target.name]: e.target.value });
  };
  const handleAddAccount = async (e) => {
    e.preventDefault();
    setAddingAccount(true);
    setError(null);
    try {
      await axios.post('/accounts', accountForm);
      // Refresh dashboard data
      const [accRes, txRes] = await Promise.all([
        axios.get('/accounts'),
        axios.get('/transactions'),
      ]);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
      handleCloseAccount();
    } catch (e) {
      setError(e.response.data.message);
    } finally {
      setAddingAccount(false);
    }
  };

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );

  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(categoryData),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };
  const monthlyChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.values(monthlyData),
        backgroundColor: '#36A2EB'
      }
    ]
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Add Transaction
          </Button>
          {accounts.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please add an account before creating a transaction.
            </Alert>
          )}
        </Box>
      </Box>
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
      <Dialog open={openAccount} onClose={handleCloseAccount} maxWidth="xs" fullWidth>
        <DialogTitle>Add Account</DialogTitle>
        <form onSubmit={handleAddAccount}>
          <DialogContent>
            <TextField
              label="Account Name"
              name="name"
              value={accountForm.name}
              onChange={handleAccountChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Type"
              name="type"
              value={accountForm.type}
              onChange={handleAccountChange}
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAccount} color="secondary">Cancel</Button>
            <Button type="submit" variant="contained" disabled={addingAccount}>
              {addingAccount ? 'Adding...' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Grid container spacing={4} alignItems="flex-start">
        {/* Accounts Overview */}
        <Grid item xs={12} md={5} lg={5}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 5, flexWrap: 'wrap' }}>
            {/* Net Worth Circle */}
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
            {/* Account Cards Row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {accounts.map((acc) => (
                <Box
                  key={acc._id}
                  sx={{
                    minWidth: 120,
                    px: 3,
                    py: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mb: 0.5 }}>
                    {acc.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {acc.type}
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    ₹{(acc.amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          {/* Expenses & Charts */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                Expenses
              </Typography>
            </Box>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: 'background.paper', boxShadow: 2, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2" fontWeight={700}>
                      Total Expenses
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="error.main" sx={{ textAlign: 'center', mt: 2 }}>
                    ₹{totalExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <span title="Total of all expense transactions">Total of all expense transactions</span>
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: 'background.paper', boxShadow: 2, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Pie data={categoryChartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Expenses by Category' } } }} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ borderRadius: 3, p: 3, bgcolor: 'background.paper', boxShadow: 2, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Monthly Expenses' } } }} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        {/* Recent Transactions */}
        <Grid item xs={12} md={7} lg={7}>
          <Box sx={{ mb: 4, width: '100%', p: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Recent Transactions
            </Typography>
            {transactions.length === 0 ? (
              <Typography color="text.secondary">No transactions.</Typography>
            ) : (
              transactions.map((tx) => (
                <Box key={tx._id} sx={{ mb: 1, p: 1, borderRadius: 2, bgcolor: 'background.default', boxShadow: 1 }}>
                  <Typography variant="body2" fontWeight={700} color={tx.type === 'credit' ? 'success.main' : 'error.main'}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()} — {tx.category || tx.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(tx.date).toLocaleDateString()} | {tx.description}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
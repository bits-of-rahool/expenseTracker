import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Dashboard from './components/Dashboard.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Accounts from './components/Accounts.jsx';
import Transactions from './components/Transactions.jsx';
import Settings from './components/Settings.jsx';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5563f0', // Modern blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#00bfae', // Teal accent
    },
    background: {
      default: '#181c23', // Deep dark background
      paper: '#23283a',  // Card background
    },
    text: {
      primary: '#fff',
      secondary: '#b0b8c1',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: 'Nunito, Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 800,
    },
    h6: {
      fontWeight: 700,
    },
    body1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          background: 'linear-gradient(90deg, #23283a 0%, #5563f0 100%)',
          color: '#fff',
          boxShadow: '0 2px 12px 0 rgba(85,99,240,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px 0 rgba(85,99,240,0.06)',
          borderRadius: 18,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 12,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.10)',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(255,255,255,0.12)',
          },
        },
        input: {
          color: '#fff',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#b0b8c1',
          '&.Mui-focused': {
            color: '#5563f0',
          },
        },
      },
    },
  },
});

// Setup axios defaults
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5001/api';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function AppContent() {
  const location = useLocation();
  const hideNavAndSidebar = location.pathname === '/login' || location.pathname === '/register';
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!hideNavAndSidebar && <Sidebar />}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {!hideNavAndSidebar && <Navbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

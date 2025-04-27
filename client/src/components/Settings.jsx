import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwSuccess, setPwSuccess] = useState(null);
  const [pwError, setPwError] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const userObj = JSON.parse(localStorage.getItem('user'));
        const userId = userObj?.id;
        if (!userId) throw new Error('User ID not found');
        const res = await axios.get(`/users/${userId}`);
        setForm({ name: res.data.name, email: res.data.email });
      } catch (error) {
        setError(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      const userObj = JSON.parse(localStorage.getItem('user'));
      const userId = userObj?.id;
      if (!userId) throw new Error('User ID not found');
      await axios.put(`/users/${userId}`, form);
      setSuccess('Profile updated successfully!');
      const updatedUser = { ...userObj, ...form };

      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      setError(e.response.data.message);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess(null);
    setPwError(null);
    setPwLoading(true);
    try {
      const userObj = JSON.parse(localStorage.getItem('user'));
      const userId = userObj?.id;
      if (!userId) throw new Error('User ID not found');
      await axios.put(`/users/${userId}/password`, pwForm);
      setPwSuccess('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setPwError(error.response.data.message);
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Settings</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Button type="submit" variant="contained" fullWidth sx={{ mb: 2 }}>
            Update Profile
          </Button>
        </form>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Change Password</Typography>
          <form onSubmit={handlePwSubmit}>
            <TextField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
            {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}
            <Button type="submit" variant="outlined" fullWidth disabled={pwLoading}>
              {pwLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings; 
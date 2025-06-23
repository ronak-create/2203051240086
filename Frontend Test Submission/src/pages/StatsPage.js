// src/pages/StatsPage.jsx

import { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Card, CardContent, Divider
} from '@mui/material';
import axios from 'axios';

export default function StatsPage() {
  const [code, setCode] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!code.trim()) return;
    try {
      const res = await axios.get(`http://localhost:5000/shorturls/${code.trim()}`);
      setData(res.data);
      setError('');
    } catch (err) {
      setError('Shortcode not found or expired');
      setData(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Statistics
      </Typography>

      <TextField
        fullWidth
        label="Enter Shortcode"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={fetchStats}>Get Stats</Button>

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      {data && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6">🔗 Original URL</Typography>
            <Typography>{data.originalUrl}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>📉 Shortcode</Typography>
            <Typography>{code}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>📊 Total Clicks</Typography>
            <Typography>{data.clicks}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>⏳ Expiry</Typography>
            <Typography>{new Date(data.expiry).toLocaleString()}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">📌 Click Details</Typography>
            {data.clickData.length === 0 ? (
              <Typography>No clicks yet</Typography>
            ) : (
              data.clickData.map((click, i) => (
                <Card key={i} variant="outlined" sx={{ my: 1, p: 1 }}>
                  <Typography>🕒 {new Date(click.timestamp).toLocaleString()}</Typography>
                  <Typography>🌐 Referrer: {click.referrer}</Typography>
                  <Typography>📍 IP: {click.ip}</Typography>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

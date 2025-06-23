import { useState } from 'react';
import { Log } from '../utils/logger';
import {
  Container, Typography, TextField, Button, Grid, Card, CardContent, Alert
} from '@mui/material';
import axios from 'axios';

export default function ShortenerPage() {
  const [urlInputs, setUrlInputs] = useState([
    { url: '', validity: '', shortcode: '' }
  ]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (index, field, value) => {
    const newInputs = [...urlInputs];
    newInputs[index][field] = value;
    setUrlInputs(newInputs);
  };

  const addInputField = () => {
    if (urlInputs.length < 5) {
      setUrlInputs([...urlInputs, { url: '', validity: '', shortcode: '' }]);
    }
  };

  const handleSubmit = async () => {
    setResults([]);
    setError('');

    const promises = urlInputs.map(async (item) => {
      if (!item.url.startsWith('http')) {
        throw new Error('Invalid URL');
      }
      try{

        const res = await axios.post('http://localhost:5000/shorturls', {
          url: item.url,
          validity: item.validity ? Number(item.validity) : undefined,
          shortcode: item.shortcode || undefined
        });
        await Log("frontend", "info", "shortener", "URL shortened successfully");
        return res.data;
      } catch (err){
        await Log("frontend", "error", "shortener", err.message || "Failed to shorten URL");
      }

    });

    try {
      const data = await Promise.all(promises);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>

      {urlInputs.map((input, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Long URL"
                  value={input.url}
                  onChange={(e) => handleInputChange(index, 'url', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Validity (min)"
                  type="number"
                  value={input.validity}
                  onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Custom Shortcode"
                  value={input.shortcode}
                  onChange={(e) => handleInputChange(index, 'shortcode', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {urlInputs.length < 5 && (
        <Button variant="outlined" onClick={addInputField}>
          + Add Another URL
        </Button>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ ml: 2 }}
      >
        Shorten
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <Typography variant="h6">Results:</Typography>
          {results.map((r, i) => (
            <Card key={i} sx={{ mt: 1, p: 2 }}>
              <Typography>
                🔗 <a href={r.shortLink} target="_blank" rel="noopener noreferrer">{r.shortLink}</a>
              </Typography>
              <Typography>⏳ Expires At: {new Date(r.expiry).toLocaleString()}</Typography>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

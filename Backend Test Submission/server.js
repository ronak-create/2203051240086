const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const urlStore = {};
const clickStats = {};

app.post('/shorturls', (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const code = shortcode && /^[a-zA-Z0-9]{4,10}$/.test(shortcode)
    ? shortcode
    : uuidv4().slice(0, 6);

  const expiry = new Date(Date.now() + validity * 60000).toISOString();

  if (urlStore[code]) {
    return res.status(409).json({ error: 'Shortcode already in use' });
  }

  urlStore[code] = { url, expiry, createdAt: new Date().toISOString(), clicks: 0 };
  clickStats[code] = [];
  
  return res.status(201).json({
    shortLink: `http://localhost:${PORT}/${code}`,
    expiry
  });
});

app.get('/shorturls/:code', (req, res) => {
  const { code } = req.params;
  const data = urlStore[code];

  if (!data) return res.status(404).json({ error: 'Shortcode not found' });

  return res.json({
    originalUrl: data.url,
    expiry: data.expiry,
    clicks: data.clicks,
    clickData: clickStats[code] || []
  });
});

app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];

  if (!entry) return res.status(404).send('Short URL not found');

  if (new Date(entry.expiry) < new Date()) {
    return res.status(410).send('Link expired');
  }

  entry.clicks += 1;
  clickStats[code].push({
    timestamp: new Date().toISOString(),
    referrer: req.headers.referer || 'Direct',
    ip: req.ip
  });

  res.redirect(entry.url);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
